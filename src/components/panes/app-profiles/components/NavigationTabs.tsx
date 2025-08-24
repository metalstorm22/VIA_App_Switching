import React from 'react';
import { TabContainer, Tab } from '../app-profiles.styles';

export type TabType = 'mappings' | 'profiles';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <TabContainer>
      <Tab
        isActive={activeTab === 'mappings'}
        onClick={() => onTabChange('mappings')}
        aria-label="App Mappings tab"
        role="tab"
        aria-selected={activeTab === 'mappings'}
      >
        App Mappings
      </Tab>
      <Tab
        isActive={activeTab === 'profiles'}
        onClick={() => onTabChange('profiles')}
        aria-label="Configuration Profiles tab"
        role="tab"
        aria-selected={activeTab === 'profiles'}
      >
        Configuration Profiles
      </Tab>
    </TabContainer>
  );
};