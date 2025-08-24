import React, {useEffect, useMemo, useRef, useState} from 'react';
import styled from 'styled-components';
import {useDispatch} from 'react-redux';
import {AccentSelect} from 'src/components/inputs/accent-select';
import {AccentButton, PrimaryAccentButton} from 'src/components/inputs/accent-button';
import TextInput from 'src/components/inputs/text-input';
import {ModalContainer, PromptText} from 'src/components/inputs/dialog-base';
import {useAppSelector} from 'src/store/hooks';
import {getExpressions} from 'src/store/macrosSlice';
import {getSelectedRawLayers} from 'src/store/keymapSlice';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {
  setEnabled as setEnabledRedux,
  setMappings as setMappingsRedux,
} from 'src/store/appProfilesSlice';
import {
  getAppProfiles,
  setAppProfilesEnabled,
  upsertAppProfileMapping,
  removeAppProfileMapping,
  getAllConfigurationProfiles,
  setConfigurationProfile,
  deleteConfigurationProfile,
  renameConfigurationProfile,
} from 'src/utils/device-store';

const Container = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Card = styled.div`
  background: var(--bg_menu);
  border: 1px solid var(--bg_control);
  border-radius: 10px;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h3`
  margin: 0;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  flex-wrap: wrap;
`;

const TabsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const TabButton = styled.button<{active?: boolean}>`
  appearance: none;
  border: 1px solid ${(p) => (p.active ? 'var(--color_accent)' : 'var(--bg_control)')};
  background: ${(p) => (p.active ? 'var(--bg_control)' : 'transparent')};
  color: var(--color_label-highlighted);
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;

  &:hover {
    border-color: var(--color_accent);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 12px 0 4px 0;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--bg_control);
  color: var(--color_label-highlighted);
  font-size: 12px;
`;

const Mono = styled.div`
  font-family: monospace;
  font-size: 12px;
  opacity: 0.9;
`;

const Subtle = styled.div`
  opacity: 0.9;
  font-size: 12px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--bg_control);
  margin: 8px 0;
`;

const DialogContainer = styled.dialog`
  padding: 0;
  border-width: 0;
  background: transparent;

  &::backdrop {
    background: rgba(0, 0, 0, 0.75);
  }

  & > div {
    transition: transform 0.2s ease-out;
    transform: translateY(-20px);
  }

  &[open] > div {
    transform: translateY(0px);
  }
`;

/**
 * ConfirmDialog
 */
type ConfirmDialogProps = {
  isOpen: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm(): void;
  onCancel(): void;
};
const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (props.isOpen) ref.current.showModal();
    else ref.current.close();
    return () => {
      try {
        ref.current?.close();
      } catch {}
    };
  }, [props.isOpen]);

  return (
    <DialogContainer ref={ref}>
      <ModalContainer>
        <PromptText>{props.message}</PromptText>
        <Row style={{justifyContent: 'center', marginTop: 12}}>
          <PrimaryAccentButton onClick={props.onConfirm}>
            {props.confirmLabel || 'Confirm'}
          </PrimaryAccentButton>
          <AccentButton onClick={props.onCancel}>
            {props.cancelLabel || 'Cancel'}
          </AccentButton>
        </Row>
      </ModalContainer>
    </DialogContainer>
  );
};

/**
 * NameDialog
 */
type NameDialogProps = {
  isOpen: boolean;
  title: string;
  initialValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm(name: string): void;
  onCancel(): void;
};
const NameDialog: React.FC<NameDialogProps> = (props) => {
  const ref = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(props.initialValue || '');

  useEffect(() => {
    setValue(props.initialValue || '');
  }, [props.initialValue]);

  useEffect(() => {
    if (!ref.current) return;
    if (props.isOpen) ref.current.showModal();
    else ref.current.close();
    return () => {
      try {
        ref.current?.close();
      } catch {}
    };
  }, [props.isOpen]);

  return (
    <DialogContainer ref={ref}>
      <ModalContainer>
        <PromptText>{props.title}</PromptText>
        <div style={{width: 320}}>
          <TextInput
            value={value}
            placeholder={props.placeholder || 'Name'}
            onChange={(e: any) => setValue(e.target.value)}
            style={{width: '100%'}}
          />
        </div>
        <Row style={{justifyContent: 'center', marginTop: 12}}>
          <PrimaryAccentButton
            onClick={() => {
              const name = (value || '').trim();
              if (!name) return;
              props.onConfirm(name);
            }}
          >
            {props.confirmLabel || 'Confirm'}
          </PrimaryAccentButton>
          <AccentButton onClick={props.onCancel}>
            {props.cancelLabel || 'Cancel'}
          </AccentButton>
        </Row>
      </ModalContainer>
    </DialogContainer>
  );
};

type InstalledApp = {bundleId: string; name: string; path: string};

export const AppProfilesTabbedView: React.FC = () => {
  const dispatchRedux = useDispatch();

  // Global enable + mappings persisted in device-store
  const [enabled, setEnabled] = useState<boolean>(getAppProfiles()?.enabled || false);
  const [mappings, setMappings] = useState<Record<string, {profile: string; deviceVpid?: number}>>(
    () => getAppProfiles()?.mappings || {},
  );
  const mappingEntries = useMemo(() => Object.entries(mappings || {}), [mappings]);

  // Current app + installed apps
  const [currentApp, setCurrentApp] = useState<{bundleId: string; name: string} | null>(null);
  const [availableApps, setAvailableApps] = useState<InstalledApp[]>([]);
  const [selectedBundleId, setSelectedBundleId] = useState<string>('');

  const nameByBundleId = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of availableApps) map.set(a.bundleId, a.name);
    if (currentApp) map.set(currentApp.bundleId, currentApp.name);
    return map;
  }, [availableApps, currentApp]);

  // Selected device for optional binding
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const [bindToDevice, setBindToDevice] = useState<boolean>(true);

  // Profiles (configuration, i.e., keymaps + macros)
  const [configurationProfiles, setConfigurationProfiles] = useState<
    Record<string, {layers: number[][]; macros: string[]}>
  >(() => getAllConfigurationProfiles() || {});
  const profileNames = useMemo(() => Object.keys(configurationProfiles || {}), [configurationProfiles]);

  // For saving current config
  const [newProfileName, setNewProfileName] = useState('Default');
  const currentExpressions = useAppSelector(getExpressions);
  const layers = useAppSelector(getSelectedRawLayers);
  const currentLayers = useMemo(
    () => (layers || []).map((l) => ((l && l.keymap) || []) as number[]),
    [layers],
  );

  // For Add Mapping flow
  const [addProfileName, setAddProfileName] = useState<string>('Default');

  // Search
  const [mappingSearch, setMappingSearch] = useState('');
  const [profileSearch, setProfileSearch] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState<'mappings' | 'profiles'>('mappings');

  // Dialog state
  const [deleteMappingTarget, setDeleteMappingTarget] = useState<string | null>(null);
  const [renameProfileTarget, setRenameProfileTarget] = useState<string | null>(null);
  const [deleteProfileTarget, setDeleteProfileTarget] = useState<string | null>(null);

  // Effects: prime current app and subscribe to changes
  useEffect(() => {
    let retries = 10;
    const tryPrime = () => {
      (window as any).desktop?.getActiveApp?.()
        ?.then((data: any) => {
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

    const unsubscribe = (window as any).desktop?.onActiveAppChanged?.((data: any) => {
      setCurrentApp(data);
      if (enabled && mappings[data.bundleId]) {
        // In future we could show a toast here or surface more info
        try {
          console.log('App switch match:', data, mappings[data.bundleId]);
        } catch {}
      }
    });
    return () => {
      try {
        unsubscribe && unsubscribe();
      } catch {}
    };
  }, [enabled, mappings]);

  // Effects: load available applications
  useEffect(() => {
    (window as any).desktop
      ?.listApps?.()
      ?.then((apps: InstalledApp[]) => setAvailableApps(apps || []))
      ?.catch(() => setAvailableApps([]));
  }, []);

  // Helpers
  const refreshMappingsAfterMutation = () => {
    const updated = getAppProfiles()?.mappings || {};
    setMappings(updated);
    dispatchRedux(setMappingsRedux(updated));
  };

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    setAppProfilesEnabled(next);
    dispatchRedux(setEnabledRedux(next));
  };

  const addMapping = () => {
    const bid = selectedBundleId || currentApp?.bundleId;
    if (!bid) return;
    const prof = (addProfileName || 'Default').trim() || 'Default';
    upsertAppProfileMapping(bid, {
      profile: prof,
      deviceVpid:
        bindToDevice &&
        selectedDevice &&
        typeof selectedDevice === 'object' &&
        'vendorProductId' in (selectedDevice as any)
          ? (selectedDevice as any).vendorProductId
          : undefined,
    });
    refreshMappingsAfterMutation();
  };

  const saveCurrentAsProfile = () => {
    const name = (newProfileName || 'Default').trim();
    if (!name) return;
    setConfigurationProfile(name, {layers: currentLayers, macros: currentExpressions});
    setConfigurationProfiles(getAllConfigurationProfiles());
  };

  const filteredMappingEntries = useMemo(() => {
    const q = (mappingSearch || '').toLowerCase();
    if (!q) return mappingEntries;
    return mappingEntries.filter(([bundleId]) => {
      const display = nameByBundleId.get(bundleId) || '';
      return display.toLowerCase().includes(q);
    });
  }, [mappingEntries, mappingSearch, nameByBundleId]);

  const filteredProfileEntries = useMemo(() => {
    const q = (profileSearch || '').toLowerCase();
    const entries = Object.entries(configurationProfiles || {});
    if (!q) return entries;
    return entries.filter(([name]) => name.toLowerCase().includes(q));
  }, [configurationProfiles, profileSearch]);

  return (
    <Container>
      <Card>
        <Header>
          <Title>App Profiles (Mac)</Title>
          <label>
            <input type="checkbox" checked={enabled} onChange={toggleEnabled} /> Enable app profiles
          </label>
        </Header>
        <Row>
          <span style={{opacity: 0.8}}>Current app:</span>
          <Chip>{currentApp ? currentApp.name : 'Unknown app'}</Chip>
          <AccentButton
            onClick={() =>
              (window as any).desktop
                ?.listApps?.()
                ?.then((apps: InstalledApp[]) => setAvailableApps(apps || []))
                ?.catch(() => setAvailableApps([]))
            }
          >
            Reload apps
          </AccentButton>
          <Spacer />
          <TabsBar>
            <TabButton active={activeTab === 'mappings'} onClick={() => setActiveTab('mappings')}>
              Mappings
            </TabButton>
            <TabButton active={activeTab === 'profiles'} onClick={() => setActiveTab('profiles')}>
              Profiles
            </TabButton>
          </TabsBar>
        </Row>
      </Card>

      {activeTab === 'mappings' && (
        <Card>
          <SectionHeader>
            <Title style={{fontSize: 16, margin: 0}}>Mappings</Title>
            <Subtle>Total: {mappingEntries.length}</Subtle>
          </SectionHeader>

          <Row>
            <div style={{minWidth: 280, flex: 1}}>
              <AccentSelect
                placeholder="Choose app…"
                options={availableApps.map((a) => ({
                  value: a.bundleId,
                  label: a.name,
                }))}
                onChange={(opt: any) => setSelectedBundleId(opt?.value || '')}
                isClearable
              />
            </div>
            <div style={{minWidth: 220}}>
              <AccentSelect
                placeholder="Choose profile…"
                options={profileNames.map((n) => ({value: n, label: n}))}
                value={addProfileName ? {value: addProfileName, label: addProfileName} : null}
                onChange={(opt: any) => setAddProfileName(opt?.value || 'Default')}
                isClearable
              />
            </div>
            <label style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
              <input
                type="checkbox"
                checked={bindToDevice}
                onChange={() => setBindToDevice((v) => !v)}
              />
              Only for this device
            </label>
            <PrimaryAccentButton onClick={addMapping} disabled={!selectedBundleId && !currentApp?.bundleId}>
              Add mapping
            </PrimaryAccentButton>
          </Row>

          <Row>
            <div style={{minWidth: 280, flex: 1}}>
              <TextInput
                placeholder="Search apps…"
                value={mappingSearch}
                onChange={(e: any) => setMappingSearch(e.target.value)}
                style={{width: '100%', margin: 0}}
              />
            </div>
          </Row>

          <Divider />

          {filteredMappingEntries.length === 0 && (
            <Subtle>No mappings yet</Subtle>
          )}

          {filteredMappingEntries.map(([bundleId, value]) => (
            <Row key={bundleId} style={{alignItems: 'stretch'}}>
              <div style={{flex: 1}}>
                <strong>{nameByBundleId.get(bundleId) || 'Unknown app'}</strong>
                <Subtle>
                  {value.deviceVpid ? (
                    <>
                      Only for device <strong>{value.deviceVpid}</strong>
                    </>
                  ) : (
                    'Any device'
                  )}
                </Subtle>
              </div>
              <div style={{minWidth: 220}}>
                <AccentSelect
                  options={profileNames.map((n) => ({value: n, label: n}))}
                  value={{value: value.profile, label: value.profile}}
                  onChange={(opt: any) => {
                    upsertAppProfileMapping(bundleId, {
                      ...value,
                      profile: opt?.value || value.profile,
                    });
                    refreshMappingsAfterMutation();
                  }}
                />
              </div>
              <AccentButton onClick={() => setDeleteMappingTarget(bundleId)}>Remove mapping</AccentButton>
            </Row>
          ))}
        </Card>
      )}

      {activeTab === 'profiles' && (
        <Card>
          <SectionHeader>
            <Title style={{fontSize: 16, margin: 0}}>Configuration Profiles</Title>
            <Subtle>Total: {profileNames.length}</Subtle>
          </SectionHeader>

          <Row>
            <div style={{minWidth: 220}}>
              <TextInput
                placeholder="Profile name"
                value={newProfileName}
                onChange={(e: any) => setNewProfileName(e.target.value)}
                style={{width: '100%', margin: 0}}
              />
            </div>
            <PrimaryAccentButton onClick={saveCurrentAsProfile}>
              Save current as profile
            </PrimaryAccentButton>
            <Spacer />
            <div style={{minWidth: 280}}>
              <TextInput
                placeholder="Search profiles…"
                value={profileSearch}
                onChange={(e: any) => setProfileSearch(e.target.value)}
                style={{width: '100%', margin: 0}}
              />
            </div>
          </Row>

          <Divider />

          {Object.keys(configurationProfiles).length === 0 && (
            <Subtle>No configuration profiles yet</Subtle>
          )}

          {filteredProfileEntries.map(([name, cfg]) => (
            <Row key={name}>
              <strong style={{minWidth: 140}}>{name}</strong>
              <Subtle style={{flex: 1}}>
                layers: {cfg.layers?.length || 0} • macros: {cfg.macros?.length || 0}
              </Subtle>
              <AccentButton
                onClick={() => setRenameProfileTarget(name)}
                disabled={name === 'Default'}
              >
                Rename
              </AccentButton>
              <AccentButton
                onClick={() => setDeleteProfileTarget(name)}
                disabled={name === 'Default'}
              >
                Delete
              </AccentButton>
            </Row>
          ))}
        </Card>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={!!deleteMappingTarget}
        message={
          deleteMappingTarget
            ? `Remove mapping for "${nameByBundleId.get(deleteMappingTarget) || 'this app'}"?`
            : 'Remove mapping?'
        }
        onConfirm={() => {
          if (!deleteMappingTarget) return;
          removeAppProfileMapping(deleteMappingTarget);
          refreshMappingsAfterMutation();
          setDeleteMappingTarget(null);
        }}
        onCancel={() => setDeleteMappingTarget(null)}
      />

      <NameDialog
        isOpen={!!renameProfileTarget}
        title={
          renameProfileTarget ? `Rename configuration profile "${renameProfileTarget}"` : 'Rename'
        }
        initialValue={renameProfileTarget || ''}
        placeholder="New name"
        confirmLabel="Rename"
        onConfirm={(nextName) => {
          const oldName = renameProfileTarget;
          if (!oldName) return;
          if (!nextName || nextName === oldName) {
            setRenameProfileTarget(null);
            return;
          }
          renameConfigurationProfile(oldName, nextName);
          setConfigurationProfiles(getAllConfigurationProfiles());
          // mappings may update profile name references as well
          refreshMappingsAfterMutation();
          setRenameProfileTarget(null);
        }}
        onCancel={() => setRenameProfileTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteProfileTarget}
        message={
          deleteProfileTarget
            ? `Delete configuration profile "${deleteProfileTarget}"?`
            : 'Delete profile?'
        }
        onConfirm={() => {
          const target = deleteProfileTarget;
          if (!target || target === 'Default') {
            setDeleteProfileTarget(null);
            return;
          }
          deleteConfigurationProfile(target);
          setConfigurationProfiles(getAllConfigurationProfiles());
          refreshMappingsAfterMutation();
          setDeleteProfileTarget(null);
        }}
        onCancel={() => setDeleteProfileTarget(null)}
      />
    </Container>
  );
};

export default AppProfilesTabbedView;