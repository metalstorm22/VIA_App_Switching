import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styled from 'styled-components';
import {AccentSelect} from 'src/components/inputs/accent-select';
import {AccentButton, PrimaryAccentButton} from 'src/components/inputs/accent-button';
import TextInput from 'src/components/inputs/text-input';
import {ModalContainer, PromptText} from 'src/components/inputs/dialog-base';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {getExpressions, saveMacros, saveMacrosSuccess} from 'src/store/macrosSlice';
import {getSelectedRawLayers, saveKeymapSuccess, saveRawKeymapToDevice} from 'src/store/keymapSlice';
import {getSelectedDevicePath, getSelectedConnectedDevice, getSelectedKeyboardAPI} from 'src/store/devicesSlice';
import {
  getAllConfigurationProfiles,
  getConfigurationProfile,
  setConfigurationProfile,
  deleteConfigurationProfile,
  renameConfigurationProfile,
} from 'src/utils/device-store';
import {getSelectedDefinition} from 'src/store/definitionsSlice';
import {readEncoderValues, applyEncoderValues} from 'src/utils/encoders';
import {
  expressionToSequence,
  optimizedSequenceToRawSequence,
} from 'src/utils/macro-api/macro-api.common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash, faSave, faCopy, faUpload } from '@fortawesome/free-solid-svg-icons';
import { IconButtonContainer, IconButtonUnfilledContainer as IconButton } from 'src/components/inputs/icon-button';
import { IconButtonTooltip } from 'src/components/inputs/tooltip';

const Container = styled.div`
  position: absolute;
  left: 15px;
  top: 48px; /* below LayerControl which is top:10px with a bit of spacing */
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg_menu);
  border: 1px solid var(--bg_control);
  border-radius: 8px;
  padding: 6px 10px;
  pointer-events: all;
  z-index: 5;
`;

const Label = styled.label`
  font-size: 16px;
  text-transform: uppercase;
  color: var(--color_label-highlighted);
  margin-right: 6px;
`;

const InlineRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const DirtyPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color_accent);
  color: var(--color_inside-accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid var(--bg_control);
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

const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

type NameDialogProps = {
  isOpen: boolean;
  title: string;
  initialValue?: string;
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
    if (props.isOpen) {
      ref.current.showModal();
    } else {
      ref.current.close();
    }
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
            placeholder="Profile name"
            onChange={(e: any) => setValue(e.target.value)}
            style={{width: '100%'}}
          />
        </div>
        <Controls>
          <PrimaryAccentButton
            onClick={() => {
              const name = (value || '').trim();
              if (!name) return;
              props.onConfirm(name);
            }}
          >
            Confirm
          </PrimaryAccentButton>
          <AccentButton onClick={props.onCancel}>Cancel</AccentButton>
        </Controls>
      </ModalContainer>
    </DialogContainer>
  );
};

type ConfirmDialogProps = {
  isOpen: boolean;
  message: string;
  onConfirm(): void;
  onCancel(): void;
};
const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (props.isOpen) {
      ref.current.showModal();
    } else {
      ref.current.close();
    }
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
        <Controls>
          <PrimaryAccentButton onClick={props.onConfirm}>Confirm</PrimaryAccentButton>
          <AccentButton onClick={props.onCancel}>Cancel</AccentButton>
        </Controls>
      </ModalContainer>
    </DialogContainer>
  );
};

function deepEqualArrays(a: any[], b: any[]): boolean {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const av = a[i];
    const bv = b[i];
    if (Array.isArray(av) || Array.isArray(bv)) {
      if (!deepEqualArrays(av as any[], bv as any[])) return false;
    } else if (av !== bv) {
      return false;
    }
  }
  return true;
}

export const ProfileBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const devicePath = useAppSelector(getSelectedDevicePath);
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const api = useAppSelector(getSelectedKeyboardAPI);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const layers = useAppSelector(getSelectedRawLayers); // Layer[]
  const currentLayers: number[][] = useMemo(
    () => (layers || []).map((l) => ((l && l.keymap) || []) as number[]),
    [layers],
  );
  const currentMacros = useAppSelector(getExpressions); // string[]
  const [currentEncoders, setCurrentEncoders] = useState<[number, number][][]>([]);
  // Keep a live snapshot of encoder mappings from the device so we can detect unsaved changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!api || !selectedDefinition) {
        if (!cancelled) setCurrentEncoders([]);
        return;
      }
      try {
        const enc = await readEncoderValues(api, selectedDefinition, currentLayers.length);
        if (!cancelled) setCurrentEncoders(enc || []);
      } catch {
        if (!cancelled) setCurrentEncoders([]);
      }
    };
    load();
    const onEncoderChanged = () => load();
    try {
      window.addEventListener('via:encoder-mapping-changed', onEncoderChanged as any);
    } catch {}
    return () => {
      cancelled = true;
      try {
        window.removeEventListener('via:encoder-mapping-changed', onEncoderChanged as any);
      } catch {}
    };
  }, [api, selectedDefinition, currentLayers.length]);

  const [profileNames, setProfileNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // Dialog state
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [nameDialogTitle, setNameDialogTitle] = useState('Name');
  const [nameDialogInitial, setNameDialogInitial] = useState<string>('');
  const [nameDialogMode, setNameDialogMode] = useState<'add' | 'saveas' | 'rename' | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedProfile = useMemo(() => {
    return selectedName ? getConfigurationProfile(selectedName) : undefined;
  }, [selectedName]);

  const isDirty = useMemo(() => {
    if (!selectedProfile) return false;
    const sameLayers = deepEqualArrays(selectedProfile.layers, currentLayers);
    const sameMacros = deepEqualArrays(selectedProfile.macros, currentMacros);
    const sameEncoders = deepEqualArrays(selectedProfile.encoders || [], currentEncoders || []);
    return !(sameLayers && sameMacros && sameEncoders);
  }, [selectedProfile, currentLayers, currentMacros, currentEncoders]);

  const refreshProfileNames = useCallback(() => {
    const all = getAllConfigurationProfiles();
    const names = Object.keys(all || {});
    setProfileNames(names);
    if (!selectedName && names.length > 0) {
      setSelectedName(names[0]);
    }
  }, [selectedName]);

  useEffect(() => {
    refreshProfileNames();
  }, []);

  const snapshotAndSave = useCallback(
    async (name: string) => {
      let encoders: [number, number][][] = [];
      try {
        if (api && selectedDefinition) {
          const layerCount = currentLayers.length;
          encoders = await readEncoderValues(api, selectedDefinition, layerCount);
        }
      } catch {}
      setConfigurationProfile(name, {layers: currentLayers, macros: currentMacros, encoders});
      refreshProfileNames();
  }, [api, selectedDefinition, currentLayers, currentMacros, refreshProfileNames]);

  const onSave = useCallback(async () => {
    if (!selectedName) return;
    await snapshotAndSave(selectedName);
  }, [selectedName, snapshotAndSave]);

  // Keyboard shortcut: Save (Cmd+S on macOS, Ctrl+S on others)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = (e.key || '').toLowerCase();
      const isSave = key === 's';
      const isMac = navigator.platform.toLowerCase().includes('mac');
      if (isSave && ((isMac && e.metaKey) || (!isMac && e.ctrlKey))) {
        e.preventDefault();
        try {
          onSave();
        } catch {}
      }
    };
    window.addEventListener('keydown', handler as any);
    return () => window.removeEventListener('keydown', handler as any);
  }, [onSave]);

  const openNameDialog = useCallback(
    (mode: 'add' | 'saveas' | 'rename', title: string, initial?: string) => {
      setNameDialogMode(mode);
      setNameDialogTitle(title);
      setNameDialogInitial(initial || '');
      setNameDialogOpen(true);
    },
    [],
  );

  const onSaveAs = useCallback(() => {
    const defaultName = selectedName || 'Default';
    openNameDialog('saveas', 'Save configuration as…', defaultName);
  }, [selectedName, openNameDialog]);

  const onAdd = useCallback(() => {
    openNameDialog('add', 'Create configuration profile', 'Default');
  }, [openNameDialog]);

  const onDelete = useCallback(() => {
    if (!selectedName) return;
    setConfirmOpen(true);
  }, [selectedName]);

  const onRename = useCallback(() => {
    if (!selectedName) return;
    openNameDialog('rename', 'Rename configuration profile', selectedName);
  }, [selectedName, openNameDialog]);

  const handleNameDialogConfirm = useCallback(
    async (name: string) => {
      if (!nameDialogMode) return;
      const trimmed = (name || '').trim();
      if (!trimmed) return;

      if (nameDialogMode === 'add' || nameDialogMode === 'saveas') {
        await snapshotAndSave(trimmed);
        setSelectedName(trimmed);
      } else if (nameDialogMode === 'rename' && selectedName) {
        renameConfigurationProfile(selectedName, trimmed);
        refreshProfileNames();
        setSelectedName(trimmed);
      }
      setNameDialogOpen(false);
      setNameDialogMode(null);
    },
    [nameDialogMode, selectedName, snapshotAndSave, refreshProfileNames],
  );

  const handleNameDialogCancel = useCallback(() => {
    setNameDialogOpen(false);
    setNameDialogMode(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedName || selectedName === 'Default') return;
    deleteConfigurationProfile(selectedName);
    refreshProfileNames();
    setSelectedName(null);
    setConfirmOpen(false);
  }, [selectedName, refreshProfileNames]);

  const handleCancelDelete = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  // Load into preview (Redux state) without flashing the device
  const loadIntoPreview = useCallback(
    (profileName?: string) => {
      const targetName = profileName ?? selectedName;
      if (!targetName) return;
      const prof = getConfigurationProfile(targetName);
      if (!prof) return;
      if (!devicePath) return;

      // Skip loading if profile has empty layers (e.g., uninitialized Default)
      if (!prof.layers || prof.layers.length === 0) {
        console.log(`Profile "${targetName}" has no layers, skipping preview load`);
        return;
      }

      // Update keymap preview
      const layersPayload = prof.layers.map((l) => ({
        keymap: l,
        isLoaded: true,
      }));
      dispatch(saveKeymapSuccess({layers: layersPayload as any, devicePath}));

      // Update macros preview (ast)
      const ast = prof.macros.map((expr) =>
        optimizedSequenceToRawSequence(expressionToSequence(expr)),
      );
      dispatch(saveMacrosSuccess({ast}));
    },
    [dispatch, selectedName, devicePath],
  );

  // Apply profile to the connected device (writes to keyboard)
  const applyToDevice = useCallback(
    async (profileName?: string) => {
      const targetName = profileName ?? selectedName;
      if (!targetName || !selectedDevice) return;
      const prof = getConfigurationProfile(targetName);
      if (!prof) return;

      // Skip applying if profile has empty layers (e.g., uninitialized Default)
      if (!prof.layers || prof.layers.length === 0) {
        console.log(`Profile "${targetName}" has no layers, skipping device apply`);
        return;
      }

      // Write keymaps to device
      dispatch(saveRawKeymapToDevice(prof.layers, selectedDevice) as any);
      // Write macros to device
      dispatch(saveMacros(selectedDevice, prof.macros) as any);
      // Write encoders to device (best-effort)
      try {
        if (api && prof.encoders && prof.encoders.length > 0) {
          await applyEncoderValues(api, prof.encoders);
        }
      } catch {}
    },
    [dispatch, selectedName, selectedDevice, api],
  );

  return (
    <>
      <Container>
        <InlineRow>
          <Label>Profile</Label>
          <div style={{minWidth: 260}}>
            <AccentSelect
              placeholder="Select configuration…"
              options={profileNames.map((n) => ({value: n, label: n}))}
              value={selectedName ? {value: selectedName, label: selectedName} : null}
              onChange={(opt: any) => {
                const name = opt?.value || null;
                setSelectedName(name);
                if (name) {
                  // Auto-load selection into preview and apply to device
                  loadIntoPreview(name);
                  applyToDevice(name);
                }
              }}
              isClearable
            />
          </div>
          <IconButton aria-label="New profile" onClick={onAdd} title="New profile">
            <FontAwesomeIcon icon={faPlus} />
            <IconButtonTooltip>New profile</IconButtonTooltip>
          </IconButton>

          <IconButton
            aria-label="Rename profile"
            onClick={onRename}
            disabled={!selectedName || selectedName === 'Default'}
            title="Rename profile"
          >
            <FontAwesomeIcon icon={faPen} />
            <IconButtonTooltip>Rename profile</IconButtonTooltip>
          </IconButton>

          <IconButton
            aria-label="Delete profile"
            onClick={onDelete}
            disabled={!selectedName || selectedName === 'Default'}
            title="Delete profile"
          >
            <FontAwesomeIcon icon={faTrash} />
            <IconButtonTooltip>Delete profile</IconButtonTooltip>
          </IconButton>

          <IconButtonContainer
            aria-label="Apply to device"
            onClick={() => {
              loadIntoPreview();
              applyToDevice();
            }}
            disabled={!selectedName}
            title="Apply to device"
          >
            <FontAwesomeIcon icon={faUpload} />
            <IconButtonTooltip>Apply to device</IconButtonTooltip>
          </IconButtonContainer>
        </InlineRow>
        {isDirty && (
          <InlineRow>
            <DirtyPill>Unsaved changes</DirtyPill>
            <IconButtonContainer
              aria-label="Save changes"
              onClick={onSave}
              disabled={!selectedName}
              title="Save changes (Cmd/Ctrl+S)"
            >
              <FontAwesomeIcon icon={faSave} />
              <IconButtonTooltip>Save changes</IconButtonTooltip>
            </IconButtonContainer>
            <IconButton aria-label="Save as new profile" onClick={onSaveAs} title="Save as new profile">
              <FontAwesomeIcon icon={faCopy} />
              <IconButtonTooltip>Save as new profile</IconButtonTooltip>
            </IconButton>
          </InlineRow>
        )}
      </Container>

      <NameDialog
        isOpen={nameDialogOpen}
        title={nameDialogTitle}
        initialValue={nameDialogInitial}
        onConfirm={handleNameDialogConfirm}
        onCancel={handleNameDialogCancel}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        message={selectedName ? `Delete configuration profile "${selectedName}"?` : 'Delete profile?'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};