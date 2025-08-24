import React from 'react';
import {
  EmptyState as EmptyStateContainer,
  EmptyStateTitle,
  EmptyStateDescription,
  AddButton,
} from '../app-profiles.styles';

interface EmptyStateProps {
  type: 'mappings' | 'profiles';
  onAction: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const isMappings = type === 'mappings';
  
  return (
    <EmptyStateContainer>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>
        {isMappings ? '📱' : '📦'}
      </div>
      
      <EmptyStateTitle>
        {isMappings ? 'No App Mappings Yet' : 'No Configuration Profiles'}
      </EmptyStateTitle>
      
      <EmptyStateDescription>
        {isMappings
          ? 'Start by adding your first application mapping to automatically switch keyboard profiles based on the active app.'
          : 'Create configuration profiles to save different keyboard layouts and macro sets for quick switching.'}
      </EmptyStateDescription>
      
      <AddButton onClick={onAction}>
        {isMappings ? '+ Add First Mapping' : '+ Create First Profile'}
      </AddButton>
    </EmptyStateContainer>
  );
};