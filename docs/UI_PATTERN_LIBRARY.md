# UI Pattern Library

> ASCEND's reusable component system — Glass Forge design direction with spring-physics animations.

---

## Design Tokens (`app/globals.css`)

### Fonts (loaded via Google Fonts in `app/layout.tsx`)
- **`--font-display`**: Space Grotesk — headings, display numbers
- **`--font-body`**: Inter — body text
- **`--font-mono`**: JetBrains Mono — data values (weights, times, counts)

CSS utility classes: `.font-display`, `.font-body`, `.font-data`

### Domain Colors (RGB triplets for alpha compositing)
| Domain | CSS Variable | RGB |
|--------|-------------|-----|
| Hub | `--domain-hub-rgb` | 34 211 238 |
| Gym | `--domain-gym-rgb` | 139 92 246 |
| Running | `--domain-running-rgb` | 249 115 22 |
| Martial Arts | `--domain-martial-rgb` | 239 68 68 |
| Tracking | `--domain-tracking-rgb` | 16 185 129 |
| Nutrition | `--domain-nutrition-rgb` | 245 158 11 |
| Cycle | `--domain-cycle-rgb` | 236 72 153 |
| Social | `--domain-social-rgb` | 59 130 246 |
| AI | `--domain-ai-rgb` | 20 184 166 |

### Glass Forge Surfaces
| Token | Value | Usage |
|-------|-------|-------|
| `--glass-bg` | `rgba(255 255 255 / 0.04)` | Card backgrounds |
| `--glass-bg-hover` | `rgba(255 255 255 / 0.07)` | Hover state |
| `--glass-bg-active` | `rgba(255 255 255 / 0.10)` | Active/pressed state |
| `--glass-border` | `rgba(255 255 255 / 0.06)` | Default borders |
| `--glass-border-hover` | `rgba(255 255 255 / 0.12)` | Hover borders |
| `--glass-glow-spread` | `0 0 40px -8px` | Ambient glow shadow spread |

### Border Radius Scale
`--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-xl: 20px`, `--radius-2xl: 24px`

---

## Components

### AnimatedTabs (`app/components/ui/animated-tabs.tsx`)

Reusable tab switcher with Framer Motion spring physics. Replaces all inline tab patterns.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabItem[]` | required | `{ key, label, icon? }` |
| `activeTab` | `string` | required | Currently active tab key |
| `onTabChange` | `(key: string) => void` | required | Tab change handler |
| `columns` | `number` | tab count | Grid columns |
| `accentRgb` | `string` | accent CSS var | Domain color override (RGB triplet) |

**Animation details:**
- `layoutId="tab-active-bg"` — sliding glow background between tabs
- Hover: `scale: 1.04, y: -2` with spring (stiffness: 500, damping: 30)
- Tap: `scale: 0.96`
- Active icon: `scale: 1.15` with wiggle rotation `[-8°, 8°, 0°]`

**Also exports:** `TabContent` — animated content wrapper with directional enter/exit.

**Used in:** Progress (4 tabs), Rankings (2 tabs), Cycle (4 tabs, pink accent)

---

### GlassCard (`app/components/ui/glass-card.tsx`)

Primary container with frosted glass morphism.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `glowRgb` | `string` | accent | Hover glow color (RGB triplet) |
| `static` | `boolean` | false | Disable hover animation |
| `className` | `string` | — | Extra classes |

**Animation:** hover lifts with `scale: 1.015` + border brightens + ambient glow shadow.

---

### StatChip (`app/components/ui/glass-card.tsx`)

Small pill displaying a value + label, domain-colored.

**Props:** `label`, `value`, `colorRgb?`, `className?`

---

### ProgressRing (`app/components/ui/glass-card.tsx`)

SVG circular progress with spring-animated fill.

**Props:** `value`, `max`, `size?` (default 64), `strokeWidth?` (4), `colorRgb?`, `label?`

---

### TimelineRow (`app/components/ui/timeline-row.tsx`)

Left-bordered card with timestamp for activity feeds and notifications.

**Props:** `timestamp`, `children`, `accentRgb?`

---

### QuickActionFab (`app/components/ui/quick-action-fab.tsx`)

Floating action button that expands to reveal action items.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `actions` | `FabAction[]` | `{ key, label, icon, onClick, colorRgb? }` |
| `accentRgb` | `string?` | Main button color |

**Animation:** Actions stagger in from bottom with spring physics. Main button rotates 45° to become X on open.

---

## Motion System (`app/lib/motion.ts`)

Pre-built Framer Motion variants:

| Variant | Usage |
|---------|-------|
| `fadeIn` | Simple opacity |
| `fadeInUp` | Cards entering viewport |
| `slideUp` | Bottom sheets, modals |
| `staggerContainer` + `staggerItem` | Lists |
| `tabContent` | Tab content enter/exit |
| `modalOverlay` + `modalContent` | Modal dialogs |
| `cardHover` / `cardTap` | Interactive cards |

---

## Usage Pattern

```tsx
import AnimatedTabs from "@/app/components/ui/animated-tabs";
import GlassCard, { StatChip, ProgressRing } from "@/app/components/ui/glass-card";

// Tabs with domain color
<AnimatedTabs
  tabs={[
    { key: "today", label: "TODAY", icon: Zap },
    { key: "log", label: "LOG", icon: Plus },
  ]}
  activeTab={tab}
  onTabChange={setTab}
  accentRgb="236 72 153" // cycle pink
/>

// Glass card with glow
<GlassCard glowRgb="139 92 246" className="p-4">
  <StatChip label="volume" value="12,450 kg" colorRgb="139 92 246" />
  <ProgressRing value={1800} max={2200} colorRgb="245 158 11" label="kcal" />
</GlassCard>
```
