# Navigation System — Hub-and-Spoke

> Implements Bible Section 3: 5-tab bottom nav with sub-nav pills inside each tab group.

---

## Architecture

**Bottom tabs** (mobile): 5 permanent tabs in `app/components/MobileNav.tsx`
**Sidebar** (desktop): Sectioned nav in `app/components/Sidebar.tsx`

Both sex-aware — female mode adds Cycle pill under Track, shows ♀ badge, pink accent on mode indicator.

### Tab Groups

| Tab | Icon | Default Route | Sub-Nav Pills | Conditional |
|-----|------|--------------|---------------|-------------|
| **Hub** | `LayoutDashboard` | `/` | — (single page) | — |
| **Train** | `Dumbbell` | `/workout` | Workout, Schedule | Future: Exercises, Learn |
| **Track** | `TrendingUp` | `/progress` | Progress, Recovery | + Cycle (female only) |
| **Social** | `Users` | `/rankings` | Rankings, Achievements | Future: Feed, Guilds |
| **You** | `User` | `/profile` | Profile, AI Coach, Alerts | Future: Character, Settings, Discover |

### Route Matching

Each tab matches multiple routes so the correct tab highlights regardless of which sub-page you're on:

```
Hub:    ["/"]
Train:  ["/workout", "/schedule"]
Track:  ["/progress", "/recovery", "/cycle"]
Social: ["/rankings", "/achievements"]
You:    ["/profile", "/notifications", "/coach"]
```

---

## Sub-Nav Pills (`app/components/ui/sub-nav-pills.tsx`)

Horizontal scrollable strip with spring-animated active indicator. Domain-colored via `accentRgb` prop.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `pills` | `NavPill[]` | `{ key, label, icon? }` — key is the route path |
| `activeKey` | `string` | Current route path |
| `onSelect` | `(key: string) => void` | Usually `router.push(k)` |
| `accentRgb` | `string?` | Domain color override (RGB triplet) |

### Domain Colors on Pills

| Tab Group | `accentRgb` | Color |
|-----------|-------------|-------|
| Train | default (user accent) | Cyan |
| Track | default (user accent) | Cyan |
| Cycle | `"236 72 153"` | Pink |
| Social | `"59 130 246"` | Blue |
| You | default (user accent) | Cyan |

### Pill Definitions (`app/lib/navPills.ts`)

Centralized pill arrays so all pages in a group share the same pills:
- `trainPills` — Workout + Schedule
- `getTrackPills(isFemale)` — Progress + Recovery + optional Cycle
- `socialPills` — Rankings + Achievements
- `youPills` — Profile + AI Coach + Alerts

---

## Sex-Aware Behavior

### Male Mode
- 4 pills in Track: Progress, Recovery
- Bottom nav: 5 tabs (Hub, Train, Track, Social, You)
- Mode badge: ♂ MALE (blue)
- Sidebar: "♂ MALE MODE" status

### Female Mode
- 3 pills in Track: Progress, Recovery, **Cycle** (pink accent)
- Cycle page uses pink `accentRgb="236 72 153"` on its pills
- Bottom nav: same 5 tabs (Cycle accessible via Track pills)
- Mode badge: ♀ FEMALE (pink)
- Sidebar: "♀ FEMALE MODE" status, Cycle link in TRACK section

---

## Files Changed

| File | Change |
|------|--------|
| `app/components/MobileNav.tsx` | 5-tab structure: Hub, Train, Track, Social, You |
| `app/components/Sidebar.tsx` | 5-section layout with domain labels, sex-aware |
| `app/components/ui/sub-nav-pills.tsx` | **New** — reusable pill strip component |
| `app/lib/navPills.ts` | **New** — centralized pill definitions |
| `app/(main)/workout/page.tsx` | Added Train pills |
| `app/(main)/schedule/page.tsx` | Added Train pills |
| `app/(main)/progress/page.tsx` | Added Track pills (sex-aware) |
| `app/(main)/recovery/page.tsx` | Added Track pills, removed back button |
| `app/(main)/cycle/page.tsx` | Added Track pills (pink accent) |
| `app/(main)/rankings/page.tsx` | Added Social pills (blue), removed back button |
| `app/(main)/achievements/page.tsx` | Added Social pills (blue), removed back button |
| `app/(main)/profile/page.tsx` | Added You pills |
| `app/(main)/notifications/page.tsx` | Added You pills, removed back button |
| `app/(main)/coach/page.tsx` | Added You pills |
