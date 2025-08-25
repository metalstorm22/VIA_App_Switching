import type {KeyboardAPI} from './keyboard-api';

/**
 * Enumerate all encoder IDs defined in a keyboard definition.
 * Scans base keys and all layout option keys for entries with an `ei` field.
 * Returns a sorted list of unique encoder IDs.
 */
export function enumerateEncoderIds(definition: any): number[] {
  try {
    const layouts = definition?.layouts || {};
    const ids: number[] = [];

    const pushIfEncoder = (k: any) => {
      if (k && typeof k.ei === 'number' && k.ei >= 0) ids.push(k.ei);
    };

    // Base keys
    const keys: any[] = Array.isArray(layouts.keys) ? layouts.keys : [];
    keys.forEach(pushIfEncoder);

    // Option keys: object of { [layoutIndex]: { [optionIndex]: VIAKey[] } }
    const optionKeys: any = layouts.optionKeys || {};
    Object.values(optionKeys).forEach((options: any) => {
      Object.values(options || {}).forEach((arr: any) => {
        (Array.isArray(arr) ? arr : []).forEach(pushIfEncoder);
      });
    });

    // Unique sorted
    return Array.from(new Set(ids)).sort((a, b) => a - b);
  } catch {
    return [];
  }
}

/**
 * Read encoder mappings from the device for all discovered encoder IDs across all layers.
 * Returns an array indexed by encoderId, where each entry is an array indexed by layer,
 * and each layer entry is [ccwKeycode, cwKeycode].
 *
 * Shape: encoders[encoderId][layer] = [ccw, cw]
 */
export async function readEncoderValues(
  api: KeyboardAPI,
  definition: any,
  layerCount: number,
): Promise<[number, number][][]> {
  try {
    const protocol = await api.getProtocolVersion();
    if (protocol < 10) return [];

    const ids = enumerateEncoderIds(definition);
    if (!ids.length || layerCount <= 0) return [];

    const maxId = Math.max(...ids);
    const result: [number, number][][] = new Array(Math.max(0, maxId + 1))
      .fill(0)
      .map(() => []);

    // Fill only known encoder IDs, leave others as empty arrays for index alignment
    await Promise.all(
      ids.map(async (encoderId) => {
        const perLayer: [number, number][] = await Promise.all(
          Array(layerCount)
            .fill(0)
            .map(async (_v, layer) => {
              const [ccw, cw] = await Promise.all([
                api.getEncoderValue(layer, encoderId, false),
                api.getEncoderValue(layer, encoderId, true),
              ]);
              return [ccw, cw] as [number, number];
            }),
        );
        result[encoderId] = perLayer;
      }),
    );

    return result;
  } catch {
    return [];
  }
}

/**
 * Apply encoder mappings to the device.
 * Accepts the same shape produced by readEncoderValues:
 * encoders[encoderId][layer] = [ccwKeycode, cwKeycode]
 */
export async function applyEncoderValues(
  api: KeyboardAPI,
  encoders: [number, number][][] | undefined,
): Promise<void> {
  if (!encoders || encoders.length === 0) return;

  try {
    const protocol = await api.getProtocolVersion();
    if (protocol < 10) return;

    for (let encoderId = 0; encoderId < encoders.length; encoderId++) {
      const perLayer = encoders[encoderId];
      if (!perLayer || perLayer.length === 0) continue;

      for (let layer = 0; layer < perLayer.length; layer++) {
        const pair = perLayer[layer];
        if (!pair || pair.length !== 2) continue;

        const [ccw, cw] = pair;
        // Guard against NaN/undefined
        if (typeof ccw === 'number') {
          await api.setEncoderValue(layer, encoderId, false, ccw);
        }
        if (typeof cw === 'number') {
          await api.setEncoderValue(layer, encoderId, true, cw);
        }
      }
    }
  } catch {
    // Best-effort; ignore errors to avoid breaking profile application
  }
}