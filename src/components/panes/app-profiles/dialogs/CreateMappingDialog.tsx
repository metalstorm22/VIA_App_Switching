import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { AccentSelect } from '../../../inputs/accent-select';
import { AccentButton, PrimaryAccentButton } from '../../../inputs/accent-button';

const DialogBackdrop = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const DialogContainer = styled.div`
  background: var(--bg_menu);
  border: 2px solid var(--color_accent);
  border-radius: 12px;
  padding: 24px;
  min-width: 480px;
  max-width: 600px;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from { 
      transform: translateY(20px);
      opacity: 0;
    }
    to { 
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const DialogTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: var(--color_label-highlighted);
  margin: 0 0 20px 0;
`;

const DialogBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--color_label);
  font-weight: 500;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
`;

const DialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

interface CreateMappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    bundleId: string;
    profile: string;
    deviceVpid?: number;
  }) => void;
  availableApps: Array<{ bundleId: string; name: string }>;
  availableProfiles: string[];
  currentApp: { bundleId: string; name: string } | null;
  selectedDevice?: { vendorProductId: number; productName: string } | null;
}

export const CreateMappingDialog: React.FC<CreateMappingDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  availableApps,
  availableProfiles,
  currentApp,
  selectedDevice,
}) => {
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<string>('Default');
  const [bindToDevice, setBindToDevice] = useState<boolean>(false);
  
  useEffect(() => {
    if (currentApp) {
      setSelectedApp(currentApp.bundleId);
    }
  }, [currentApp]);
  
  const handleConfirm = () => {
    if (!selectedApp || !selectedProfile) return;
    
    onConfirm({
      bundleId: selectedApp,
      profile: selectedProfile,
      deviceVpid: bindToDevice && selectedDevice ? selectedDevice.vendorProductId : undefined,
    });
    
    // Reset form
    setSelectedApp('');
    setSelectedProfile('Default');
    setBindToDevice(false);
  };
  
  const appOptions = availableApps.map(app => ({
    value: app.bundleId,
    label: `${app.name} (${app.bundleId})`,
  }));
  
  const profileOptions = availableProfiles.map(p => ({
    value: p,
    label: p,
  }));
  
  return (
    <DialogBackdrop isOpen={isOpen} onClick={onClose}>
      <DialogContainer onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Add Application Mapping</DialogTitle>
        
        <DialogBody>
          <FormGroup>
            <Label>Application</Label>
            <AccentSelect
              placeholder="Select application..."
              options={appOptions}
              value={selectedApp ? appOptions.find(o => o.value === selectedApp) : null}
              onChange={(opt: any) => setSelectedApp(opt?.value || '')}
              isClearable
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Configuration Profile</Label>
            <AccentSelect
              placeholder="Select profile..."
              options={profileOptions}
              value={profileOptions.find(o => o.value === selectedProfile)}
              onChange={(opt: any) => setSelectedProfile(opt?.value || 'Default')}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Device Binding</Label>
            <RadioGroup>
              <RadioLabel>
                <input
                  type="radio"
                  name="deviceBinding"
                  checked={!bindToDevice}
                  onChange={() => setBindToDevice(false)}
                />
                Any compatible device
              </RadioLabel>
              <RadioLabel>
                <input
                  type="radio"
                  name="deviceBinding"
                  checked={bindToDevice}
                  onChange={() => setBindToDevice(true)}
                  disabled={!selectedDevice}
                />
                {selectedDevice
                  ? `Specific device: ${selectedDevice.productName}`
                  : 'Specific device (no device connected)'}
              </RadioLabel>
            </RadioGroup>
          </FormGroup>
        </DialogBody>
        
        <DialogFooter>
          <AccentButton onClick={onClose}>Cancel</AccentButton>
          <PrimaryAccentButton
            onClick={handleConfirm}
            disabled={!selectedApp || !selectedProfile}
          >
            Add Mapping
          </PrimaryAccentButton>
        </DialogFooter>
      </DialogContainer>
    </DialogBackdrop>
  );
};