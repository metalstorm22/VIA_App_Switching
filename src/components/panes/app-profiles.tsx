import {useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';
import {
  getAppProfiles,
  setAppProfilesEnabled,
  upsertAppProfileMapping,
  removeAppProfileMapping,
  getAllMacroProfiles,
  setMacroProfile,
  deleteMacroProfile,
  renameMacroProfile,
} from 'src/utils/device-store';
import {useAppSelector} from 'src/store/hooks';
import {getExpressions} from 'src/store/macrosSlice';
import {useDispatch} from 'react-redux';
import {setEnabled as setEnabledRedux, setMappings as setMappingsRedux} from 'src/store/appProfilesSlice';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';

const Container = styled.div`
  padding: 16px;
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
`;
const List = styled.div`
  margin-top: 12px;
`;

export function AppProfilesPane() {
  const dispatchRedux = useDispatch();
  const [enabled, setEnabled] = useState<boolean>(getAppProfiles()?.enabled || false);
  const [mappings, setMappings] = useState(() => getAppProfiles()?.mappings || {});
  const [currentApp, setCurrentApp] = useState<{bundleId: string; name: string} | null>(null);
  const [macroProfiles, setMacroProfiles] = useState<Record<string, string[]>>(
    () => getAllMacroProfiles() || {},
  );
  const currentExpressions = useAppSelector(getExpressions);
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const [bindToDevice, setBindToDevice] = useState<boolean>(true);
  const [newProfileName, setNewProfileName] = useState('Default');
  const profileNames = useMemo(() => Object.keys(macroProfiles), [macroProfiles]);
  const mappingEntries = useMemo(() => Object.entries(mappings || {}), [mappings]);
  const [availableApps, setAvailableApps] = useState<Array<{bundleId: string; name: string; path: string}>>([]);
  const [selectedBundleId, setSelectedBundleId] = useState<string>('');

  useEffect(() => {
    // Prime current app with a few retries in case IPC isn't ready yet
    let retries = 10;
    const tryPrime = () => {
      window.desktop?.getActiveApp?.()
        .then((data) => {
          if (data && data.bundleId) {
            setCurrentApp(data);
          } else if (retries > 0) {
            retries -= 1;
            setTimeout(tryPrime, 300);
          }
        })
        .catch(() => {
          if (retries > 0) {
            retries -= 1;
            setTimeout(tryPrime, 300);
          }
        });
    };
    tryPrime();
    const unsubscribe = window.desktop?.onActiveAppChanged?.((data) => {
      setCurrentApp(data);
      // Minimal demo action: if enabled and mapping exists, just log it
      if (enabled && mappings[data.bundleId]) {
        console.log('App switch match:', data, mappings[data.bundleId]);
      }
    });
    return () => {
      try { unsubscribe && unsubscribe(); } catch {}
    };
  }, [enabled, mappings]);

  useEffect(() => {
    // Load available applications for dropdown mapping
    window.desktop?.listApps?.()
      .then((apps) => setAvailableApps(apps || []))
      .catch(() => setAvailableApps([]));
  }, []);

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    setAppProfilesEnabled(next);
    dispatchRedux(setEnabledRedux(next));
  };

  const addCurrentApp = () => {
    if (!currentApp?.bundleId) return;
    upsertAppProfileMapping(currentApp.bundleId, {
      profile: newProfileName || 'Default',
      deviceVpid: bindToDevice ? selectedDevice?.vendorProductId : undefined,
    });
    const updated = getAppProfiles()?.mappings || {};
    setMappings(updated);
    dispatchRedux(setMappingsRedux(updated));
  };

  const addSelectedApp = () => {
    const bid = selectedBundleId || currentApp?.bundleId;
    if (!bid) return;
    upsertAppProfileMapping(bid, {
      profile: newProfileName || 'Default',
      deviceVpid: bindToDevice ? selectedDevice?.vendorProductId : undefined,
    });
    const updated = getAppProfiles()?.mappings || {};
    setMappings(updated);
    dispatchRedux(setMappingsRedux(updated));
  };

  const saveCurrentAsProfile = () => {
    const name = (newProfileName || 'Default').trim();
    if (!name) return;
    setMacroProfile(name, currentExpressions);
    setMacroProfiles(getAllMacroProfiles());
  };

  const removeMapping = (bundleId: string) => {
    removeAppProfileMapping(bundleId);
    const updated = getAppProfiles()?.mappings || {};
    setMappings(updated);
    dispatchRedux(setMappingsRedux(updated));
  };

  return (
    <Container>
      <h2>App Profiles (Mac)</h2>
      <p>Automatically switch profiles based on the active app.</p>
      <Row>
        <label>
          <input type="checkbox" checked={enabled} onChange={toggleEnabled} /> Enable app-aware switching
        </label>
      </Row>
      <Row>
        <div style={{opacity: 0.8}}>
          Current app: {currentApp ? `${currentApp.name} (${currentApp.bundleId})` : 'Unknown'}
        </div>
        <input
          placeholder="Profile name"
          value={newProfileName}
          onChange={(e) => setNewProfileName(e.target.value)}
          style={{minWidth: 160}}
        />
        <button onClick={saveCurrentAsProfile}>Save current macros as profile</button>
        <button onClick={addCurrentApp} disabled={!currentApp?.bundleId}>
          Map current app → {newProfileName || 'Default'}
        </button>
        <select
          value={selectedBundleId}
          onChange={(e) => setSelectedBundleId(e.target.value)}
          style={{minWidth: 240}}
        >
          <option value="">Select installed app…</option>
          {availableApps.map((a) => (
            <option key={a.bundleId} value={a.bundleId}>
              {a.name} ({a.bundleId})
            </option>
          ))}
        </select>
        <button onClick={addSelectedApp} disabled={!selectedBundleId && !currentApp?.bundleId}>Map selected app</button>
      </Row>
      <Row>
        <label>
          <input
            type="checkbox"
            checked={bindToDevice}
            onChange={() => setBindToDevice((v) => !v)}
          />{' '}
          Bind mapping to selected device
        </label>
        <div style={{opacity: 0.8}}>
          Selected device:{' '}
          {selectedDevice
            ? `${selectedDevice.productName} (vpid ${selectedDevice.vendorProductId})`
            : 'None'}
        </div>
      </Row>
      <List>
        <h3>Mappings</h3>
        {mappingEntries.length === 0 && <div style={{opacity: 0.8}}>No mappings yet</div>}
        {mappingEntries.map(([bundleId, value]) => (
          <Row key={bundleId}>
            <div style={{flex: 1}}>
              <div style={{fontFamily: 'monospace'}}>{bundleId}</div>
              <div style={{opacity: 0.8, fontSize: 12}}>
                {value.deviceVpid ? `Bound to vpid ${value.deviceVpid}` : 'Any device'}
              </div>
            </div>
            <select
              value={value.profile}
              onChange={(e) => {
                upsertAppProfileMapping(bundleId, {
                  ...value,
                  profile: e.target.value,
                });
                const updated = getAppProfiles()?.mappings || {};
                setMappings(updated);
                dispatchRedux(setMappingsRedux(updated));
              }}
            >
              {profileNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button onClick={() => removeMapping(bundleId)}>Remove</button>
          </Row>
        ))}
        <h3 style={{marginTop: 16}}>Macro Profiles</h3>
        {Object.keys(macroProfiles).length === 0 && (
          <div style={{opacity: 0.8}}>No macro profiles saved yet</div>
        )}
        {Object.entries(macroProfiles).map(([name, exprs]) => (
          <Row key={name}>
            <strong style={{minWidth: 140}}>{name}</strong>
            <span style={{opacity: 0.8, flex: 1}}>macros: {exprs.length}</span>
            <button
              onClick={() => {
                const next = prompt('Rename profile', name) || '';
                if (!next || next === name) return;
                renameMacroProfile(name, next);
                setMacroProfiles(getAllMacroProfiles());
                const updated = getAppProfiles()?.mappings || {};
                setMappings(updated);
                dispatchRedux(setMappingsRedux(updated));
              }}
            >
              Rename
            </button>
            <button
              onClick={() => {
                if (!confirm(`Delete profile "${name}"?`)) return;
                deleteMacroProfile(name);
                setMacroProfiles(getAllMacroProfiles());
                const updated = getAppProfiles()?.mappings || {};
                setMappings(updated);
                dispatchRedux(setMappingsRedux(updated));
              }}
            >
              Delete
            </button>
          </Row>
        ))}
      </List>
      <p style={{marginTop: 16, opacity: 0.8}}>
        Flow: Save current macros as a named profile, map apps to profiles (optionally device-bound), and profiles auto-apply on app switch.
      </p>
    </Container>
  );
}
