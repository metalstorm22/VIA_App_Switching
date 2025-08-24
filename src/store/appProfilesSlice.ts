import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {AppThunk, RootState} from './index';
import {getAppProfiles, getConfigurationProfile} from 'src/utils/device-store';
import {getSelectedConnectedDevice} from './devicesSlice';
import {saveMacros} from './macrosSlice';
import {saveRawKeymapToDevice} from './keymapSlice';

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
    const {enabled, mappings} = state.appProfiles || initialState;
    if (!enabled) return;

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
    const cfg = getConfigurationProfile(profileName);
    if (!cfg) {
      console.warn('No configuration profile stored for', profileName);
      return;
    }

    try {
      await (dispatch as any)(saveRawKeymapToDevice(cfg.layers, device) as any);
      await (dispatch as any)(saveMacros(device, cfg.macros) as any);
      dispatch(setLastApplied({bundleId: app.bundleId, profile: profileName}));
      dispatch(
        showToast(
          `Applied profile "${profileName}" for ${app.name || app.bundleId}`,
        ),
      );
    } catch (e) {
      console.warn('Failed to apply configuration profile', profileName, e);
    }
  };

export const getAppProfilesState = (state: RootState) => state.appProfiles;
