import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardInfo,
  InfoRow,
  CardActions,
  ActionButton,
  Badge,
} from '../app-profiles.styles';

interface ProfileCardProps {
  name: string;
  layerCount: number;
  macroCount: number;
  lastModified?: Date;
  isDefault: boolean;
  isActive: boolean;
  onApply: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: () => void;
}

const formatTimeAgo = (date?: Date): string => {
  if (!date) return 'Never';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  layerCount,
  macroCount,
  lastModified,
  isDefault,
  isActive,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
  onRename,
}) => {
  return (
    <Card isActive={isActive}>
      <CardHeader>
        <CardTitle>
          <span>📦</span>
          {name}
        </CardTitle>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isDefault && <Badge>DEFAULT</Badge>}
          {isActive && <Badge variant="active">ACTIVE</Badge>}
        </div>
      </CardHeader>
      
      <CardBody>
        <CardInfo>
          <InfoRow>
            <span>
              <strong>Layers:</strong> {layerCount}
            </span>
            <span style={{ marginLeft: '16px' }}>
              <strong>Macros:</strong> {macroCount}
            </span>
          </InfoRow>
          
          <InfoRow>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              Modified: {formatTimeAgo(lastModified)}
            </span>
          </InfoRow>
        </CardInfo>
        
        <CardActions style={{ opacity: 1, marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <ActionButton 
            variant="primary"
            onClick={onApply}
            title="Apply this profile to the device"
          >
            Apply to Device
          </ActionButton>
          
          <ActionButton 
            onClick={onEdit}
            title="Edit profile"
          >
            Edit
          </ActionButton>
          
          <ActionButton 
            onClick={onDuplicate}
            title="Duplicate profile"
          >
            Duplicate
          </ActionButton>
          
          {!isDefault && (
            <>
              <ActionButton 
                onClick={onRename}
                title="Rename profile"
              >
                Rename
              </ActionButton>
              
              <ActionButton 
                variant="danger"
                onClick={onDelete}
                title="Delete profile"
              >
                Delete
              </ActionButton>
            </>
          )}
        </CardActions>
      </CardBody>
    </Card>
  );
};