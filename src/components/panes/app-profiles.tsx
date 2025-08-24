import {useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';
import {
  getAppProfiles,
  setAppProfilesEnabled,
  upsertAppProfileMapping,
  removeAppProfileMapping,
} from 'src/utils/device-store';

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
  const [enabled, setEnabled] = useState<boolean>(getAppProfiles()?.enabled || false);
  const [mappings, setMappings] = useState(() => getAppProfiles()?.mappings || {});
  const [currentApp, setCurrentApp] = useState<{bundleId: string; name: string} | null>(null);
  const mappingEntries = useMemo(() => Object.entries(mappings || {}), [mappings]);

  useEffect(() => {
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

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    setAppProfilesEnabled(next);
  };

  const addCurrentApp = () => {
    if (!currentApp?.bundleId) return;
    upsertAppProfileMapping(currentApp.bundleId, {profile: 'Default'});
    const updated = getAppProfiles()?.mappings || {};
    setMappings(updated);
  };

  const removeMapping = (bundleId: string) => {
    removeAppProfileMapping(bundleId);
    const updated = getAppProfiles()?.mappings || {};
    setMappings(updated);
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
        <button onClick={addCurrentApp} disabled={!currentApp?.bundleId}>Map current app to "Default"</button>
      </Row>
      <List>
        <h3>Mappings</h3>
        {mappingEntries.length === 0 && <div style={{opacity: 0.8}}>No mappings yet</div>}
        {mappingEntries.map(([bundleId, value]) => (
          <Row key={bundleId}>
            <code style={{flex: 1}}>{bundleId}</code>
            <span>→ {value.profile}</span>
            <button onClick={() => removeMapping(bundleId)}>Remove</button>
          </Row>
        ))}
      </List>
      <p style={{marginTop: 16, opacity: 0.8}}>
        Note: This is a minimal MVP. Applying profiles to devices will be added next.
      </p>
    </Container>
  );
}

