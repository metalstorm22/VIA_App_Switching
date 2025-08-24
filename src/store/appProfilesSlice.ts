import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {AppThunk, RootState} from './index';
import {getAppProfiles, getConfigurationProfile} from 'src/utils/device-store';
import {getSelectedConnectedDevice, getSelectedKeyboardAPI} from './devicesSlice';
import {getSelectedDefinition} from './definitionsSlice';
import {getMacroAPI} from 'src/utils/macro-api';
import {expressionToSequence, optimizedSequenceToRawSequence} from 'src/utils/macro-api/macro-api.common';

type ActiveApp = {bundleId: string; name: string};

type AppProfilesState = {
  enabled: boolean;
  mappings: Record<string, {profile: string; deviceVpid?: number}>;
  currentApp: ActiveApp | null;
  lastApplied?: {bundleId: string; profile: string} | null;
  toast?: {message: string; at: number} | null;
};

const initial = getAppProfiles() || {enabled: false, mappings: {}};

const initialState: AppProfilesState = {
  enabled: !!initial.enabled,
  mappings: initial.mappings || {},
  currentApp: null,
  lastApplied: null,
  toast: null,
};

const slice = createSlice({
  name: 'appProfiles',
  initialState,
  reducers: {
    setEnabled(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },
    setMappings(
      state,
      action: PayloadAction<Record<string, {profile: string; deviceVpid?: number}>>,
    ) {
      state.mappings = action.payload || {};
    },
    setCurrentApp(state, action: PayloadAction<ActiveApp | null>) {
      state.currentApp = action.payload;
    },
    setLastApplied(
      state,
      action: PayloadAction<{bundleId: string; profile: string} | null>,
    ) {
      state.lastApplied = action.payload;
    },
    showToast(state, action: PayloadAction<string>) {
      state.toast = {message: action.payload, at: Date.now()};
    },
    hideToast(state) {
      state.toast = null;
    },
  },
});

export const {setEnabled, setMappings, setCurrentApp, setLastApplied, showToast, hideToast} =
  slice.actions;

export default slice.reducer;

// Thunk: handle active app change and apply mapped macro profile if available
export const handleActiveAppChange =
  (app: ActiveApp): AppThunk =>
  async (dispatch, getState) => {
    dispatch(setCurrentApp(app));
    const state = getState();
    const {enabled, mappings, lastApplied} = state.appProfiles || initialState;
    if (!enabled) return;

    // 1) Skip switching when VIA app (Electron) is focused to avoid self-trigger + reload
    const name = (app?.name || '').toLowerCase();
    const bid = (app?.bundleId || '').toLowerCase();
    if (name.includes('electron') || name.includes('via') || bid.includes('electron') || bid.includes('via')) {
      return;
    }

    const device = getSelectedConnectedDevice(state);
    if (!device) {
      console.warn('No connected device selected; cannot apply profile');
      return;
    }

    // Resolve mapping considering optional device scoping
    let mapping: {profile: string; deviceVpid?: number} | undefined = mappings[app.bundleId];
    if (mapping && mapping.deviceVpid && mapping.deviceVpid !== device.vendorProductId) {
      mapping = undefined;
    }

    const profileName = mapping?.profile || 'Default';

    // 2) Avoid redundant re-application if already applied for this app/profile
    if (lastApplied && lastApplied.bundleId === app.bundleId && lastApplied.profile === profileName) {
      return;
    }

    const cfg = getConfigurationProfile(profileName);
    if (!cfg) {
      console.warn('No configuration profile stored for', profileName);
      return;
    }

    try {
      // 3) Apply directly to device without mutating Redux preview state
      const api = getSelectedKeyboardAPI(getState());
      const definition = getSelectedDefinition(getState());
      if (!api || !definition) {
        console.warn('Missing API/definition to apply profile silently');
        return;
      }
      const {matrix} = definition;
      await api.writeRawMatrix(matrix, cfg.layers);

      const macroApi = getMacroAPI(device.protocol, api);
      if (macroApi) {
        const sequences = cfg.macros.map((expression) => {
          const optimized = expressionToSequence(expression);
          return optimizedSequenceToRawSequence(optimized);
        });
        await macroApi.writeRawKeycodeSequences(sequences);
      }

      dispatch(setLastApplied({bundleId: app.bundleId, profile: profileName}));
      dispatch(showToast(`Applied profile "${profileName}" for ${app.name || app.bundleId}`));
    } catch (e) {
      console.warn('Failed to apply configuration profile silently', profileName, e);
    }
  };

export const getAppProfilesState = (state: RootState) => state.appProfiles;
