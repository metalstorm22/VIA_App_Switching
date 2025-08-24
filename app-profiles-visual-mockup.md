# App Profiles UI - Visual Mockup & Wireframes

## Overall Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│  VIA - Keyboard Configurator                                    [_] [□] [X] │
├────────────────────────────────────────────────────────────────────────────┤
│  [⌨ Configure] [📱 App Profiles] [🔬 Test] [🎨 Design] [⚙️ Settings]        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                         APP PROFILES (MAC)                           │  │
│  │                                                                      │  │
│  │  Automatically switch keyboard profiles based on active application │  │
│  │                                                                      │  │
│  │  Current App: Safari (com.apple.Safari)          [🟢 ENABLED ━━━●] │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  [App Mappings]  [Configuration Profiles]                           │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## App Mappings Tab (Active View)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  🔍 Search applications...                      [+ Add New Mapping]  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                                                                      │  │
│  │  ╔═══════════════════════════════════════════════════════════════╗  │  │
│  │  ║  🦁 Safari                                          ● Active  ║  │  │
│  │  ║  ─────────────────────────────────────────────────────────── ║  │  │
│  │  ║  Bundle: com.apple.Safari                                     ║  │  │
│  │  ║  Profile: [Browsing     ▼]                    [⚙️] [📋] [🗑️]  ║  │  │
│  │  ║  Device: Keychron K2 Pro (0x1234)                            ║  │  │
│  │  ╚═══════════════════════════════════════════════════════════════╝  │  │
│  │                                                                      │  │
│  │  ╔═══════════════════════════════════════════════════════════════╗  │  │
│  │  ║  💻 Visual Studio Code                              ○ Inactive ║  │  │
│  │  ║  ─────────────────────────────────────────────────────────── ║  │  │
│  │  ║  Bundle: com.microsoft.VSCode                                 ║  │  │
│  │  ║  Profile: [Development  ▼]                    [⚙️] [📋] [🗑️]  ║  │  │
│  │  ║  Device: Any compatible device                               ║  │  │
│  │  ╚═══════════════════════════════════════════════════════════════╝  │  │
│  │                                                                      │  │
│  │  ╔═══════════════════════════════════════════════════════════════╗  │  │
│  │  ║  🎮 Discord                                         ○ Inactive ║  │  │
│  │  ║  ─────────────────────────────────────────────────────────── ║  │  │
│  │  ║  Bundle: com.discord.Discord                                  ║  │  │
│  │  ║  Profile: [Gaming       ▼]                    [⚙️] [📋] [🗑️]  ║  │  │
│  │  ║  Device: GMMK Pro (0x5678)                                   ║  │  │
│  │  ╚═══════════════════════════════════════════════════════════════╝  │  │
│  │                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## Configuration Profiles Tab

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  [App Mappings]  [Configuration Profiles]                           │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  🔍 Search profiles...                        [+ Create Profile]   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                                                                      │  │
│  │  ╔═══════════════════════════════════════════════════════════════╗  │  │
│  │  ║  📦 Default                                    [DEFAULT BADGE] ║  │  │
│  │  ║  ─────────────────────────────────────────────────────────── ║  │  │
│  │  ║  Layers: 4  |  Macros: 8  |  Modified: 2 hours ago           ║  │  │
│  │  ║                                                               ║  │  │
│  │  ║  [Apply to Device] [Edit] [Duplicate]                        ║  │  │
│  │  ╚═══════════════════════════════════════════════════════════════╝  │  │
│  │                                                                      │  │
│  │  ╔═══════════════════════════════════════════════════════════════╗  │  │
│  │  ║  🎯 Browsing                                     [ACTIVE BADGE] ║  │  │
│  │  ║  ─────────────────────────────────────────────────────────── ║  │  │
│  │  ║  Layers: 4  |  Macros: 12  |  Modified: Yesterday            ║  │  │
│  │  ║                                                               ║  │  │
│  │  ║  [Apply to Device] [Edit] [Duplicate] [Delete]               ║  │  │
│  │  ╚═══════════════════════════════════════════════════════════════╝  │  │
│  │                                                                      │  │
│  │  ╔═══════════════════════════════════════════════════════════════╗  │  │
│  │  ║  💻 Development                                                ║  │  │
│  │  ║  ─────────────────────────────────────────────────────────── ║  │  │
│  │  ║  Layers: 6  |  Macros: 24  |  Modified: 3 days ago           ║  │  │
│  │  ║                                                               ║  │  │
│  │  ║  [Apply to Device] [Edit] [Duplicate] [Delete]               ║  │  │
│  │  ╚═══════════════════════════════════════════════════════════════╝  │  │
│  │                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## Add New Mapping Dialog

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    ╔═══════════════════════════════════╗                   │
│                    ║     Add Application Mapping      ║                   │
│                    ║ ───────────────────────────────── ║                   │
│                    ║                                   ║                   │
│                    ║  Application:                     ║                   │
│                    ║  ┌───────────────────────────┐   ║                   │
│                    ║  │ Select application...   ▼ │   ║                   │
│                    ║  └───────────────────────────┘   ║                   │
│                    ║                                   ║                   │
│                    ║  Configuration Profile:          ║                   │
│                    ║  ┌───────────────────────────┐   ║                   │
│                    ║  │ Default                 ▼ │   ║                   │
│                    ║  └───────────────────────────┘   ║                   │
│                    ║                                   ║                   │
│                    ║  Device Binding:                 ║                   │
│                    ║  ○ Any compatible device         ║                   │
│                    ║  ● Specific device:              ║                   │
│                    ║  ┌───────────────────────────┐   ║                   │
│                    ║  │ Keychron K2 Pro        ▼ │   ║                   │
│                    ║  └───────────────────────────┘   ║                   │
│                    ║                                   ║                   │
│                    ║  [Cancel]        [Add Mapping]   ║                   │
│                    ╚═══════════════════════════════════╝                   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## Component States & Interactions

### Card Hover State
```
╔═══════════════════════════════════════════════════════════════╗
║  💻 Visual Studio Code                              ○ Inactive ║ ← Slight shadow
║  ─────────────────────────────────────────────────────────── ║   Border highlight
║  Bundle: com.microsoft.VSCode                                 ║   Scale: 1.02
║  Profile: [Development  ▼]                    [⚙️] [📋] [🗑️]  ║ ← Icons visible
║  Device: Any compatible device                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### Empty State
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                          No App Mappings Yet                        │
│                                                                      │
│                    📱 ← Large icon                                  │
│                                                                      │
│         Start by adding your first application mapping              │
│         to automatically switch keyboard profiles                   │
│                                                                      │
│                      [+ Add First Mapping]                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Color Scheme & Visual Elements

### Status Indicators
- 🟢 Active/Enabled - Bright accent color
- ⚪ Inactive/Disabled - Muted gray
- 🔵 In Progress - Pulsing animation

### Card Design
- Background: `var(--bg_menu)` with subtle gradient
- Border: 2px solid, changes color on hover
- Shadow: Soft drop shadow, increases on hover
- Corners: 12px border radius

### Typography
- Headers: 18px, bold, uppercase
- Card titles: 16px, medium weight
- Metadata: 14px, regular, slightly muted
- Bundle IDs: 12px, monospace font

### Spacing
- Card padding: 20px
- Grid gap: 20px
- Section spacing: 32px
- Button spacing: 12px

### Animations
- Card hover: 200ms ease-out transform
- Tab switch: 300ms fade transition
- Dialog open: Slide up with backdrop fade
- Toggle switch: Smooth 200ms slide

## Responsive Breakpoints

### Desktop (>1200px)
- 3 cards per row
- Full sidebar visible

### Tablet (768px - 1200px)
- 2 cards per row
- Collapsible sidebar

### Mobile (<768px)
- 1 card per row
- Stack all elements vertically
- Bottom sheet for dialogs