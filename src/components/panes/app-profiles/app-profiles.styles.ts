import styled, { css, keyframes } from 'styled-components';

// Animations
export const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(-10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

export const slideIn = keyframes`
  from { 
    transform: translateX(-20px);
    opacity: 0;
  }
  to { 
    transform: translateX(0);
    opacity: 1;
  }
`;

export const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
`;

// Main Container
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  gap: 20px;
  overflow: hidden;
  background: var(--bg_gradient);
`;

// Header Section
export const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: var(--bg_menu);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.3s ease-out;
  border: 1px solid var(--bg_control);
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color_label-highlighted);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const HeaderDescription = styled.p`
  font-size: 14px;
  color: var(--color_label);
  margin: 0;
  opacity: 0.8;
`;

export const CurrentAppInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--bg_control);
  border-radius: 8px;
  font-size: 14px;
`;

export const StatusIndicator = styled.span<{ isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.isActive ? 'var(--color_accent)' : 'var(--color_medium-grey)'};
    animation: ${props => props.isActive ? pulse : 'none'} 2s infinite;
  }
`;

// Toggle Switch
export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 28px;
  cursor: pointer;
`;

export const ToggleSlider = styled.span<{ checked: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.checked ? 'var(--color_accent)' : 'var(--bg_control)'};
  transition: 0.3s;
  border-radius: 28px;
  
  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: ${props => props.checked ? '36px' : '4px'};
    bottom: 4px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

export const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

// Navigation Tabs
export const TabContainer = styled.div`
  display: flex;
  gap: 2px;
  background: var(--bg_control);
  padding: 4px;
  border-radius: 10px;
  flex-shrink: 0; /* Prevent tabs from shrinking */
`;

export const Tab = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 12px 24px;
  background: ${props => props.isActive ? 'var(--bg_menu)' : 'transparent'};
  color: ${props => props.isActive ? 'var(--color_accent)' : 'var(--color_label)'};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: ${props => props.isActive ? '500' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.isActive ? 'var(--bg_menu)' : 'rgba(255, 255, 255, 0.05)'};
    color: var(--color_accent);
  }
`;

// Content Area
export const ContentArea = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
  min-height: 0; /* Important for flex children with overflow */
`;

// Search Bar
export const SearchContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
  flex-shrink: 0; /* Prevent search bar from shrinking */
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  background: var(--bg_menu);
  border: 1px solid var(--bg_control);
  border-radius: 8px;
  color: var(--color_accent);
  font-size: 14px;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: var(--color_label);
    opacity: 0.6;
  }
  
  &:focus {
    outline: none;
    border-color: var(--color_accent);
    box-shadow: 0 0 0 2px rgba(var(--color_accent), 0.1);
  }
`;

export const AddButton = styled.button`
  padding: 12px 24px;
  background: var(--color_accent);
  color: var(--color_inside-accent);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--color_accent), 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Grid Layout
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  grid-auto-rows: min-content; /* Cards only take needed height */
  gap: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 8px 20px 4px; /* Extra bottom padding for scroll */
  flex: 1;
  min-height: 0; /* Important for overflow to work */
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg_control);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color_accent);
    border-radius: 4px;
    opacity: 0.5;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    opacity: 1;
  }
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Card Components
export const Card = styled.div<{ isActive?: boolean; isDragging?: boolean }>`
  background: var(--bg_menu);
  border: 2px solid ${props => props.isActive ? 'var(--color_accent)' : 'var(--bg_control)'};
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  cursor: ${props => props.isDragging ? 'grabbing' : 'pointer'};
  position: relative;
  opacity: ${props => props.isDragging ? 0.5 : 1};
  height: fit-content; /* Card only takes needed height */
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    border-color: var(--color_accent);
  }
  
  ${props => props.isActive && css`
    box-shadow: 0 0 0 3px rgba(var(--color_accent), 0.1);
  `}
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

export const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: var(--color_label-highlighted);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CardIcon = styled.span`
  font-size: 20px;
  display: inline-flex;
`;

export const CardStatus = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${props => props.isActive ? 'var(--color_accent)' : 'var(--color_label)'};
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.isActive ? 'var(--color_accent)' : 'var(--color_medium-grey)'};
  }
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color_label);
  
  strong {
    color: var(--color_label-highlighted);
    min-width: 60px;
    flex-shrink: 0;
  }
  
  code {
    font-family: monospace;
    font-size: 11px;
    background: var(--bg_control);
    padding: 2px 6px;
    border-radius: 4px;
    word-break: break-all;
  }
`;

export const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

export const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 6px 12px;
  background: ${props => 
    props.variant === 'danger' ? 'rgba(255, 67, 67, 0.1)' : 
    props.variant === 'primary' ? 'var(--color_accent)' : 
    'var(--bg_control)'
  };
  color: ${props => 
    props.variant === 'danger' ? '#ff4343' : 
    props.variant === 'primary' ? 'var(--color_inside-accent)' : 
    'var(--color_accent)'
  };
  border: 1px solid ${props => 
    props.variant === 'danger' ? '#ff4343' : 
    props.variant === 'primary' ? 'var(--color_accent)' : 
    'var(--bg_control)'
  };
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const IconButton = styled.button`
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--bg_control);
  border: 1px solid var(--bg_control);
  border-radius: 6px;
  color: var(--color_label);
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: var(--color_accent);
    color: var(--color_inside-accent);
    border-color: var(--color_accent);
  }
`;

// Empty State
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--color_label);
  
  svg {
    width: 80px;
    height: 80px;
    opacity: 0.3;
    margin-bottom: 20px;
  }
`;

export const EmptyStateTitle = styled.h3`
  font-size: 20px;
  font-weight: 500;
  color: var(--color_label-highlighted);
  margin: 0 0 8px 0;
`;

export const EmptyStateDescription = styled.p`
  font-size: 14px;
  opacity: 0.8;
  margin: 0 0 24px 0;
  max-width: 400px;
`;

// Badge
export const Badge = styled.span<{ variant?: 'default' | 'active' | 'warning' }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => 
    props.variant === 'active' ? 'var(--color_accent)' :
    props.variant === 'warning' ? '#ff9800' :
    'var(--bg_control)'
  };
  color: ${props => 
    props.variant === 'active' ? 'var(--color_inside-accent)' :
    props.variant === 'warning' ? '#fff' :
    'var(--color_label)'
  };
`;

// Profile Select in Card
export const ProfileSelect = styled.div`
  position: relative;
  margin-top: 8px;
`;

// Loading State
export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg_control);
  border-top-color: var(--color_accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;