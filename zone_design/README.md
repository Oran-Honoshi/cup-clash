# Handoff: CupClash — Zones IA, Group Predictions, and Interaction System

## Overview
CupClash is a football (soccer) predictions app organized into **Zones**: Home, Newsroom, Social (Groups), Game Room, Statistician. This package documents the current prototype's structure and specifies how to extend **Social → a Group** with **Predictions as a sub-sector**, plus a reusable pattern for adding sub-sectors to any zone later. It also specifies the modal, transition, and funnel system so new screens feel native to what's already built.

## About the design files
The attached `.dc.html` file is an **HTML design reference** — a clickable prototype showing intended structure, states, and copy, not production code to copy directly. Recreate it in the target codebase's actual stack (React Native, SwiftUI/Kotlin, or web framework — whichever this repo already uses) using that stack's existing components and patterns. If no stack exists yet, React Native is the sane default for an iOS+Android app like this.

## Fidelity
**Mid-to-high fidelity.** Colors, type, spacing, and copy tone are intentional and should be preserved. Layout and interaction structure are final; a few areas (theme swatches in Settings, some icons rendered as letter-badges) are explicit placeholders — swap for real iconography/imagery, don't treat the letter-badges as final.

---

## Design tokens (do not change)

**Colors**
- Background `#0B0D12`, panel `#14171F`, panel alt `#1B1F29`, hairline `#262B36`
- Ink `#F4F3EE`, ink dim `#9AA0AC`, ink faint `#5B6270`
- Gold (primary/brand accent) `#E8B84B` — CTAs, active states, home zone
- Blue `#4C8DFF` — Newsroom
- Coral `#FF6B6B` — Social/Groups
- Violet `#B685FF` — Game Room
- Teal `#35D0A5` — Statistician

Each zone owns one accent color, used for its icon, headline, and primary actions inside it. Keep this mapping — it's how users orient which "room" they're in.

**Type**
- Display/headings: `Space Grotesk` 600/700
- Body/UI: `Manrope` 400–800
- Minimum UI text size 12px; body copy 13–15px; headings 19–26px

**Shape**
- Cards: 14–18px radius, no border or 1px `var(--line)` border
- Pills/chips/buttons: 999px (full) radius
- Gaps: 8–12px between related items, 18–24px between sections

**Bottom-sheet-first modals, sticky headers, horizontally-scrolling chip rows** are established idioms — reuse them rather than inventing new containers.

---

## Navigation model (three options already built — pick one as default, keep the others behind a settings/flag toggle for testing)

1. **Switcher** — persistent 5-tab bottom bar (Home / News / Social / Game / Stats). Lowest friction, highest discoverability, standard mobile pattern. **Recommended default** for the shipped app — predictable, no extra taps, best for daily-return usage.
2. **Hub/map** — Home has no bottom bar, just a floating "Explore Zones →" pill that opens a Zones picker screen. More editorial/exploratory feel but adds a tap to reach anything. Good for a marketing/first-run moment, not daily use.
3. **Hybrid** — top 3 tabs (Home/Social/Game) pinned + "More" opens Newsroom/Stats. Compromise; use only if analytics show News/Stats are rarely-visited.

Recommendation: ship **Switcher** as default; keep Hub available as the first-run "tour" experience only.

## Personas (drive what Home shows, not separate apps)
- **Anonymous** — no follow graph yet. Home shows a "follow a team" CTA card instead of a match card. Social/Stats show empty-state prompts instead of data. Never block browsing — only gate personalization and saving.
- **Following, no group** — Home leads with a followed-team's match + personal streak. Social shows a nudge to join/create a group, not a hard wall.
- **Group member** — Home leads with the group's next match, group streak, and lock countdown. This is the target retained-user state — most engagement design should optimize toward getting users here.

---

## Current screens (as built in the prototype)

For each: purpose, layout, and key components. All screens share: sticky header (54px top padding for status bar), scrollable body (`flex:1; overflow:auto`), sticky bottom nav.

### Home
Purpose: daily landing pad, persona-aware. Order top-to-bottom: persona hero card → following chip row (horizontal scroll) → competitions chip row → newsroom teaser card → Daily Challenge card → group-nudge card (solo/anon only) → 3-up "Jump into a zone" grid. This ordering is deliberate: the single most relevant thing (today's match / streak) first, discovery content last.

### Newsroom
Purpose: headlines, video highlights, live vote. Sticky header has a horizontally-scrolling story-ring rail (competition avatars) above a 3-way filter pill row (For You / Following / All). Body: MVP-vote card with mini bar chart, one video card, then a feed of headline cards. Fully localized (EN/HE with RTL flip) — treat `dirAttr` as a real requirement, not decoration.

### Social (My Groups)
Purpose: list the user's groups, jump into one. Header: "My groups" / "Discover" pill toggle + "+ New group". Body: one card per group (name, group's title e.g. "The Oracle", rank line, unread count) + a small standings bar chart. **This is the screen that needs the sub-sector expansion below** — tapping a group card should open a Group Detail screen, not stay flat.

### Discover groups
Purpose: browse/join public groups. Search field + category chips (Public/World Cup/AFCON/Near me) + list cards (name, member count, competition, Join button).

### Create group
Purpose: 2-choice fork — "House Rules" (recommended, standard scoring, no money) vs "Customizable" (advanced, peer buy-in tracking). Zero-friction: no form before this choice.

### Game Room
Purpose: arcade layer. 2×2 grid of mini-games (Guess the Footballer, Guess the Club, Guess the Score, Daily Trivia — "coming soon" dimmed), a 1v1 duel challenge card, global leaderboard rank card.

### Statistician
Purpose: personal + competition stats. Accuracy-over-time bar chart (gated for anon), competition filter chips, standings table.

### Hub / More / Settings / Follow picker
Zone-picker, secondary-zone sheet, nav-mode + language + theme settings, and a tag-based multi-follow picker (national teams / clubs / players / competitions, each as toggle chips).

---

## NEW: Zone Sub-Sectors pattern (generalized) + Group Predictions (concrete example)

### The pattern
Any Zone can grow **sub-sectors**: a segmented row of 3–5 tabs directly under the zone's sticky header title, switching the content below without leaving the zone or losing the header/back button. This avoids adding new top-level nav items (keeps the tab bar at 5 max) while letting zones grow deep content over time.

Reuse for: Group Detail (below), and later Game Room (Duels / Daily / Leaderboards) or Statistician (Standings / History / Compare) — same mechanic, same visual treatment, so users learn it once.

**Visual spec for sub-sector tabs** (matches existing filter-pill rows already in Newsroom/Discover/Stats, so nothing new to learn):
- Row of pill buttons, 8px gap, horizontal scroll if it overflows
- Active pill: solid zone-accent-color background, dark text, 700 weight
- Inactive pill: `var(--panel2)` background, `var(--ink-dim)` text, 600 weight
- Sits at `margin-top:14px` inside the sticky header, same as Newsroom's For You/Following/All row

### Group Detail screen (Social → tap a group card)
**Now mocked in the prototype** — tap "Golan Ultras" or "Office League" from Social to open it; the two groups show slightly different data (different next match, rules type, streak) to demonstrate the pattern is data-driven, not hardcoded per group.
Header: back to Social, group name (disp, 24–26px, coral), member count + rank line, sub-sector pill row: **Predictions · Leaderboard · Chat · Rules**.

#### Sub-sector: Predictions (the example requested)
This is where the group's picks for upcoming/live/settled matches live — scoped to this one group's competition and rules, distinct from the personal Statistician zone.
- **Section: "Lock in X hours"** — one hero pick-card for the group's next match (same visual language as the Home hero card): teams, kickoff countdown, and the pick control inline (Home/Draw/Away segmented, or a score-stepper for exact-score formats) with a clear lock state once kickoff passes.
- **Section: "This gameweek"** — vertical list of compact pick-rows (one per fixture): team crests placeholder, kickoff time, member's current pick shown as a small avatar-on-side-chosen indicator, tap row → opens the pick modal (see below).
- **Section: "Recently settled"** — collapsed-by-default list, correct picks in teal, wrong in muted, points delta per pick (+3, +1, +0) so scoring is legible without a rules re-read.
- Empty/anon-in-group edge case shouldn't occur (you're only here as a member) but a "no fixtures this week" state should show a quiet single-line message, never a blank screen.

#### Sub-sector: Leaderboard
Promote the existing group standings bar chart (already in Social) here, expand to a ranked list: position, name, points, streak flame icon, "you" row visually pinned/highlighted.

#### Sub-sector: Chat
Existing "3 unread in chat" affordance becomes a real lightweight thread — text bubbles + a match-pick shared as a compact inline card (so trash talk can reference a specific pick without leaving chat).

#### Sub-sector: Rules
Read-only summary of the scoring model chosen at group creation (House Rules vs Customizable) — static, low-priority, fine as a simple text list.

### Pick interaction (funnel-critical, keep it to one tap + one confirm max)
Recommend a **bottom-sheet modal** for making/changing a pick (see Modals below): tap a fixture row → sheet slides up with the two/three outcome buttons large enough for a thumb (44px+ height) → tap once selects and auto-confirms (no separate "Submit" button) → sheet auto-dismisses with a brief inline confirmation (checkmark flash on the row), returning to the list. Do not require a second confirm tap — that's the single biggest friction point in prediction apps and kills daily habit formation.

---

## Elements, Modals, Transitions & Funnels — options

Presented as options with a recommendation each, so a build can pick fast. All must keep the dark panel/gold-accent/pill-chip vocabulary already established.

### Modal options
1. **Bottom sheet (recommended, primary)** — rounded-top `panel` surface sliding up over a dimmed backdrop, drag-handle bar, tap-outside-to-dismiss. Use for: making a pick, joining a group confirmation, duel challenge, single-item follow add. Feels native on both iOS/Android, keeps context (backdrop shows the screen you came from), lowest friction to dismiss.
2. **Centered card modal** — for rare, high-consequence confirmations only (e.g. "delete this group" / "leave group"). Don't use for routine actions — it interrupts more and reads as "serious," which is the point, sparingly.
3. **Full-screen takeover** — reserve for multi-step flows that need real space (Create Group's two-path choice already works fine as a screen, not a modal — keep it that way; don't sheet-ify things that need scroll room).

Rule of thumb: if it's one decision, bottom sheet. If it's destructive, centered card. If it's multi-step, a screen.

### Transition options
1. **Zone changes (bottom nav tap):** cross-fade + 4px vertical settle, 150–180ms, no slide — zones are siblings, not a stack, so a directional slide implies hierarchy that isn't there.
2. **Drill-in (Social → Group Detail, Discover → group profile):** standard push — new screen slides in from the right (LTR) / left (RTL respecting `dirAttr`), old screen recedes slightly, 220–260ms ease-out. Back gesture reverses it.
3. **Sub-sector tab switching (within Group Detail):** content cross-fades only, 120ms — no slide, since it's a lateral swap not a navigation depth change. Matches how Newsroom's filter pills already behave (instant swap; keep that, don't add slide there either, for consistency).
4. **Bottom sheet modal:** slide up with slight overshoot-and-settle spring (roughly 280ms), backdrop fades in parallel. Dismiss is the reverse, faster (180ms) — dismiss should always feel quicker than open.

### Funnel options

**Onboarding (first launch):**
1. **Recommended — soft-gate:** land straight on Home in Anonymous persona (browsable immediately), with the existing "Follow a team" CTA card doing the conversion work contextually. Zero forced screens before first value.
2. **Alternative — persona quiz:** 2–3 tap screens (which competition do you care about → team/club → optional group join) before Home. Higher completion of a filled-out profile, costs a few seconds of first-run friction. Use only if analytics show anonymous users churn before following anything on their own.

**Join a group (Discover → Join):**
Keep single-tap join for public groups (already built — no confirmation modal needed, it's non-destructive and reversible). Only gate with a bottom-sheet confirm if the group requires an entry code/invite.

**Create a group:**
Already minimal — one fork screen, no naming/settings form blocking the decision. After picking a path, a short bottom-sheet (name + emoji/color, 1 field + 1 picker) is enough; don't add a multi-page wizard.

**Prediction lock funnel:** see "Pick interaction" above — one tap, auto-confirm, inline success, no modal stacking (never open a sheet from within a sheet).

### Engagement & feel principles (apply to all new screens)
- One accent color per zone, everywhere in that zone — this is already the strongest "you know where you are" signal in the app; never mix zone colors on one screen.
- Streaks, ranks, and lock countdowns are the emotional hooks already in use (5-day group streak, "Top 12% globally," "locks in 4h") — reuse this phrasing pattern for any new stat rather than inventing new copy tones.
- Cap any single screen's first-scroll view at ~3 cards before requiring scroll; never require more than one scroll to reach the primary action of a screen.
- No more than one modal open at a time; no nested sheets.
- Favor horizontal chip-scrollers over dropdowns/menus for any filter — matches existing Newsroom/Discover/Stats pattern.
- Keep empty/anon states single-sentence + one CTA — never a blank panel, never a paragraph.

---

## State management (as prototyped, extend from here)
Existing state: `navMode`, `zone`, `lang`, `persona`. For Group Detail, add: `activeGroupId`, `groupSubSector` (predictions/leaderboard/chat/rules), and per-fixture `userPick` state (keyed by fixture id) with a `locked` boolean once kickoff passes. Chat needs its own lightweight message list state (or real backend) scoped by group id.

## Note to implementer: reuse before you rebuild
The Group Detail screen (with Predictions/Leaderboard/Chat/Rules sub-sectors) is now mocked in the prototype — reachable by tapping a group card from Social. Before building it from scratch in the real codebase:
- **Diff it against what already exists.** The pick-card, standings bar chart, chip rows, and chat bubble are all visual variants of components already shipped elsewhere in the app (Home's hero card, Social's standings chart, Newsroom's filter pills). Where the existing codebase already has a working version of one of these, extend/reuse that component and its props rather than authoring a parallel one — that keeps the two in visual sync automatically as the app evolves.
- **Where no equivalent exists yet** (e.g. the inline pick-confirmation row, the "shared pick" chat card), treat this mock as the spec for a new shared component, built so the *other* screens in this doc (Game Room duels, Statistician history) can adopt it later instead of each screen growing its own one-off.
- **Screenshot the current shipped app's equivalent screens** (Home, Social, Newsroom at minimum) alongside this prototype before implementing, so the visual diff is explicit: what's identical, what's a deliberate new pattern (sub-sector tabs, pick bottom-sheet), and what's an accidental drift to fix. Call out any place the two disagree rather than silently picking one.
- Net effect: the Predictions sub-sector should feel like it was always part of the app, not a bolted-on feature — same tokens, same card shapes, same tap-to-confirm friction level as everything already live.

## Assets
No real photography/crests are used yet — all team/club/player references are placeholder text or letter-badges. Source real crests, player photos, and competition logos before shipping; do not ship letter-badges as final.

## Files in this handoff
- `CupClash Zones Prototype.dc.html` — the full clickable prototype covering every screen and nav mode described above (nav-mode and persona switchers at the top are prototype-only controls, not part of the shipped app).
