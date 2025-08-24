import React from 'react';
import {
  Header,
  HeaderTop,
  HeaderTitle,
  HeaderDescription,
  CurrentAppInfo,
  StatusIndicator,
  ToggleSwitch,
  ToggleSlider,
  ToggleInput,
} from '../app-profiles.styles';

interface AppProfilesHeaderProps {
  enabled: boolean;
  currentApp: { bundleId: string; name: string } | null;
  onToggle: () => void;
}

export const AppProfilesHeader: React.FC<AppProfilesHeaderProps> = ({
  enabled,
  currentApp,
  onToggle,
}) => {
  return (
    <Header>
      <HeaderTop>
        <div>
          <HeaderTitle>App Profiles (Mac)</HeaderTitle>
          <HeaderDescription>
            Automatically switch keyboard profiles based on active application
          </HeaderDescription>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <CurrentAppInfo>
            <span style={{ opacity: 0.7 }}>Current App:</span>
            <strong>{currentApp ? currentApp.name : 'Unknown'}</strong>
            {currentApp && (
              <code style={{ fontSize: '11px', opacity: 0.6 }}>
                {currentApp.bundleId}
              </code>
            )}
          </CurrentAppInfo>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StatusIndicator isActive={enabled}>
              {enabled ? 'ENABLED' : 'DISABLED'}
            </StatusIndicator>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={enabled}
                onChange={onToggle}
                aria-label="Enable app profiles"
              />
              <ToggleSlider checked={enabled} />
            </ToggleSwitch>
          </div>
        </div>
      </HeaderTop>
    </Header>
  );
};