---
name: Cup Clash
description: Private World Cup 2026 prediction league — dark glass aesthetic, neon scoreboard energy, social-not-casino.
colors:
  bg: "#050810"
  bg-alt: "#080510"
  bg-stadium: "#080C16"
  surface-glass: "#120E2652"
  surface-glass-strong: "#120E2680"
  border-hairline: "#FFFFFF24"
  border-strong: "#FFFFFF2E"
  accent-mint: "#00FF88"
  accent-cyan: "#00D4FF"
  accent-purple: "#8B5CF6"
  accent-amber: "#FBBF24"
  accent-pink: "#EC4899"
  state-danger: "#F87171"
  fg-primary: "#FFFFFF"
  fg-muted: "#FFFFFFB3"
  fg-dim: "#FFFFFF80"
  fg-faint: "#FFFFFF59"
  landing-ink: "#0F172A"
typography:
  hero:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(48px, 7vw, 92px)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(40px, 5vw, 64px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.15
  card:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.2
  body-lg:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.55
  meta:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.18em"
  chip:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.1em"
  scoreboard:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "30px"
    fontWeight: 900
    lineHeight: 1
rounded:
  sm: "8px"
  md: "10px"
  lg: "14px"
  xl: "18px"
  2xl: "22px"
  3xl: "24px"
  phone: "34px"
  phone-xl: "44px"
  pill: "100px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "36px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent-mint}"
    textColor: "#0B141B"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "16px 28px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-cyan}"
    textColor: "#0B141B"
  button-secondary:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.fg-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "12px 20px"
    height: "44px"
  button-ghost:
    backgroundColor: "#FFFFFF00"
    textColor: "{colors.fg-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "8px 14px"
  chip-accent:
    backgroundColor: "#00FF8818"
    textColor: "{colors.accent-mint}"
    typography: "{typography.chip}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  chip-cyan:
    backgroundColor: "#00D4FF1F"
    textColor: "{colors.accent-cyan}"
    typography: "{typography.chip}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  chip-amber:
    backgroundColor: "#FBBF241F"
    textColor: "{colors.accent-amber}"
    typography: "{typography.chip}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  glass-card:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.fg-primary}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  glass-card-strong:
    backgroundColor: "{colors.surface-glass-strong}"
    textColor: "{colors.fg-primary}"
    rounded: "{rounded.3xl}"
    padding: "36px"
  input-default:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.fg-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    height: "44px"
  score-cell:
    backgroundColor: "#00FF8814"
    textColor: "{colors.accent-mint}"
    typography: "{typography.scoreboard}"
    rounded: "{rounded.sm}"
    padding: "0"
    width: "32px"
    height: "32px"
  bottom-nav-item-active:
    backgroundColor: "#FFFFFF00"
    textColor: "{colors.accent-mint}"
    typography: "{typography.chip}"
    rounded: "{rounded.md}"
    padding: "12px 8px"
---

# Design System: Cup Clash

## 1. Overview

**Creative North Star: "The Stadium Scoreboard"**

Cup Clash is built like the floodlit perimeter board of a packed stadium at kickoff: deep navy-black field, illuminated glass panels floating above it, neon mint and electric cyan as the channels that light up when something happens. Big numerals are mono, not pretty — they belong on a scoreboard, not a marketing slide. Type set in Bricolage Grotesque carries the loud, almost broadcast-graphics title voice; Outfit handles the calm legible body; JetBrains Mono owns every number that changes during a match (scores, points, ranks, timers).

The system is **two surfaces sharing one design language.** The product app (dashboard, predictions, leaderboard, chat, bracket) lives in the dark scoreboard. The marketing landing (`/`, `/pricing`, `/for-companies`, `/articles`) inverts to a light surface — same accents, same type, same component shapes, but on a pale background with `#0F172A` ink. Use the dark scoreboard for product surfaces; use the light landing palette for marketing surfaces. Components are register-aware via the `.landing-page` class scope.

What this system explicitly rejects: the aggressive odds-board patina of sportsbooks (DraftKings, Bet365), the cream-and-rounded sameness of generic SaaS landings, and the mascot-driven warmth of Duolingo-style cartoon UI. The scoreboard metaphor draws the line — informational, broadcast-grade, sharp; never urgency-manipulative, never twee.

**Key Characteristics:**
- Dark navy-black field (`#050810`) with translucent purple-tinted glass panels (`rgba(18,14,38,0.32)`), not flat dark grey.
- Three illuminated accents in fixed roles: **mint** (`#00FF88`) = you / wins / primary CTA; **cyan** (`#00D4FF`) = live / info / secondary CTA; **amber** (`#FBBF24`) = leaders / crowns. Purple and pink are tertiary, never primary.
- Tri-font system: Bricolage Grotesque (display, 800), Outfit (UI, 500), JetBrains Mono (scoreboard numerals, 900).
- Glass-blur surfaces with inset top highlight — the panels feel lit from above, not flat.
- Neon glow shadows reserved for moments of state (primary CTA, live indicator, "you" row on leaderboard). Never decorative.
- Motion timed in three steps: `140ms` for snaps, `220ms` for state changes, `400ms` for entrances; eased with `cubic-bezier(0.16, 1, 0.3, 1)`.

## 2. Colors

A dark scoreboard ground plus three illuminated accents, plus a single light inversion for the marketing surface.

### Primary
- **Neon Mint** (`#00FF88` · `oklch(89% 0.27 156)`): The "you" color. Primary CTA fills, "you" row on the leaderboard, the saved-pick state, wins, the gradient companion in the primary button (`linear-gradient(135deg, #00FF88, #00D4FF)`). Used with a soft glow (`0 8px 30px rgba(0,255,136,0.4)`) on CTAs and as a 2px left border on the "you" leaderboard row.

### Secondary
- **Electric Cyan** (`#00D4FF` · `oklch(83% 0.16 217)`): The "live / info" color. LIVE timer text, live-dot pulse, cyan-glass score bar at the top of chat during a match, the second half of the primary CTA gradient, corporate-funnel chips ("You join for FREE").
- **Tournament Purple** (`#8B5CF6`): The "premium / tournament-pick" color. Tournament Picks screen accents, purple-glass card variant, premium tier callouts.

### Tertiary
- **Stadium Amber** (`#FBBF24`): Leaders, crowns, podium #1, streak counters. The single non-cool color in the palette — used sparingly to signal "elite".
- **Bracket Pink** (`#EC4899`): Full-bracket / tournament-wide accent. Rare. Used on the bracket overlay and the full-bracket badge.
- **Result Red** (`#F87171`): Danger / lost / eliminated state. Never used for primary actions; always paired with an icon so red is not the sole signal.

### Neutral
- **Deep Navy Field** (`#050810`): The page background. Almost-black with a hint of navy — a true black would be inert; this hue is alive at scale.
- **Stadium Alt** (`#080C16`): The applied background on `<html>` and `<body>` — slightly bluer than the token bg, intentional so the layered glass panels read as floating above a slightly different ground.
- **Tinted Purple Glass** (`rgba(18,14,38,0.32)`): The standard glass panel base. Purple tint is what separates Cup Clash from generic dark-grey UI.
- **Strong Glass** (`rgba(18,14,38,0.5)`): The lifted/modal variant.
- **Hairline Border** (`rgba(255,255,255,0.14)` standard, `0.18` strong): Always white at low opacity, never a colored stroke.
- **Text scale on dark:** white `#FFFFFF` (primary) → 70% (muted) → 50% (dim) → 35% (faint). The 35% tier is the floor — anything dimmer fails AA on glass.
- **Landing Ink** (`#0F172A`): The dark navy used as text color on the *light* marketing surface. Same hue family as the scoreboard field, kept consistent so brand identity carries across the inversion.

### Named Rules

**The Three-Channel Rule.** Cup Clash has exactly three accent *roles*: you/win = mint, live/info = cyan, leader = amber. Designers must not invent a fourth accent role. Purple, pink, and red are reserved for the specific surfaces named above. If a new screen seems to need a new color, the answer is to lean harder into one of the three.

**The Glass-Tinted-Purple Rule.** Glass panels carry a **purple-tinted** base (`rgb(18,14,38)` at 32% / 50% alpha), never flat grey. The purple tint is what separates this from generic dark UI. If a panel looks grey, the alpha is wrong or the tint was dropped.

**The Neon-Is-Earned Rule.** Glow shadows (`shadow-neon-*`, `glow-ac`, `glow-cyan`) appear on three things only: primary CTAs, the live-dot indicator, and the "you" highlight. Glow on decorative elements reads as crypto-throwback.

## 3. Typography

**Display Font:** Bricolage Grotesque (with `system-ui, sans-serif` fallback)
**Body Font:** Outfit (with `system-ui, sans-serif` fallback)
**Scoreboard Font:** JetBrains Mono (with `ui-monospace, monospace` fallback)

**Character:** A broadcast-graphics title voice (Bricolage's tight 800-weight set with `-0.02em` letter-spacing) paired with a calm, geometric body face (Outfit, 500) and a hard mono for every number that changes during a match. The pairing is deliberate: the headlines look like they belong on a Sky Sports lower-third, the body reads like a modern consumer app, the mono looks like a fourth-official's substitution board. No serifs anywhere; serifs would soften the gameday feel.

### Hierarchy

- **Hero** (Bricolage, 800, `clamp(48px, 7vw, 92px)`, line-height 1.05, tracking -0.02em): Landing-page H1 only. The "Predict every match" headline.
- **Display** (Bricolage, 800, `clamp(40px, 5vw, 64px)`, line-height 1.1): Section H2s on landing, big stat displays in profile.
- **Title** (Bricolage, 800, 26px, line-height 1.15): Card titles, "How it works" step headings, leaderboard group titles.
- **Card** (Bricolage, 800, 19px, line-height 1.2): Phone-screen headings, dashboard section headings.
- **Body-Large** (Outfit, 500, 19px, line-height 1.5): Hero subtitle on landing, the calm second voice under a big headline.
- **Body** (Outfit, 500, 14px, line-height 1.55): Default paragraph. Cap line length at 65–75ch on landing prose surfaces.
- **Meta** (Outfit, 500, 13px, line-height 1.4): Nav links, meta info, secondary card text.
- **Label** (Outfit, 700, 11px, uppercase, tracking 0.18em): The eyebrow labels ("SIMPLE BY DESIGN", "UPCOMING (3)"). Always uppercase.
- **Chip** (Outfit, 700, 11px, uppercase, tracking 0.1em): Inside chip components and small status badges.
- **Scoreboard** (JetBrains Mono, 900, 30px): Live scores, points totals, rank numbers, countdown timers. The biggest, hardest-set thing on any product screen.

### Named Rules

**The Mono-For-Numbers Rule.** Any number that *changes* during the tournament — scores, points totals, ranks, countdowns, streaks, timers — must be JetBrains Mono at weight 900. Static numbers in body prose (e.g. "104 matches" in marketing copy) use the body font like normal. This is the rule that makes the scoreboard feel like a scoreboard.

**The Uppercase Eyebrow Rule.** Every section is announced by a tiny uppercase label one step above the heading (`label-caps`, 11px, weight 700, tracking 0.18em, often in cyan). It anchors hierarchy without forcing a heavier H2.

## 4. Elevation

Cup Clash uses **glass-and-glow elevation**, not classic Material-style shadow stacks. Surfaces are layered translucent panels (the "glass" pattern); depth is conveyed through backdrop-blur (`blur(40px) saturate(180%)`), an inset top highlight (`inset 0 1px 0 rgba(255,255,255,0.18)`) that fakes a top-edge light source, and selective neon glow on interactive elements that need to feel "live".

The result: at rest, surfaces feel like floating illuminated panels; on interaction, primary actions glow as if the scoreboard channel just lit up.

### Shadow Vocabulary

- **Glass** (`box-shadow: 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)`): The default elevation for every glass panel. The inset highlight is non-negotiable — it's what makes the panel read as lit-from-above rather than as a flat dark rectangle.
- **Card** (`box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`): A slightly tighter variant for in-page cards.
- **Glow-Mint** (`0 8px 30px rgba(0,255,136,0.4)` — directional, or `0 0 20px rgba(0,255,136,0.35), 0 4px 12px rgba(0,255,136,0.15)` — radial): On primary CTAs and the "you" highlight. The radial variant pulses for live state.
- **Glow-Cyan** (`0 8px 30px rgba(0,212,255,0.4)`): On secondary/info CTAs and the live-dot.
- **Glow-Purple** (`0 8px 30px rgba(139,92,246,0.4)`): On premium/tournament-picks CTAs.

### Named Rules

**The Inset-Highlight Rule.** Every glass panel carries the inset top highlight (`inset 0 1px 0 rgba(255,255,255,0.18)`). It's the only thing keeping the panel from looking like a flat dark rectangle. Drop the inset, lose the lit-from-above effect, lose the whole illusion.

**The Glow-Only-On-State Rule.** Glow shadows appear only on (a) primary CTAs at rest and on hover, (b) the live-dot indicator, (c) the "you" row on the leaderboard, (d) the active bottom-nav item. Never on decorative containers, never on inactive elements. Glow on a card-at-rest is the single fastest way to make the UI read as crypto-throwback.

**The No-Nested-Glass Rule.** Glass panels do not nest. A `.glass` inside another `.glass` reads as muddy; the blur compounds, the inset highlights stack, the transparency stops carrying depth. If you need a sub-region, use a tinted solid (`bg-white/4`, `bg-ac/6`) inside the glass instead.

## 5. Components

Every component is built once in `components/ui/` and reused across both surfaces. They adapt to dark (app) and light (landing) via the `.landing-page` scope on the marketing pages.

### Buttons (`components/ui/button.tsx`)

- **Shape:** Pill (`rounded-full`) for primary CTAs, rounded (`rounded-xl`, 18px) for secondary/ghost/outline. The pill shape on primary is a signal of "main action".
- **Primary:** Mint→cyan diagonal gradient (`linear-gradient(135deg, #00FF88, #00D4FF)`) with dark navy ink (`#0B141B`), neon glow at rest (`0 0 15px rgba(0,255,136,0.35), 0 4px 16px rgba(0,255,136,0.2)`). Sizes from `xs` (28px tall) to `lg` (56px tall). Always uppercase, `font-bold tracking-wider`.
- **Secondary:** White surface with navy text — used on the light landing surface where mint-on-light loses contrast.
- **Ghost:** Transparent at rest, subtle wash on hover. For tertiary actions inside cards.
- **Outline:** Translucent white with cyan-tinted border (`rgba(0,212,255,0.3)`). For "I have a passkey" / secondary funnel actions.
- **Hover / Focus:** All variants lift 2px (`hover:-translate-y-0.5`) and brighten 5%; active scales to 97%. Focus ring is 2px with 2px offset, visible-only (`focus-visible`).
- **Motion:** 150ms ease-out on all transitions.

### Chips (`components/ui/chip.tsx`)

- **Style:** Pill-shaped (`borderRadius: 100`), tinted glass at 9% alpha of the accent color, 1px border at 22% alpha, optional 12px glow on the same color hue. Backdrop-blur 8px so chips on top of glass don't read flat.
- **Type:** 11px Outfit weight 700, uppercase, tracking 0.1em.
- **Variants:** Mint (green, default), cyan, amber, purple, pink, red, neutral white. Color is parameterized — pass any hex and the background/border tint derive from it.
- **States:** Selected/unselected, with-icon/without-icon. No standalone hover state; chips are status indicators, not buttons.

### Cards / Glass Containers (`components/ui/glass-primitives.tsx`)

- **Corner Style:** 22px (`rounded-2xl`) for standard glass, 24px (`rounded-3xl`) for strong-elevation glass (modals, hero panels). Both larger than typical SaaS card radius — the bigger curve sells the "floating panel" feel.
- **Background:** Purple-tinted dark (`rgba(18,14,38,0.32)` default, `0.5` strong) with `backdrop-filter: blur(40px) saturate(180%)`.
- **Shadow:** See Elevation — `shadow-glass` with non-negotiable inset top highlight.
- **Border:** 1px hairline at 14% white (18% on strong).
- **Internal Padding:** 24px standard, 36px on the "strong" variant (modals, hero).
- **Variants:** `glass-accent` (mint-tinted), `glass-cyan` (live state), `glass-purple` (tournament/premium), `glass-sidebar` (opaque dark with right-edge hairline).

### Inputs / Score Cells

- **Default input** (signup, group name, passkey, magic-link email): Glass background (`bg-surface`), 14px (`rounded-lg`) corners, 1px hairline border, 44px tall, Outfit body text, white ink.
- **Focus:** Border shifts to mint at 50% (`border-ac/50`), thin glow halo on the bottom (`shadow-glow-ac` at reduced intensity). Never a thick ring — keep it broadcast-clean.
- **Passkey input:** 6-character segmented, mono font, each cell 44×44, fixed-width — feels like entering a vault code.
- **Score input** (`components/ui/score-input-cc.tsx`): 32×32 mint-tinted square (`bg-ac/8`, `border-ac/30`), JetBrains Mono 18px, +/- tap to change. Two cells separated by em-dash. Saved state inherits the mint-tint card variant.

### Navigation

- **Mobile bottom nav** (`BottomNav`, product surface only): 74px tall, opaque dark glass (`rgba(8,12,22,0.85)`) with top hairline. 5 items (Home / Group / My Bets / Table / Profile). Active item: accent color (mint) with a 2.5px gradient bar at the top edge (`<NeonBar />`). Icon-above-label, both at 11px chip type.
- **Desktop top nav** (landing surface): Inline nav with chip-sized links, primary CTA pill on the right.
- **Top bar** (`TopBar`, inner product pages): Glass strip with back chevron left, page title centered, optional action button right.

### Live Dot (`components/ui/live-dot.tsx`)

A 7px cyan circle that pulses every 1.4s (`live-pulse` keyframes — opacity to 0.6, scale to 1.3, ease-in-out). Used everywhere a "live" state exists: the LIVE chip on a match card, the watching-now count on chat, the active match in bracket. **Respect `prefers-reduced-motion`** — fall back to a static dot.

### Flag (`components/ui/flag.tsx`)

40px round or 6px rounded (prop) flag image from `flagcdn.com` (must move to a local CDN before launch — see PRODUCT.md privacy principle). 1.5px white/18% border. Always carries `alt="<Country Name>"` for screen readers.

### Avatar (`components/ui/avatar-cc.tsx`)

Circle with gradient background from the user's accent color (15% → 25% alpha), initial centered in Bricolage weight 800. Optional gradient ring for "you" or leader. Sized in 24 / 32 / 48 / 80 — never arbitrary px values.

### Bottom Sheet / Modal

Strong glass (`glass-strong`, 24px radius, 36px padding). Slides up from bottom on mobile, centered on desktop. Backdrop is 60% navy at 60% alpha with blur(8px). Enter motion: 220ms `slideDown` keyframe with ease-out. **Never use modals for the first session** — see PRODUCT.md Principle 3.

### Score Bar (signature component)

The cyan-glass strip at the top of chat during a live match. `glass-cyan` background, live-dot left, flag-score-flag-time horizontal row centered, JetBrains Mono 30px scores. Sticky at top during chat scroll. This is the component that does the most aesthetic work in the product — it's where "stadium scoreboard" stops being a metaphor and becomes literal.

## 6. Do's and Don'ts

### Do:

- **Do** use the **purple-tinted** glass panel base (`rgba(18,14,38,0.32)`) for every surface that calls for elevation. The purple tint is the single token that separates Cup Clash from generic dark UI.
- **Do** keep the inset top highlight (`inset 0 1px 0 rgba(255,255,255,0.18)`) on every glass panel. Without it, the panel reads flat.
- **Do** set every score, point total, rank, timer, and countdown in **JetBrains Mono weight 900**. This is the scoreboard contract.
- **Do** reserve the mint→cyan gradient (`linear-gradient(135deg, #00FF88, #00D4FF)`) for the **primary CTA only**. It is the one strongest visual signal in the system; spread it across multiple elements and it stops being a signal.
- **Do** use the LIVE pulse + cyan glass score bar to make matches feel like they're happening *right now*. This is what the dark theme is for.
- **Do** pair color-coded state with an icon or label (crown for #1, dimmed avatar for eliminated, danger icon next to red). Green/red alone is not enough — see PRODUCT.md Accessibility section.
- **Do** respect `prefers-reduced-motion: reduce`. The `livePulse`, `floatY`, score-flip, and slide-down animations all need a static fallback.
- **Do** keep body prose to a **65–75ch line length** on landing surfaces. Outfit at 14–19px on glass needs the line break to stay readable.

### Don't:

- **Don't** ship sportsbook patterns. No "Lock in your pick" pressure copy, no countdown-to-deadline urgency animations, no odds-board layouts, no "free $50 bet" carrots, no dark-pattern unsubscribe flows. PRODUCT.md names sportsbooks (DraftKings, FanDuel, Bet365) as Anti-Reference #1 — the visual line lives here.
- **Don't** ship the generic SaaS landing template: hero + three feature cards + pricing table + FAQ. The handoff explicitly designs around this — phone frames, glass countdown, FAQ accordion with non-stock copy. Keep it that way.
- **Don't** introduce mascots, cartoon UI, or "Whoops! Better luck next time!" copy. Cup Clash is playful but adult. PRODUCT.md Anti-Reference #3.
- **Don't** invent a fourth accent role. Three channels: mint (you/win), cyan (live/info), amber (leader). Purple/pink/red are reserved for the specific surfaces in §2.
- **Don't** nest glass inside glass. The blur compounds, the inset highlights stack, the transparency stops carrying depth. Use a tinted solid for sub-regions.
- **Don't** glow at rest on anything that isn't (a) a primary CTA, (b) the live-dot, (c) the "you" row, (d) the active bottom-nav item. Decorative glow is what makes interfaces read as crypto-throwback.
- **Don't** use a colored left/right stripe greater than 1px as an accent on cards or list items. The "you" leaderboard row uses a 2px mint left-border — that is the one sanctioned exception, on the one element. Don't generalize it.
- **Don't** add a side-stripe to anything else: not list items, not callouts, not match cards.
- **Don't** use `#000` or `#fff` raw. The system uses tinted near-blacks (`#050810`, `#080C16`) and translucent whites. Pure black and pure white belong on a print spec, not on the scoreboard.
- **Don't** use em-dashes or `--` in copy. Use commas, colons, or periods. (The score-input separator is rendered visually, not as an em-dash character.)
- **Don't** gate the first session. Guests can explore the seeded demo dashboard freely. The signup modal opens only at the moment of real commitment. See PRODUCT.md Principle 3.
- **Don't** ship `gradient-text` on new surfaces. The class exists in `globals.css` for legacy reasons; it's an anti-pattern in the impeccable rules and should be migrated to single-color emphasis (via weight or size) when those surfaces are touched.
- **Don't** ship third-party flag CDN calls (`flagcdn.com`) or third-party fonts in production. PRODUCT.md commits to "no tracking"; the visual system must too. Self-host flags before launch.
