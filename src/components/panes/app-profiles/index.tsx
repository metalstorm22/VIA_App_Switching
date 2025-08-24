import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { getExpressions } from 'src/store/macrosSlice';
import {
  setEnabled as setEnabledRedux,
  setMappings as setMappingsRedux,
} from 'src/store/appProfilesSlice';
import { getSelectedConnectedDevice } from 'src/store/devicesSlice';
import { getSelectedRawLayers } from 'src/store/keymapSlice';
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

// Components
import { AppProfilesHeader } from './components/AppProfilesHeader';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { SearchBar } from './components/SearchBar';
import { AppMappingCard } from './components/AppMappingCard';
import { ProfileCard } from './components/ProfileCard';
import { EmptyState } from './components/EmptyState';
import { CreateMappingDialog } from './dialogs/CreateMappingDialog';

// Styles
import {
  Container,
  ContentArea,
  Grid,
} from './app-profiles.styles';

export function AppProfilesPane() {
  const dispatch = useDispatch();
  
  // Redux state
  const currentExpressions = useAppSelector(getExpressions);
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const layers = useAppSelector(getSelectedRawLayers);
  const currentLayers = useMemo(
    () => (layers || []).map((l) => ((l && l.keymap) || []) as number[]),
    [layers]
  );
  
  // Local state
  const [enabled, setEnabled] = useState<boolean>(getAppProfiles()?.enabled || false);
  const [mappings, setMappings] = useState(() => getAppProfiles()?.mappings || {});
  const [currentApp, setCurrentApp] = useState<{bundleId: string; name: string} | null>(null);
  const [macroProfiles, setMacroProfiles] = useState<Record<string, {layers: number[][]; macros: string[]}>>(
    () => getAllConfigurationProfiles() || {},
  );
  const [availableApps, setAvailableApps] = useState<Array<{bundleId: string; name: string; path: string}>>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('mappings');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateMappingOpen, setIsCreateMappingOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  
  const profileNames = useMemo(() => Object.keys(macroProfiles), [macroProfiles]);
  const mappingEntries = useMemo(() => Object.entries(mappings || {}), [mappings]);
  
  // Filter based on search
  const filteredMappings = useMemo(() => {
    if (!searchTerm) return mappingEntries;
    const term = searchTerm.toLowerCase();
    return mappingEntries.filter(([bundleId, _]) => 
      bundleId.toLowerCase().includes(term) ||
      availableApps.find(app => 
        app.bundleId === bundleId && 
        app.name.toLowerCase().includes(term)
      )
    );
  }, [mappingEntries, searchTerm, availableApps]);
  
  const filteredProfiles = useMemo(() => {
    if (!searchTerm) return Object.entries(macroProfiles);
    const term = searchTerm.toLowerCase();
    return Object.entries(macroProfiles).filter(([name, _]) => 
      name.toLowerCase().includes(term)
    );
  }, [macroProfiles, searchTerm]);
  
  // Effects
  useEffect(() => {
    // Prime current app with retries
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
    
    // Subscribe to app changes
    const unsubscribe = window.desktop?.onActiveAppChanged?.((data) => {
      setCurrentApp(data);
      if (enabled && mappings[data.bundleId]) {
        console.log('App switch match:', data, mappings[data.bundleId]);
      }
    });
    
    return () => {
      try { unsubscribe && unsubscribe(); } catch {}
    };
  }, [enabled, mappings]);
  
  useEffect(() => {
    // Load available applications
    window.desktop?.listApps?.()
      .then((apps) => setAvailableApps(apps || []))
      .catch(() => setAvailableApps([]));
  }, []);
  
  // Handlers
  const toggleEnabled = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    setAppProfilesEnabled(next);
    dispatch(setEnabledRedux(next));
  }, [enabled, dispatch]);
  
  const handleCreateMapping = useCallback((data: {
    bundleId: string;
    profile: string;
    deviceVpid?: number;
  }) => {
    upsertAppProfileMapping(data.bundleId, {
      profile: data.profile,
      deviceVpid: data.deviceVpid,
    });
    const updated = getAppProfiles()?.mappings || {};
    setMappings(updated);
    dispatch(setMappingsRedux(updated));
    setIsCreateMappingOpen(false);
  }, [dispatch]);
  
  const handleProfileChange = useCallback((bundleId: string, profile: string) => {
    const currentMapping = mappings[bundleId];
    if (currentMapping) {
      upsertAppProfileMapping(bundleId, {
        ...currentMapping,
        profile,
      });
      const updated = getAppProfiles()?.mappings || {};
      setMappings(updated);
      dispatch(setMappingsRedux(updated));
    }
  }, [mappings, dispatch]);
  
  const handleDeleteMapping = useCallback((bundleId: string) => {
    if (confirm(`Remove mapping for ${bundleId}?`)) {
      removeAppProfileMapping(bundleId);
      const updated = getAppProfiles()?.mappings || {};
      setMappings(updated);
      dispatch(setMappingsRedux(updated));
    }
  }, [dispatch]);
  
  const handleSaveProfile = useCallback(() => {
    const name = (newProfileName || 'New Profile').trim();
    if (!name) return;
    setConfigurationProfile(name, {layers: currentLayers, macros: currentExpressions});
    setMacroProfiles(getAllConfigurationProfiles());
    setNewProfileName('');
  }, [newProfileName, currentLayers, currentExpressions]);
  
  const handleDeleteProfile = useCallback((name: string) => {
    if (confirm(`Delete profile "${name}"?`)) {
      deleteConfigurationProfile(name);
      setMacroProfiles(getAllConfigurationProfiles());
      const updated = getAppProfiles()?.mappings || {};
      setMappings(updated);
      dispatch(setMappingsRedux(updated));
    }
  }, [dispatch]);
  
  const handleRenameProfile = useCallback((oldName: string) => {
    const newName = prompt('Rename profile', oldName);
    if (newName && newName !== oldName) {
      renameConfigurationProfile(oldName, newName);
      setMacroProfiles(getAllConfigurationProfiles());
      const updated = getAppProfiles()?.mappings || {};
      setMappings(updated);
      dispatch(setMappingsRedux(updated));
    }
  }, [dispatch]);
  
  const handleApplyProfile = useCallback((name: string) => {
    // This would apply the profile to the device
    // Implementation depends on your device communication logic
    console.log('Apply profile:', name);
  }, []);
  
  const handleDuplicateProfile = useCallback((name: string) => {
    const profile = macroProfiles[name];
    if (profile) {
      const newName = prompt('Name for duplicated profile', `${name} (Copy)`);
      if (newName) {
        setConfigurationProfile(newName, profile);
        setMacroProfiles(getAllConfigurationProfiles());
      }
    }
  }, [macroProfiles]);
  
  // Get app name from bundle ID
  const getAppName = useCallback((bundleId: string) => {
    const app = availableApps.find(a => a.bundleId === bundleId);
    return app?.name || bundleId.split('.').pop() || bundleId;
  }, [availableApps]);
  
  return (
    <Container>
      <AppProfilesHeader
        enabled={enabled}
        currentApp={currentApp}
        onToggle={toggleEnabled}
      />
      
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <ContentArea>
        {activeTab === 'mappings' ? (
          <>
            <SearchBar
              placeholder="Search applications..."
              value={searchTerm}
              onChange={setSearchTerm}
              onAdd={() => setIsCreateMappingOpen(true)}
              addButtonText="Add New Mapping"
            />
            
            {filteredMappings.length === 0 ? (
              <EmptyState
                type="mappings"
                onAction={() => setIsCreateMappingOpen(true)}
              />
            ) : (
              <Grid>
                {filteredMappings.map(([bundleId, mapping]) => (
                  <AppMappingCard
                    key={bundleId}
                    bundleId={bundleId}
                    appName={getAppName(bundleId)}
                    profile={mapping.profile}
                    deviceVpid={mapping.deviceVpid}
                    deviceName={selectedDevice && typeof selectedDevice === 'object' && 'productName' in selectedDevice ? selectedDevice.productName : undefined}
                    isActive={currentApp?.bundleId === bundleId}
                    availableProfiles={profileNames}
                    onProfileChange={(profile) => handleProfileChange(bundleId, profile)}
                    onDelete={() => handleDeleteMapping(bundleId)}
                  />
                ))}
              </Grid>
            )}
          </>
        ) : (
          <>
            <SearchBar
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={setSearchTerm}
              onAdd={handleSaveProfile}
              addButtonText="Create Profile"
            />
            
            {filteredProfiles.length === 0 ? (
              <EmptyState
                type="profiles"
                onAction={handleSaveProfile}
              />
            ) : (
              <Grid>
                {filteredProfiles.map(([name, profile]) => (
                  <ProfileCard
                    key={name}
                    name={name}
                    layerCount={profile.layers?.length || 0}
                    macroCount={profile.macros?.length || 0}
                    isDefault={name === 'Default'}
                    isActive={false} // You can track active profile if needed
                    onApply={() => handleApplyProfile(name)}
                    onEdit={() => console.log('Edit profile:', name)}
                    onDuplicate={() => handleDuplicateProfile(name)}
                    onDelete={() => handleDeleteProfile(name)}
                    onRename={() => handleRenameProfile(name)}
                  />
                ))}
              </Grid>
            )}
          </>
        )}
      </ContentArea>
      
      <CreateMappingDialog
        isOpen={isCreateMappingOpen}
        onClose={() => setIsCreateMappingOpen(false)}
        onConfirm={handleCreateMapping}
        availableApps={availableApps}
        availableProfiles={profileNames}
        currentApp={currentApp}
        selectedDevice={selectedDevice && typeof selectedDevice === 'object' && 'vendorProductId' in selectedDevice ? {
          vendorProductId: selectedDevice.vendorProductId,
          productName: selectedDevice.productName
        } : null}
      />
    </Container>
  );
}