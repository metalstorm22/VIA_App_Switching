import React from 'react';
import { AccentSelect } from '../../../inputs/accent-select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardIcon,
  CardStatus,
  CardBody,
  CardInfo,
  InfoRow,
  CardActions,
  ActionButton,
  IconButton,
  ProfileSelect,
} from '../app-profiles.styles';

interface AppMappingCardProps {
  bundleId: string;
  appName: string;
  profile: string;
  deviceVpid?: number;
  deviceName?: string;
  isActive: boolean;
  availableProfiles: string[];
  onProfileChange: (profile: string) => void;
  onEdit?: () => void;
  onDelete: () => void;
}

// Simple app icon mapping (you can expand this)
const getAppIcon = (bundleId: string): string => {
  const iconMap: Record<string, string> = {
    'com.apple.Safari': '🦁',
    'com.google.Chrome': '🌐',
    'com.microsoft.VSCode': '💻',
    'com.discord.Discord': '🎮',
    'com.spotify.client': '🎵',
    'com.slack.Slack': '💬',
    'com.figma.Desktop': '🎨',
    'com.apple.Terminal': '⌨️',
    'com.apple.Notes': '📝',
    'com.apple.Mail': '📧',
  };
  
  // Check for partial matches
  for (const [key, icon] of Object.entries(iconMap)) {
    if (bundleId.toLowerCase().includes(key.split('.').pop()?.toLowerCase() || '')) {
      return icon;
    }
  }
  
  return '📱'; // Default icon
};

export const AppMappingCard: React.FC<AppMappingCardProps> = ({
  bundleId,
  appName,
  profile,
  deviceVpid,
  deviceName,
  isActive,
  availableProfiles,
  onProfileChange,
  onEdit,
  onDelete,
}) => {
  const handleProfileChange = (option: any) => {
    if (option?.value) {
      onProfileChange(option.value);
    }
  };

  const profileOptions = availableProfiles.map(p => ({
    value: p,
    label: p,
  }));

  const currentProfileOption = {
    value: profile,
    label: profile,
  };

  return (
    <Card isActive={isActive}>
      <CardHeader>
        <CardTitle>
          <CardIcon>{getAppIcon(bundleId)}</CardIcon>
          {appName}
        </CardTitle>
        <CardStatus isActive={isActive}>
          {isActive ? 'Active' : 'Inactive'}
        </CardStatus>
      </CardHeader>
      
      <CardBody>
        <CardInfo>
          <InfoRow>
            <strong>Bundle:</strong>
            <code>{bundleId}</code>
          </InfoRow>
          
          <InfoRow>
            <strong>Device:</strong>
            <span>
              {deviceVpid && deviceName 
                ? `${deviceName} (${deviceVpid.toString(16).toUpperCase()})` 
                : 'Any compatible device'}
            </span>
          </InfoRow>
        </CardInfo>
        
        <ProfileSelect>
          <InfoRow>
            <strong>Profile:</strong>
            <div style={{ flex: 1, maxWidth: '200px' }}>
              <AccentSelect
                options={profileOptions}
                value={currentProfileOption}
                onChange={handleProfileChange}
                isSearchable={false}
                menuPlacement="auto"
                styles={{
                  container: (provided: any) => ({
                    ...provided,
                    width: '100%',
                  }),
                  control: (provided: any) => ({
                    ...provided,
                    minHeight: '32px',
                    height: '32px',
                  }),
                  valueContainer: (provided: any) => ({
                    ...provided,
                    height: '32px',
                    padding: '0 8px',
                  }),
                  input: (provided: any) => ({
                    ...provided,
                    margin: '0px',
                  }),
                  indicatorsContainer: (provided: any) => ({
                    ...provided,
                    height: '32px',
                  }),
                }}
              />
            </div>
          </InfoRow>
        </ProfileSelect>
        
        <CardActions>
          {onEdit && (
            <IconButton
              onClick={onEdit}
              title="Edit mapping"
              aria-label="Edit mapping"
            >
              ⚙️
            </IconButton>
          )}
          <IconButton
            onClick={() => {
              // Copy bundle ID to clipboard
              navigator.clipboard.writeText(bundleId);
            }}
            title="Copy bundle ID"
            aria-label="Copy bundle ID"
          >
            📋
          </IconButton>
          <IconButton
            onClick={onDelete}
            title="Delete mapping"
            aria-label="Delete mapping"
          >
            🗑️
          </IconButton>
        </CardActions>
      </CardBody>
    </Card>
  );
};