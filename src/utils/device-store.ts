import {current} from '@reduxjs/toolkit';
import {
  DefinitionVersionMap,
  getTheme,
  KeyboardDefinitionIndex,
  KeyboardDictionary,
  ThemeDefinition,
} from '@the-via/reader';
import {TestKeyboardSoundsMode} from 'src/components/void/test-keyboard-sounds';
import {THEMES} from 'src/utils/themes';
import {Store} from '../shims/via-app-store';
import type {
  AuthorizedDevice,
  DefinitionIndex,
  Settings,
  VendorProductIdMap,
} from '../types/types';
import {getVendorProductId} from './hid-keyboards';
let deviceStore: Store;
const defaultStoreData = {
  definitionIndex: {
    generatedAt: -1,
    hash: '',
    version: '2.0.0',
    theme: getTheme(),
    accentColor: '#ad7070',
    supportedVendorProductIdMap: {},
  },
  definitions: {},
  settings: {
    showDesignTab: false,
    disableFastRemap: false,
    renderMode: '2D' as const,
    themeMode: 'dark' as const,
    designDefinitionVersion: 'v3' as const,
    themeName: 'OLIVIA_DARK',
    macroEditor: {
      smartOptimizeEnabled: true,
      recordDelaysEnabled: false,
      tapEnterAtEOMEnabled: false,
    },
    testKeyboardSoundsSettings: {
      isEnabled: true,
      volume: 100,
      waveform: 'sine' as const,
      mode: TestKeyboardSoundsMode.WickiHayden,
      transpose: 0,
    },
  },
  appProfiles: {
    enabled: false,
    mappings: {},
  },
  macroProfiles: {},
};

function initDeviceStore() {
  deviceStore = new Store(defaultStoreData);
}

initDeviceStore();

// TODO: invalidate cache if we change cache structure

/** Retreives the latest definition index and invalidates the definition cache if a new one is found */
export async function syncStore(): Promise<DefinitionIndex> {
  const currentDefinitionIndex = deviceStore.get('definitionIndex');

  // TODO: fall back to cache if can't hit endpoint, notify user
  try {
    // Get hash file
    //    const hash = await (await fetch('/definitions/hash.json')).json();
    const hash = document.getElementById('definition_hash')?.dataset.hash || '';

    if (hash === currentDefinitionIndex.hash) {
      return currentDefinitionIndex;
    }
    // Get definition index file
    const response = await fetch('/definitions/supported_kbs.json', {
      cache: 'reload',
    });
    const json: KeyboardDefinitionIndex = await response.json();

    // TODO: maybe we should just export this shape from keyboards repo
    // v3 is a superset of v2 - if the def is avail in v2, it is also avail in v3
    const v2vpidMap = json.vendorProductIds.v2.reduce(
      (acc: VendorProductIdMap, id) => {
        acc[id] = acc[id] || {};
        acc[id].v2 = acc[id].v3 = true;
        return acc;
      },
      {},
    );

    const vpidMap = json.vendorProductIds.v3.reduce(
      (acc: VendorProductIdMap, def) => {
        acc[def] = acc[def] || {};
        acc[def].v3 = true;
        return acc;
      },
      v2vpidMap,
    );

    const newIndex = {
      ...json,
      hash,
      supportedVendorProductIdMap: vpidMap,
    };
    deviceStore.set('definitionIndex', newIndex);
    deviceStore.set('definitions', {});

    return newIndex;
  } catch (e) {
    console.warn(e);
  }

  return currentDefinitionIndex;
}

export const getMissingDefinition = async <
  K extends keyof DefinitionVersionMap,
>(
  device: AuthorizedDevice,
  version: K,
): Promise<[DefinitionVersionMap[K], K]> => {
  const vpid = getVendorProductId(device.vendorId, device.productId);
  const url = `/definitions/${version}/${vpid}.json`;
  const response = await fetch(url);
  const json: DefinitionVersionMap[K] = await response.json();
  let definitions = deviceStore.get('definitions');
  const newDefinitions = {
    ...definitions,
    [vpid]: {
      ...definitions[vpid],
      [version]: json,
    },
  };

  try {
    deviceStore.set('definitions', newDefinitions);
  } catch (err) {
    // This is likely due to running out of space, so we clear it
    localStorage.clear();
    initDeviceStore();
    definitions = deviceStore.get('definitions');
    deviceStore.set('definitions', {
      ...definitions,
      [vpid]: {
        ...definitions[vpid],
        [version]: json,
      },
    });
  }
  return [json, version];
};

export const getSupportedIdsFromStore = (): VendorProductIdMap =>
  deviceStore.get('definitionIndex')?.supportedVendorProductIdMap;

export const getDefinitionsFromStore = (): KeyboardDictionary =>
  deviceStore.get('definitions');

export const getThemeFromStore = (): ThemeDefinition =>
  THEMES[getThemeNameFromStore() as keyof typeof THEMES] ||
  deviceStore.get('definitionIndex')?.theme;

export const getThemeModeFromStore = (): 'dark' | 'light' => {
  return deviceStore.get('settings')?.themeMode;
};

export const getRenderModeFromStore = (): '3D' | '2D' => {
  return deviceStore.get('settings')?.renderMode;
};

export const getThemeNameFromStore = () => {
  return deviceStore.get('settings')?.themeName;
};

export const getSettings = (): Settings => deviceStore.get('settings');

export const setSettings = (settings: Settings) => {
  deviceStore.set('settings', current(settings));
};

// App Profiles store helpers
export const getAppProfiles = () => deviceStore.get('appProfiles');
export const setAppProfiles = (appProfiles: any) => deviceStore.set('appProfiles' as any, appProfiles as any);
export const setAppProfilesEnabled = (enabled: boolean) => {
  const ap = getAppProfiles() || {enabled: false, mappings: {}};
  setAppProfiles({...ap, enabled});
};
export const upsertAppProfileMapping = (bundleId: string, profile: {profile: string; deviceVpid?: number}) => {
  const ap = getAppProfiles() || {enabled: false, mappings: {}};
  setAppProfiles({
    ...ap,
    mappings: {
      ...ap.mappings,
      [bundleId]: profile,
    },
  });
};
export const removeAppProfileMapping = (bundleId: string) => {
  const ap = getAppProfiles() || {enabled: false, mappings: {}};
  const {[bundleId]: _, ...rest} = ap.mappings || {};
  setAppProfiles({...ap, mappings: rest});
};

// Macro profile storage (profile name -> array of macro expressions)
export const getAllMacroProfiles = (): Record<string, string[]> =>
  deviceStore.get('macroProfiles') || {};
export const getMacroProfile = (profile: string): string[] | undefined => {
  const all = getAllMacroProfiles();
  return all[profile];
};
export const setMacroProfile = (profile: string, expressions: string[]) => {
  const all = getAllMacroProfiles();
  deviceStore.set('macroProfiles' as any, {...all, [profile]: expressions} as any);
};
export const deleteMacroProfile = (profile: string) => {
  const all = getAllMacroProfiles();
  const {[profile]: _removed, ...rest} = all;
  deviceStore.set('macroProfiles' as any, rest as any);
  // Remove any app mappings that referenced this profile
  const ap = getAppProfiles() || {enabled: false, mappings: {}};
  const filtered = Object.fromEntries(
    Object.entries(ap.mappings || {}).filter(([, v]: any) => v?.profile !== profile),
  );
  setAppProfiles({...ap, mappings: filtered});
};
export const renameMacroProfile = (oldName: string, newName: string) => {
  if (!newName || oldName === newName) return;
  const all = getAllMacroProfiles();
  if (!all[oldName]) return;
  const { [oldName]: exprs, ...rest } = all as any;
  deviceStore.set('macroProfiles' as any, {...rest, [newName]: exprs} as any);
  // Update mappings to point to the new profile name
  const ap = getAppProfiles() || {enabled: false, mappings: {}};
  const updated = Object.fromEntries(
    Object.entries(ap.mappings || {}).map(([k, v]: any) => [
      k,
      v?.profile === oldName ? {...v, profile: newName} : v,
    ]),
  );
  setAppProfiles({...ap, mappings: updated});
};
