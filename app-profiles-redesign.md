# App Profiles UI Redesign Plan

## Component Architecture

### 1. Main Container Structure
```typescript
AppProfilesPane
├── AppProfilesHeader
│   ├── Title & Description
│   ├── EnableToggle
│   └── StatusIndicator
├── NavigationTabs
│   ├── AppMappingsTab
│   └── ConfigurationProfilesTab
├── ContentArea
│   ├── AppMappingsView
│   │   ├── SearchBar
│   │   ├── FilterControls
│   │   ├── AppMappingsList
│   │   └── EmptyState
│   └── ConfigurationProfilesView
│       ├── ProfilesList
│       ├── ProfileEditor
│       └── EmptyState
└── DialogSystem
    ├── CreateMappingDialog
    ├── EditProfileDialog
    └── ConfirmationDialog
```

## UI Components Design

### AppProfilesHeader
- **Purpose**: Main header with enable/disable toggle and status
- **Features**:
  - Toggle switch with animation
  - Current active app indicator
  - Connection status badge
  - Help tooltip

### AppMappingCard
```
┌──────────────────────────────────────────────────┐
│ [Icon] App Name                         [Actions]│
│ Bundle ID: com.example.app                      │
│ Profile: [Dropdown]                              │
│ Device: [Device Name or "Any"]                  │
│ Status: ● Active | ○ Inactive                   │
└──────────────────────────────────────────────────┘
```

### ConfigurationProfileCard
```
┌──────────────────────────────────────────────────┐
│ Profile Name                           [Actions] │
│ Layers: 4 | Macros: 12                          │
│ Last Modified: 2 hours ago                      │
│ [Apply] [Edit] [Duplicate] [Delete]             │
└──────────────────────────────────────────────────┘
```

## Styled Components Structure

### Colors & Theme Variables
```css
--profile-card-bg: var(--bg_menu);
--profile-card-border: var(--bg_control);
--profile-card-hover: rgba(var(--color_accent), 0.1);
--profile-active: var(--color_accent);
--profile-inactive: var(--color_medium-grey);
--profile-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
```

### Animations
- Card hover: scale(1.02) with shadow
- Toggle switch: smooth slide transition
- Tab switching: fade in/out
- Dialog appearance: slide up with backdrop fade

## User Flows

### Adding App Mapping
1. Click "Add Mapping" button
2. Dialog opens with:
   - App selector (dropdown or current app)
   - Profile selector
   - Device binding option
3. Confirm to create mapping
4. Card appears with animation
5. Toast notification confirms success

### Managing Profiles
1. View all profiles in grid/list
2. Quick actions on hover
3. Click to expand details
4. Inline editing for names
5. Drag to reorder (future enhancement)

## Responsive Design
- Desktop: 2-3 cards per row
- Tablet: 1-2 cards per row
- Mobile: Single column stack

## Accessibility Features
- ARIA labels for all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- High contrast mode support

## State Management
- Use existing Redux slices
- Add loading states
- Error handling with user feedback
- Optimistic updates for better UX

## Implementation Phases

### Phase 1: Core Components
- New styled components
- Basic card layouts
- Improved header

### Phase 2: Interactions
- Search/filter functionality
- Better dialogs
- Animations

### Phase 3: Polish
- Drag and drop
- Bulk operations
- Advanced filtering