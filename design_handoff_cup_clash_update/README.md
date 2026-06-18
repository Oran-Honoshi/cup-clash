# Handoff: Cup Clash — Home Carousel, My Picks & Schedule

## Overview

This package documents the UI/UX redesign of the Cup Clash mobile app — a World Cup prediction game. The changes cover three main screens (Home, My Picks, Schedule) plus a global bottom navigation bar. The prototype was designed for a 390 × 844 pt canvas (iPhone 14 equivalents) and should translate directly to the Capacitor-wrapped native app and the PWA shell.

## About the Design Files

`Cup Clash Prototype.dc.html` is a **high-fidelity interactive prototype** built in HTML. It shows intended look, layout, interactions and micro-animations. It is **not production code** — your job is to recreate these designs inside the existing Capacitor / PWA codebase using whatever component library, routing solution and state manager is already in place (React + Ionic, Vue + Quasar, plain web components, etc.). Read and reference the prototype; don't ship it directly.

## Fidelity

**High-fidelity.** Every color, size, spacing value, font weight and interaction shown in the prototype is intentional and should be matched as closely as the target framework allows.

---

## Design Tokens

### Colors

| Token | Hex | Usage |
|---|---|---|
| `color-bg-app` | `#030a04` | Phone / app background |
| `color-bg-surface` | `#0c1c0c` | Cards, panels |
| `color-bg-surface-2` | `#0e1f0e` | Accordions, list rows |
| `color-bg-surface-3` | `#091409` | Nested / inset cells |
| `color-bg-header` | `#020804` | Status bar, nav bar, header strip |
| `color-border` | `#1a3a1a` | Default card border |
| `color-border-dim` | `#162a16` | Dividers, subtle borders |
| `color-border-strong` | `#1c5a1c` | Highlighted / focused border |
| `color-accent` | `#00e5a0` | Primary accent — active states, CTAs, scores |
| `color-accent-dim` | `#2a5a2a` | Inactive nav labels, muted accent text |
| `color-accent-dimmer` | `#1c3a1c` | Disabled pill backgrounds |
| `color-text-primary` | `#e0f2e0` | Headings, app title |
| `color-text-secondary` | `#a0c8a0` | Body labels, player names |
| `color-text-muted` | `#7ab07a` | Sub-labels, secondary values |
| `color-text-faint` | `#3a7a3a` | Metadata, timestamps |
| `color-gold` | `#ffaa00` | 1st place, exact-score badge |
| `color-success` | `#5aaa6a` | Correct-result badge |
| `color-danger` | `#cc4444` | Missed prediction |
| `color-live` | `#ff6666` | Live match indicator |
| `color-live-bg` | `#2a1010` | Live tab background |
| `color-live-border` | `#5a1a1a` | Live section border |
| `color-notification` | `#e53e3e` | Badge on bell icon |

### Typography

Font family: **Barlow Condensed** (Google Fonts)  
Weights used: 400, 600, 700, 900  
All UI text is uppercase or small-caps by convention.

| Role | Size | Weight | Letter-spacing |
|---|---|---|---|
| App title | 19px | 900 | 2px |
| Section heading | 22–30px | 900 | 0 |
| Panel label / tab | 9px | 700 | 1px |
| Card body | 11–13px | 700 | 0–0.5px |
| Metadata / timestamp | 9–10px | 400 | 1–2px |
| Score digit | 24–26px | 900 | 0 |
| Stat number | 32–64px | 900 | 0 |

### Spacing & Radii

| Token | Value |
|---|---|
| Screen horizontal padding | 18px |
| Screen top padding | 18px |
| Card border-radius | 14–18px |
| Row border-radius | 9–10px |
| Pill border-radius | 20px |
| Score box | 46 × 46px, radius 10px |
| Avatar circle | 32–56px diameter |
| Gap between cards | 6px |
| Gap between stat cells | 8px |

---

## Global Shell

### Status Bar

- Height: **44px**, background `#020804`
- Content: time (left) + signal/battery (right)
- In Capacitor: use `StatusBar` plugin — set style to `Dark`, background `#020804`. On iOS, extend safe area into the status bar region.

### App Header

- Height: **52px**, background `#020804`
- Left: `CUP CLASH` in 19px/900/`#e0f2e0`/letter-spacing 2px
- Right: 🌐 icon button + 🔔 icon button (32 × 32px circles, `#0e1f0e` bg, `1px solid #1c3a1c` border)
- Bell has a red badge (14 × 14px, `#e53e3e`, white 8px monospace text)

### Bottom Navigation

Five items: **HOME · MY PICKS · SCHEDULE · SUMMARY · MORE**  
Only the first three are active; SUMMARY and MORE are shown at 22% opacity with `pointer-events: none`.

Each item:
- `flex: 1`, column layout, centered
- Icon (emoji, 20px)
- Label (9px / 700 / letter-spacing 0.5px)
- Active indicator: 20 × 2px bar, `border-radius: 1px`, color matches label
- Active color: `#00e5a0`; inactive color: `#2a5a2a`
- Total height: **78px**, `padding-top: 10px`, `border-top: 1px solid #0c1c0c`

In Capacitor: add `padding-bottom: env(safe-area-inset-bottom)` to the nav bar so it clears the home indicator on notched devices.

---

## Screen 1 — Home

### Layout

```
[App Header 52px]
[Group Selector 42px]
[Panel Pill Tabs 40px]
[Swipeable Carousel — fills remaining height]
```

### Group Selector Strip

- Height: 42px, background `#020804`, `border-bottom: 1px solid #0c1c0c`
- A single pill button (inline-flex, gap 7px, padding 6px 14px, border-radius 20px, bg `#0e1f0e`, border `1px solid #1c3a1c`)
- Contents: 👥 emoji + group name in 12px/700/`#00e5a0` + `▾` chevron in `#2a5a2a`
- Tapping opens a group-switcher sheet (not prototyped — implement as a bottom sheet)

### Panel Pill Tabs

- Height: 40px, background `#020c04`, `border-bottom: 1px solid #091509`
- Three pills centered with 6px gap: **MATCH · LEADERBOARD · MY STATS**
- Each pill: `padding: 5px 13px`, `border-radius: 20px`
- **Active pill**: bg `#162a16`, border `1px solid #00e5a0`, text `#00e5a0`
- **Inactive pill**: bg `transparent`, border `1px solid #1a3a1a`, text `#3a7a3a`
- Text: 9px / 700 / letter-spacing 1px

### Swipeable Carousel

Three panels laid out horizontally. The visible area is the full remaining height of the screen (overflow hidden). Panels are translated on the X axis.

**Swipe behavior:**
- Track `touchstart` → record `startX`
- Track `touchmove` → `translateX` the panel container in real-time: `offset = -panelIndex × screenWidth + (currentX - startX)`, clamped to `[-(numPanels-1) × width, 0]`
- On `touchend`: if `|diff| > 50px`, advance/retreat panel index; otherwise snap back to current panel
- Snap animation: `transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- On desktop / web: support mouse drag (mousedown → mousemove → mouseup on document) with the same logic
- Tapping a pill tab jumps directly to that panel (animated)
- The container must have `-webkit-tap-highlight-color: transparent` and `user-select: none`

**Panel background (all three):**
```css
background: radial-gradient(ellipse at 50% 120%, #1a3810 0%, #0a1808 55%, #030c04 100%);
```

---

### Panel 0 — Next Match

```
[Metadata label]       ← "GROUP A · TODAY THU 18 JUN · 7:00 PM GMT+3"
[Match Card]
  [Team A flag + name] [Score boxes] [Team B flag + name]
  [Divider]
  [Status label]       [EDIT button]
[Group Picks Card]
  [Label]
  [4 score option chips]
```

**Match Card** (`#0c1c0c`, border-radius 18px, padding 18px 16px 14px, border `1px solid #1a3a1a`)

Team columns (each `flex: 1`, column, centered, gap 6px):
- Flag emoji: 48px
- Name: 10px / 700 / `#7ab07a` / letter-spacing 0.3px

Score boxes (between teams, `flex: none`, gap 5px):
- Each box: 46 × 46px, border-radius 10px, bg `#091808`, border `2px solid #00e5a0`
- Digit: 26px / 900 / `#00e5a0`
- Separator: `–` in 14px / 900 / `#1c4a1c`

Status row (below a `border-top: 1px solid #162a16`, `padding-top: 12px`):
- Left: "✓ PREDICTION SAVED" — 11px / 700 / `#00e5a0`
- Right: EDIT button — `padding: 5px 16px`, border-radius 20px, bg `#0a1c0a`, border `1px solid #2a5a2a`, text 10px / 700 / `#5ab87a`

**Group Picks Card** (`#0c1c0c`, border-radius 14px, padding 13px 14px, border `1px solid #1a3a1a`)

Label: "YOUR GROUP'S PICKS · 11 MEMBERS" — 9px / 400 / `#2a6a2a` / letter-spacing 1px

Four score chips in a row (equal flex, `gap: 5px`):
- bg `#091509`, border-radius 8px, padding 8px 0, text-align center
- Active chip: border `1px solid #2a5a2a`; inactive: border `1px solid #162a16`
- Score text: 16px / 900 (active `#00e5a0` or `#6aaa7a`; inactive `#4a7a4a`)
- Percentage below: 9px / `#2a6a2a`

---

### Panel 1 — Leaderboard

```
[Metadata label]       ← "HEYBLINK FOR REAL · 11 MEMBERS"
[Podium — 3 columns]
[Remaining list card]
```

**Podium** (flex row, `align-items: flex-end`, `justify-content: center`, gap 8px):

Each column is 96px wide, column layout, centered, gap 4px.

| Rank | Avatar size | Avatar border | Bar height | Bar border |
|---|---|---|---|---|
| 2nd (left) | 48px | `2px solid #4a7a4a` | 46px | `1px solid #2a5a2a` |
| 1st (centre) | 56px | `2px solid #ffaa00` | 64px | `1px solid #2a5a2a` |
| 3rd/YOU (right) | 48px | `2px solid #00e5a0` | 34px | `1px solid #00e5a0` |

Avatar: circular (border-radius 50%), bg `#1c3a1c` (or `#2a5a2a` for YOU), emoji inside.  
Bar: width 80px, border-radius `6px 6px 0 0`, bg `#1c3a1c` (or `#162a10` for 1st), medal emoji centered.  
Name: 11px / 700 (`#a0c8a0` for others, `#00e5a0` for YOU)  
Points: 10px (`#5a9a5a` for others, `#00e5a0` for YOU)

**List rows** (in a `#0c1c0c` card, border-radius 14px, border `1px solid #1a3a1a`):
- Rank number: 12px / 700 / `#5a9a5a`, fixed 20px width
- Avatar: 32 × 32px circle
- Name: 13px / 700 / `#a0c8a0`, flex 1
- Points: 13px / 700 / `#7ab07a`
- Row padding: 12px 14px; divider: `border-bottom: 1px solid #162a16`

---

### Panel 2 — My Stats

```
[Metadata label]       ← "FIFA WORLD CUP 2026"
[Rank card — large centered rank]
[2×2 stat grid]
[Accuracy bar card]
```

**Rank Card** (`#0c1c0c`, border-radius 18px, padding 20px, border `1px solid #1a3a1a`, text-center):
- Rank: 64px / 900 / `#00e5a0` (e.g. "3rd")
- Sub-label: "OF 11 MEMBERS" — 11px / `#3a7a3a` / letter-spacing 1px, margin-top 4px

**Stat grid** (`display: grid; grid-template-columns: 1fr 1fr; gap: 8px`):
Each cell: `#0c1c0c`, border-radius 12px, padding 14px, border `1px solid #1a3a1a`
- Big number: 32px / 900 (color varies per stat)
- Label below: 9px / 400 / `#3a7a3a` / letter-spacing 1px, margin-top 4px

| Stat | Value color |
|---|---|
| TOTAL POINTS | `#00e5a0` |
| TODAY | `#ffaa00` |
| EXACT SCORES | `#00e5a0` |
| CORRECT RESULT | `#5aaa6a` |

**Accuracy Bar** (`#0c1c0c`, border-radius 12px, padding 14px, border `1px solid #1a3a1a`):
- Label: "ACCURACY · 72 PREDICTED" — 9px / `#2a6a2a` / letter-spacing 1px, margin-bottom 10px
- Bar: `height: 8px`, `border-radius: 4px`, bg `#091509`, flex row overflow hidden
  - Segment 1 (Exact): 29% / `#00e5a0`
  - Segment 2 (Correct): 42% / `#5aaa6a`
  - Segment 3 (Miss): 29% / `#1c3a1c`
- Legend row below (flex, gap 14px, margin-top 10px):
  - Each item: 8 × 8px colored square (border-radius 2px) + 9px label text

---

## Screen 2 — My Picks

### Layout

```
[Header strip — title + bell + group selector + count badge]
[Scrollable accordion list]
```

### Header Strip (background `#020804`, padding 14px 18px 12px, `border-bottom: 1px solid #0c1c0c`)

Row 1: App title + bell icon (same as home header)

Row 2 (flex, space-between):
- Group selector pill (same as Home)
- `72 / 72 ✓` — 10px / 700 / `#00e5a0`

### Accordion List

Three accordion sections: **GROUP STAGE · TOURNAMENT PICKS · BONUS QUESTIONS**

Each section: `#0e1f0e`, border-radius 14px, border `1px solid #1a3a1a`, overflow hidden.

**Section header row** (padding 14px, flex, gap 10px, cursor pointer):
- Icon emoji (16px)
- Title: 15px / 900
- Flex spacer
- Metadata text: 10px / `#2a7a2a`
- Chevron: `▾` (open) / `›` (closed) — 14px, `#00e5a0` (active section) or `#3a6a3a`

When open: `border-top: 1px solid #162a16` + content below.

**GROUP STAGE content:**

Sub-rows for each group (padding 8px 10px, bg `#091409`, border-radius 9px):
- Group label: 10px / 700 / `#4a9a4a`, fixed 46px width
- Flag emoji pair
- Completion status text
- Chevron

When a group row is expanded, show match results below it (indented 12px, bg `#071207`, border-radius 8px, padding 9px 11px, border `1px solid #162a16`):
- Each match row: score label (flex 1, 10px / `#3a7a3a`) + result badge
- Badges: EXACT (+25) = `#ffaa00` on `#162a10`; MISSED = `#cc4444` on `#1a0a0a`; SAVED = `#00e5a0` on `#162a16`; CORRECT (+10) = `#5aaa6a` on `#162a16`
- Badge: border-radius 5px, padding 2px 9px, 9px / 700

**TOURNAMENT PICKS content** (padding 12px 14px, column, gap 10px):
- Each row: label (9px / `#2a6a2a`, fixed 96px width) + flag emoji + value text (13px / 700 / `#a0c8a0`)

**BONUS QUESTIONS content:**
- Inner card (`#091409`, border-radius 10px, padding 12px 13px, border `1px solid #162a16`)
- Question in 10px / `#2a6a2a`, margin-bottom 10px
- Answer chips: flex wrap, gap 6px — each chip `padding: 5px 12px`, border-radius 6px, 11px text
  - Default chip: bg `#162a16`, border `1px solid #2a5a2a`, text `#5a9a5a`
  - Selected chip: border `1.5px solid #00e5a0`, text `#00e5a0`, font-weight 700
- BONUS QUESTIONS header has a badge: "2 NEW" — bg `#3a2a00`, border `1px solid #5a4400`, text 9px / 700 / `#ffaa00`, border-radius 12px, padding 3px 8px

---

## Screen 3 — Schedule

### Layout

```
[Header strip — title + subtitle + bell + search bar + 4 tab pills]
[Scrollable match list]
```

### Header Strip (background `#020804`, padding 14px 18px 12px, `border-bottom: 1px solid #0c1c0c`)

Row 1 (flex, align-items center):
- Left column: sub-label "FIFA WORLD CUP 2026" (9px / `#3a7a3a` / letter-spacing 2px) + title "SCHEDULE" (22px / 900 / `#e0f2e0`)
- Right: bell icon button

**Search bar** (margin-bottom 10px): border-radius 22px, bg `#0e1f0e`, padding 8px 14px, border `1px solid #1c5a1c`, flex row, gap 10px
- 🔍 icon (13px / `#3a7a3a`)
- Placeholder text: 12px / italic / `#2a5a2a`
- Right: filter chip "83/108 ▾" — bg `#162a16`, border `1px solid #2a5a2a`, border-radius 10px, padding 2px 8px, 9px / `#3a7a3a`

**4-tab row** (bg `#091409`, border-radius 10px, border `1px solid #162a16`, overflow hidden, inner padding 3px, gap 2px):

Tabs: **● LIVE · TODAY · UPCOMING · DONE**

| Tab | Active bg | Active text | Inactive text |
|---|---|---|---|
| LIVE | `#2a1010` | `#ff6666` | `#3a6a3a` |
| TODAY | `#162a16` | `#00e5a0` | `#3a6a3a` |
| UPCOMING | `#162a16` | `#00e5a0` | `#3a6a3a` |
| DONE | `#162a16` | `#00e5a0` | `#3a6a3a` |

Each tab: `flex: 1`, `padding: 7px 0`, `text-align: center`, `border-radius: 7px`.  
Active: font-weight 700; inactive: font-weight 400. Font: 10–11px.

Default selected tab: **TODAY**.

### Match List (scrollable, bg `#030c04`, padding 10px 14px, gap 5px)

**Section header:** date label (9px / 700 / `#00e5a0` or `#5a9a5a` or `#4a7a4a`) + count label (9px / `#2a5a2a`)

**Live match row** (bg `#160e0e`, border-radius 12px, padding 12px 13px, border `1px solid #3a1a1a`):
- Teams line (flex): label 11px / 700 / `#c8a0a0` + live badge
- Live badge: bg `#3a1010`, border `1px solid #5a1a1a`, border-radius 6px, padding 3px 9px; pulsing dot (6px, `#ff4444`, animation `pulse 1s infinite`) + score+minute text (11px / 700 / `#ff6666`)
- Your pick result below: 10px / 700 / `#cc4444`

**Today match row** — highlighted: border `1.5px solid #00e5a0`; others: border `1px solid #1a3a1a`. Both bg `#0e1f0e`, border-radius 12px, padding 12px 13px.
- Teams + time (flex, margin-bottom 8px): 11px / 700 / `#a0c8a0` + time 9px / `#2a6a2a`
- Score chips row (flex, gap 6px): two 26 × 26px boxes + "✓ Saved" text + spacer + group badge

Score chip: border-radius 6px, bg `#162a16`. Next match: border `1.5px solid #00e5a0`, text `#00e5a0`. Others: border `1.5px solid #2a5a2a`, text `#5aaa5a`.

Group badge: bg `#162a16`, border `1px solid #2a5a2a`, border-radius 6px, padding 2px 8px, 9px / `#2a7a2a`.

**Upcoming match row** — minimal: just teams + time. No score chips yet (prediction not made or match hasn't started).

**Done match row** (bg `#0a140a`, border `1px solid #162a16`, border-radius 12px, padding 12px 13px, opacity 0.9):
- Result headline + FT badge (bg `#162a10`, border `1px solid #2a4a10`, text `#ffaa00`, 9px / 700)
- Your pick result: 10px / 700 / `#00e5a0` (exact) or `#cc4444` (missed)

---

## Interactions & Behavior

### Carousel (Home panels)

```
touchstart  → record startX, disable panel track transition
touchmove   → translateX = clamp(-maxOffset, 0, -panel × width + delta)
touchend    → if |delta| > 50: increment/decrement panel index
              else: snap back (re-enable transition, restore transform)
Pill tap    → set panel index directly (animated)
Mouse drag  → same as touch (attach mousemove/mouseup to document)
              set cursor: grabbing on document.body during drag
```

Easing for snap: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` over 320ms.

### Accordion (My Picks)

- Tap header row → toggle section open/closed
- Group sub-rows: tap to expand inline match list
- Only one group can be expanded at a time (reset `activeGroup` when parent closes)
- No animated height transition required — instant show/hide is acceptable

### Schedule Tabs

- Tap tab → show corresponding section in the list, hide others
- Tab state is local to the screen; reset to TODAY when navigating away and back (or persist in session storage — team's call)

### Navigation

- Bottom nav taps change the active screen
- No animated screen transitions in the prototype — a simple instant swap is acceptable, though a subtle `opacity` or `translateY` fade-in would improve the feel
- In Capacitor: hardware back button on Android should navigate Home → exit app (not between tabs)

---

## PWA-Specific Implementation Notes

1. **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` — the `viewport-fit=cover` ensures the app reaches into the notch/corners.

2. **Safe areas**: wrap the full app shell in padding that respects `env(safe-area-inset-*)`:
   ```css
   padding-top: env(safe-area-inset-top);
   padding-bottom: env(safe-area-inset-bottom);
   ```
   The bottom nav is the most critical — add `padding-bottom: env(safe-area-inset-bottom)` to the nav bar container, not the items.

3. **Prevent pull-to-refresh & bounce scroll**: on the app root, add:
   ```css
   overscroll-behavior: none;
   ```
   and on the status bar / header areas: `touch-action: none;`

4. **Scroll areas**: only the inner panel `<div>` (inside each carousel panel) and the list areas on Picks/Schedule should be scrollable. The app shell itself must not scroll.

5. **Prevent text selection during drag**: `user-select: none` globally, and call `e.preventDefault()` on `mousedown` to prevent browser drag behaviour.

6. **Web App Manifest** (`manifest.json`):
   ```json
   {
     "name": "Cup Clash",
     "short_name": "Cup Clash",
     "background_color": "#030a04",
     "theme_color": "#020804",
     "display": "standalone",
     "orientation": "portrait"
   }
   ```

7. **Theme color meta tag**:
   ```html
   <meta name="theme-color" content="#020804">
   ```
   This colours the browser chrome / status bar on Android to match the app header.

---

## Capacitor-Specific Implementation Notes

1. **StatusBar plugin** (`@capacitor/status-bar`):
   ```typescript
   import { StatusBar, Style } from '@capacitor/status-bar';

   // On app launch:
   await StatusBar.setStyle({ style: Style.Dark });
   await StatusBar.setBackgroundColor({ color: '#020804' });
   // On iOS — draw content under the status bar:
   await StatusBar.setOverlaysWebView({ overlay: true });
   ```
   When overlaying on iOS, add `padding-top: env(safe-area-inset-top)` to the header strip so content isn't hidden behind the camera notch.

2. **Keyboard plugin** (`@capacitor/keyboard`) — not directly used by this UI, but important if the search bar on Schedule becomes interactive:
   ```typescript
   Keyboard.addListener('keyboardWillShow', info => {
     // Adjust scroll area height
   });
   ```

3. **Android back button** (`App.addListener('backButton', ...)`):
   - If on Home → `App.exitApp()`
   - If on another tab → navigate back to Home
   - If an accordion is open → close it first

4. **Haptics** (`@capacitor/haptics`) — recommended on:
   - Panel snap completion (Light impact)
   - Prediction save (Medium impact)
   - Tab switch (Selection changed)

5. **Splash screen**: background `#030a04`, logo centered. The dark green matches the app background so the transition is seamless.

6. **Touch scroll areas in WKWebView (iOS)**: mark scrollable containers with `-webkit-overflow-scrolling: touch` and ensure they have an explicit height so overflow is triggered correctly.

7. **Safe area bottom** — the bottom nav must account for the home indicator on iPhone:
   ```css
   .bottom-nav {
     padding-bottom: max(10px, env(safe-area-inset-bottom));
   }
   ```

---

## Assets

- **Font**: Barlow Condensed via Google Fonts — load as a `@font-face` bundle locally for offline/PWA use rather than relying on the CDN.
- **Icons**: all icons in the prototype are Unicode emoji. If you want platform-native icons for the bottom nav, use SF Symbols (iOS) or Material Icons (Android/web) as a drop-in replacement; keep emoji only for match flags and player avatars.
- **Flag emoji**: use the regional indicator Unicode sequence (e.g. 🇨🇿 🇿🇦). These render natively on all modern OS.

---

## Files in This Package

| File | Description |
|---|---|
| `README.md` | This document |
| `Cup Clash Prototype.dc.html` | Interactive high-fidelity prototype — open in a browser to see the full design |

Open `Cup Clash Prototype.dc.html` in Chrome or Safari. Use the bottom nav to switch screens. On the Home screen, drag or click the pill tabs to switch panels.
