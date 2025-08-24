import React from 'react';
import {
  SearchContainer,
  SearchInput,
  AddButton,
} from '../app-profiles.styles';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  addButtonText: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChange,
  onAdd,
  addButtonText,
}) => {
  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
      <AddButton onClick={onAdd}>
        <span>+</span>
        {addButtonText}
      </AddButton>
    </SearchContainer>
  );
};