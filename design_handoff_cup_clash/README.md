# Cup Clash — Design Handoff

A complete World Cup 2026 private prediction league: marketing landing page + product app (17 screens) + corporate-sponsor funnel + ad-free monetisation.

---

## 0. About these files

The HTML / JSX files bundled in this handoff are **design references**, not production code. They were prototyped in vanilla React + inline Babel to make iteration fast and the user-facing fidelity high.

**Your job as the developer:** recreate these designs in the existing **Next.js 14 App-Router codebase** you already have scaffolded at the repo root. The route folders (`app/(app)/dashboard`, `app/(app)/groups`, etc.) already exist — fill them in. Use the codebase's existing patterns (TypeScript, server components where possible, your chosen UI library — Tailwind + shadcn/ui is the recommended stack but the design works equally well in CSS Modules or Stitches).

**Fidelity: High.** Colors, typography, spacing, motion, copy, micro-interactions are all final. Treat the visuals as pixel-targets.

---

## 1. Stack assumptions

| Layer | Recommendation | Why |
|---|---|---|
| Framework | **Next.js 14 App Router** (already scaffolded) | Server components + route groups already in your repo |
| Styling | **Tailwind CSS** + CSS variables for the design tokens | The prototype uses inline styles; Tailwind keeps it terse, tokens stay portable |
| UI Primitives | **shadcn/ui** (Radix-based) | FAQ accordion, modal/dialog, dropdown, popover all already styled |
| State | **Zustand** for app state (current group, picks draft) + **TanStack Query** for server state | Picks need optimistic updates before lock; leaderboards stream |
| Realtime | **Supabase Realtime** or **Pusher** | Live scores, leaderboard shifts, chat |
| Auth | **NextAuth.js** with email magic-link + Google | Magic-link is the lowest-friction option for the office-pool use case |
| DB | **Postgres** (Supabase or Neon) | Row-level security maps cleanly to private groups |
| Payments | **PayPal** (already scaffolded in `app/api/paypal/`) + **Paddle** (already scaffolded) | PayPal for friend $2 splits, Paddle for B2B invoicing |
| Hosting | **Vercel** | Edge functions for live score webhook fanout |
| Fonts | **Bricolage Grotesque** (display) + **Outfit** (UI) + **JetBrains Mono** (scores) | Already imported from Google Fonts in both prototypes |

---

## 2. Design Tokens

Copy these into `tailwind.config.ts` and a global CSS file. They are referenced everywhere.

### 2.1 Colors

```ts
// tailwind.config.ts — theme.extend.colors
{
  // Brand
  bg:        '#050810',         // Page background (deep navy-black)
  bgAlt:     '#080510',         // Body fallback
  surface:   'rgba(18,14,38,0.32)',  // Glass panel base
  surfaceStrong: 'rgba(18,14,38,0.5)',
  border:    'rgba(255,255,255,0.14)',
  borderStrong: 'rgba(255,255,255,0.18)',

  // Accent (Cup Clash green) — primary CTA, "you" state, wins
  ac:        '#00FF88',
  // Cyan — secondary CTA, info, corporate
  cyan:      '#00D4FF',
  // Purple — premium, tournament picks
  purple:    '#8B5CF6',
  // Amber — leaders, crowns, streaks
  amber:     '#fbbf24',
  // Pink — accents, full-bracket
  pink:      '#ec4899',
  // Red — danger/lost
  danger:    '#f87171',

  // Text
  fg:        '#ffffff',
  fgMuted:   'rgba(255,255,255,0.7)',
  fgDim:     'rgba(255,255,255,0.5)',
  fgFaint:   'rgba(255,255,255,0.35)',
}
```

### 2.2 Typography

```css
:root {
  --font-display: 'Bricolage Grotesque', sans-serif;  /* h1, h2, h3, big numbers, nav brand */
  --font-ui:      'Outfit', sans-serif;               /* body, buttons, chips, nav links */
  --font-mono:    'JetBrains Mono', monospace;        /* scores, points, timers, ranks */
}
```

Type scale (from largest to smallest):

| Token | Size | Weight | Where |
|---|---|---|---|
| `text-hero` | clamp(48px, 7vw, 92px) / 800 / -0.02em | Hero H1 |
| `text-h2` | clamp(40px, 5vw, 64px) / 800 | Section H2 |
| `text-h3` | 26px / 800 | Card titles, "How it works" steps |
| `text-card` | 19px / 800 | Phone screen H |
| `text-body-lg` | 19px / 500 | Hero subtitle |
| `text-body` | 14-15px / 500 | Default paragraph |
| `text-meta` | 13px / 500 | Nav links, meta |
| `text-label` | 11px / 700 / uppercase / 0.18em tracking | Section labels ("SIMPLE BY DESIGN") |
| `text-chip` | 11px / 700 / uppercase / 0.1em tracking | Chips |

### 2.3 Radii

```ts
borderRadius: {
  sm: '8px',      // small chips
  md: '10px',     // input fields, small buttons
  lg: '14px',     // primary buttons, input groups
  xl: '18px',     // small cards
  '2xl': '22px',  // glass panels (.glass)
  '3xl': '24px',  // strong glass (.glass-strong)
  phone: '34px',  // mini phone bezel
  phoneXL: '44px',// full phone bezel
  pill: '100px',  // chips
}
```

### 2.4 Shadows / glow

```css
.glass {
  background: rgba(18,14,38,0.32);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18);
  border-radius: 22px;
}
.glass-strong { /* same but bg 0.5 + border 0.18 */ }

/* Accent glow on primary buttons */
.glow-ac    { box-shadow: 0 8px 30px rgba(0,255,136,0.4); }
.glow-cyan  { box-shadow: 0 8px 30px rgba(0,212,255,0.4); }
```

### 2.5 Motion

| Pattern | Duration | Easing |
|---|---|---|
| Page transition | 140ms | ease-out |
| Hover lift | 200ms | default |
| FAQ accordion | 250ms | ease-out |
| Modal/menu open | 220ms | ease-out |
| Live pulse | 1.4s infinite | — |
| Phone float | 6s infinite | ease-in-out |
| Score flip | 300ms | ease-out |

---

## 3. Sitemap & Routes

```
/                              → Landing page (Cup Clash Landing.html)
/login                         → Sign-in (magic link + Google) — modal-first, page as fallback
/signup                        → Sign-up
/onboarding                    → Welcome screen (first run only)

/dashboard                     → Home feed, live match, my rank, quick links
/groups                        → All my groups (Tech Titans, Family Cup, Office Champions, …)
/groups/new                    → Create group flow (3 steps: name → scoring → invite)
/groups/[id]                   → Group detail (leaderboard tab default)
/groups/[id]/predict           → Predictions per match (all 104)
/groups/[id]/bracket           → Knockout bracket
/groups/[id]/tournament-picks  → Champion, Golden Boot, Golden Ball
/groups/[id]/chat              → Group chat, live during matches
/groups/[id]/admin             → Admin panel (visible to owner)

/join/[passkey]                → Public join page (already scaffolded at app/join/enter)
/predictions                   → My picks across ALL groups
/leaderboard                   → Global / friends leaderboard
/trivia                        → Trivia tie-breaker round (7-sec timer)
/profile                       → My stats, badges, settings
/notifications                 → All notifications

/articles                      → Blog index
/articles/[slug]               → Article detail
/pricing                       → Standalone pricing page
/for-companies                 → B2B landing
```

---

## 4. The 17 App Screens

Each maps to a `<screen>Screen` component in the prototype JSX files. The prototype defines them all inside a single 390×844 phone frame — you'll render them as full responsive pages with the same layout primitives.

### 4.1 `DashboardScreen` → `app/(app)/dashboard/page.tsx`
**Purpose:** Home. Shows the user their primary group rank, a live match if one is on, and a 3-row leaderboard preview.

**Layout (top → bottom):**
1. **Header row** (12px padding-top below status bar)
   - Group name eyebrow (uppercase, 9px, letter-spacing 0.12em, white/35%)
   - Group title (display 16px, weight 800)
   - Avatar circle (24×24) on the right
2. **Live match card** (full width, 16px radius, cyan glass)
   - Group label + LIVE timer with pulsing dot (right)
   - Flag-Score-Flag layout: 32px flag · 30px mono score · 30px mono score · 32px flag
   - Score uses `font-mono`, weight 900
3. **Stats strip** (3-up grid, gap 5px)
   - Rank (green) · Points (cyan) · Streak (amber)
   - Each: 7px label uppercase + 16px mono number
4. **Leaderboard preview** (rounded glass, flex-1)
   - Top 3 only on Dashboard
   - "You" row gets `bg-ac/8` + 2px left border `ac`, name in `ac`
   - Crown icon (14px) on rank 1

### 4.2 `PredictionsScreen` → `/groups/[id]/predict`
**Purpose:** All upcoming matches the user can predict.

**Layout:**
- Header: "My Predictions" + chip "Tournament"
- Group divider: "UPCOMING (3)" eyebrow
- Match card (repeated):
  - Saved state: `bg-ac/6` + `border-ac/32`
  - Unsaved: `bg-surface` + `border-white/10`
  - Top row: flag · `HOME vs AWAY` · flag, then "Saved"/"Locked in 2H 44M" chip right-aligned
  - Score input row: two 32×32 squares (radius 8, bg `ac/8`, border `ac/30`), mono 18px score, em-dash between
- Bottom CTA: "Lock all picks" sticky button (only when ≥1 unsaved)

### 4.3 `ScheduleScreen` → `/schedule`
All 104 matches grouped by matchday. Each row: kickoff time · group · flag-vs-flag · "Predict" chip if open, "Locked" if past deadline.

### 4.4 `StandingsScreen` → `/standings`
Group-stage tables. 8 groups (A–H), each a card with 4 rows: Pos · Flag · Team · MP · W-D-L · GF-GA · Pts.

### 4.5 `LeaderboardScreen` → `/groups/[id]` (default tab)
**Purpose:** Show the full group ranking.

**Layout:**
- Group title centered
- **Podium** (top 3): 3-column flex-end. Position 1 = 80px tall amber bar w/ crown above avatar; 2/3 = 64/50px tall slate/orange bars.
- **Rest of table**: glass-tile, each row = `[rank-mono] [avatar] [name flex-1] [points-mono]`. "You" row highlighted in green.

### 4.6 `ProfileScreen` → `/profile`
- Avatar (80×80, gradient ring)
- Display name + handle
- Stat triplet: Total points · Groups · Win-rate
- Achievements grid (6-up, 60×60 chips, locked = grayscale)
- Settings list: Notifications · Theme · Language · Sign out

### 4.7 `ChatScreen` → `/groups/[id]/chat`
**Purpose:** Live group chat during matches.

**Layout:**
- Header: group name + live indicator + watching count
- Sticky **score bar** (cyan glass) with live timer
- Message stream:
  - Your messages: right-aligned, green gradient bubble, radius `12 12 4 12`
  - Others: left-aligned, white/6% bubble, radius `12 12 12 4`, prepended avatar
- Sticky input bar at bottom

### 4.8 `NotificationsScreen` → `/notifications`
List of cards. Each card:
- 30×30 icon tile colored to type (green=points, red=overtake, purple=trophy, cyan=chat)
- Title (10.5px, bold) + body (9px, dim) + relative time (right-aligned, 8px)

### 4.9 `BracketScreen` → `/groups/[id]/bracket`
- Centered trophy icon + "Road to the Final" + stage label
- Match cards (R16 → QF → SF → F). Each match card has 2 rows (home/away), winner highlighted in `ac`, loser dimmed to 45% opacity, live match has cyan border.

### 4.10 `TournamentPicksScreen` → `/groups/[id]/tournament-picks`
3 sections, each with its own point reward:
- **Champion +100** — grid of country flags (2-col), tap to select (selected = `ac/15` + `border-ac/50`)
- **Top Scorer +75** — list of 3 players w/ odds (mono)
- **Golden Ball +50** — same player list pattern

### 4.11 `WelcomeScreen` → `/onboarding`
Full-screen splash. Logo CC (gradient), tagline, 2 buttons: "Get Started" (primary) / "I have a passkey" (secondary).

### 4.12 `SignUpScreen` → `/signup` (also as modal)
- Hero: "Join Cup Clash"
- Social row: Google, Apple, GitHub (3 buttons, equal width)
- Divider: "or"
- Email field, password field, "Send magic link" CTA
- Footer link: "Already have an account? Sign in"

### 4.13 `CreateGroupScreen` → `/groups/new`
3-step wizard:
1. **Name** — text input + group type radio (Friends / Office / Family / Bar)
2. **Scoring** — 9 togglable rules, each with a numeric input for point value
3. **Invite** — generated passkey + WhatsApp/Slack/Copy-link buttons

### 4.14 `PricingScreen` → `/pricing`
Mobile version of the landing-page pricing tier cards, stacked vertically.

### 4.15 `AdminPanelScreen` → `/groups/[id]/admin`
**Visible only to group owner.**
- Member roster (X joined / Y invited)
- Pending payments (PayPal status)
- Edit scoring rules
- Lock/unlock group
- Pay out winners (1st/2nd/3rd split selector)

### 4.16 `MyGroupsScreen` → `/groups`
List of group cards. Each card:
- Group name + type icon (👥 friends, 🛡 corporate)
- Members count · "You: Rank #3 of 7 · 110 pts"
- Next match preview + countdown
- Unread chat badge
- Sponsor name if corporate (small chip)

### 4.17 `JoinGroupScreen` → `/join/[passkey]` (already at `app/join/enter`)
- Group preview card (name, host avatar, member count, sponsor if any)
- Passkey input (6 char monospace, segmented)
- "Join Group" CTA
- If corporate: "You join for FREE" cyan chip
- If friend: "$2 one-time" + PayPal button

### 4.18 `TriviaScreen` → `/trivia`
- 7-second timer ring (SVG, animated)
- Question text (display 22px)
- 4 answer chips (full-width, tap to select, locks immediately)
- Bonus point readout after answer reveal

---

## 5. Component Library (recreate as primitives)

These appear repeatedly across the app. Build them once, in `components/ui/`.

### 5.1 `<Flag code size />`
- Wraps `https://flagcdn.com/w40/{code}.png` (use w80 for retina, w160 for hero)
- Rounded full or 6px (prop)
- 1.5px white/18% border

### 5.2 `<Avatar initials size color />`
- Circle, gradient bg from `color/15` → `color/25`
- Initial(s) centered, weight 800
- Optional ring (for "you" / leader)

### 5.3 `<GlassCard variant="default|strong">`
- Wraps the `.glass` / `.glass-strong` patterns
- Standard padding 24px, lg padding 36px

### 5.4 `<Chip variant icon>`
- `.chip` base + variants: green/cyan/purple/amber/red/neutral

### 5.5 `<NeonBar />`
- The 2.5px gradient line indicator under active tabs/nav
- Used in BottomNav and section dividers

### 5.6 `<ScoreInput value onChange />`
- 32×32 box, mono digit, +/- on tap
- Auto-saves to draft state, syncs to server on blur (debounced 500ms)

### 5.7 `<LiveDot />`
- 5px green circle with `livePulse` animation
- Use everywhere a "live" state exists

### 5.8 `<BottomNav />` (mobile only)
- 5 items: Home · Group · My Bets · Table · Profile
- Active item: accent color + 2.5px top gradient bar
- 74px tall, blurred dark background

### 5.9 `<TopBar title back? actions? />`
- For inner pages
- Back chevron left, title centered, optional action button right

### 5.10 `<EmptyState icon title body cta />`
- Use for: no groups yet, no predictions made, no chats, etc.

### 5.11 `<Modal />` — see Section 7 for funnel-specific modals.

---

## 6. The Funnel

**Critical UX rule:** Do **not** gate the app behind sign-up. Let users explore. Trigger sign-up modal only when they try to **commit**.

### 6.1 Cold-open flow

```
Landing CTA "Let's Play"
  ↓
/dashboard (seeded demo state — Tech Titans, fake leaderboard, fake live match)
  ↓
User explores any tab freely (read-only)
  ↓
User taps "Create Group" OR "Join Group" OR tries to save a prediction
  ↓
<SignUpModal />  ← THIS is the gate
  ↓ (after success)
Resume the action they tried to do
```

### 6.2 Sign-up modal (`<SignUpModal />`)
Reuse the layout from `SignUpScreen` (4.12) but as a Radix Dialog. Open programmatically from a Zustand store:

```ts
useAuthStore.getState().open({ returnAction: 'create-group' })
```

After success, dispatch the saved return action.

### 6.3 Triggered modals

Build these as scheduled / event-driven dialogs. **Never on cold open.**

#### `<RateUsModal />`
**Triggers (fire whichever hits first):**
- User's first prediction settles WITH points earned (positive signal)
- User has 3 correct predictions
- App opened ≥ 5 sessions AND no rating given yet
**Layout:** 5-star input, optional text comment, "Maybe later" link.
**Implementation:** persist `ratingPromptShownAt`, `ratingGiven` in user profile.

#### `<ShareWithFriendsModal />`
**Triggers:**
- User just created a group (success state)
- User climbs ≥3 ranks in a single matchday
- User wins a matchweek
**Layout:** Group passkey + 4 social share buttons (WhatsApp, Slack, iMessage, Copy Link). Preview card showing how the invite will look.

#### `<PaymentModal />`
**Trigger:** Friend group join when user hasn't paid.
**Layout:** PayPal button + "Why $2?" disclosure ("$0.40 covers payment processing, $1.60 keeps Cup Clash ad-free forever").

#### `<CorporateUpsellModal />`
**Trigger:** Friend-group owner invites their 8th member from the same email domain.
**Layout:** "Look like you're inviting your work team. Sponsor it for $75 instead and let them all join free." → CTA to upgrade.

---

## 7. State Management

```ts
// stores/auth.ts
useAuthStore = {
  user: User | null,
  signupModalOpen: boolean,
  returnAction: 'create-group' | 'join-group' | 'save-prediction' | null,
  open(opts), close(), setUser(user)
}

// stores/picks.ts — optimistic prediction drafts
usePicksStore = {
  drafts: Record<MatchId, { home: number; away: number; dirty: boolean }>,
  setPick(matchId, home, away),
  savePick(matchId),  // POST then mark clean
  saveAll()
}

// stores/group.ts
useGroupStore = {
  activeGroupId: string | null,
  groups: Group[],
  setActive(id)
}
```

Use **TanStack Query** for server data: groups, matches, leaderboards. Set up Supabase Realtime channels per active group to push leaderboard + chat updates.

---

## 8. API Contract (sketched)

These routes match the existing `app/api/` scaffold; flesh them out.

```
POST   /api/auth/magic-link          { email }
POST   /api/auth/verify              { token }
GET    /api/me

GET    /api/groups                   → my groups
POST   /api/groups                   { name, type, scoring }
GET    /api/groups/:id
PATCH  /api/groups/:id               (admin only)
DELETE /api/groups/:id

POST   /api/groups/:id/members       { passkey } → join
DELETE /api/groups/:id/members/:userId (admin)

GET    /api/groups/:id/leaderboard
GET    /api/groups/:id/chat          → SSE / WS upgrade

GET    /api/matches?stage=group
GET    /api/matches/:id

GET    /api/predictions?groupId=
POST   /api/predictions              { groupId, matchId, home, away }

POST   /api/paypal/create-order      (already scaffolded)
POST   /api/paypal/capture-corporate (already scaffolded)
POST   /api/paddle/webhook           (already scaffolded)

POST   /api/notifications/mark-read
```

---

## 9. SEO / AI Discoverability (already in landing)

The landing page already has:
- Full Open Graph + Twitter card meta
- JSON-LD with `Organization`, `WebSite`, `SoftwareApplication` (with Offers + AggregateRating), `SportsEvent` (FIFA WC 2026), `FAQPage`, `BreadcrumbList`
- Canonical URL, robots, theme-color, SVG favicon

When you build the real site:
- Replace `https://cupclash.com/` with your actual domain in **every** JSON-LD `@id` and `url`
- Generate a real OG image at `/og-image.png` (1200×630)
- Add `sitemap.xml` + `robots.txt` (Next.js: use `app/sitemap.ts` + `app/robots.ts`)
- Each article should emit its own `Article` JSON-LD with `author`, `datePublished`, `image`

---

## 10. Responsive Behaviour

The landing page handles three breakpoints:

| Width | Behaviour |
|---|---|
| > 1024px | Desktop nav, multi-col grids, side-by-side hero |
| 720 – 1024px | Hamburger menu, 2-col grids, hero stacks |
| 480 – 720px | 1-col grids (except features which stay 2-col on mid-mobile), CTAs stack |
| < 480px | All grids single-col, footer single-col, "Let's Play" hides label leaving arrow |

**App screens** are mobile-first (390px). On desktop they get a max-width 460px centered "phone" view OR a fully-fluid layout — your call. Recommend the latter for product feel.

---

## 11. Files in this handoff

- `README.md` — this file
- `Cup Clash Landing.html` — the marketing site prototype (full visual fidelity)
- `Cup Clash Prototype.html` — the app prototype shell
- `cup-clash-ui.jsx` — shared UI primitives (StatusBar, Flag, Avatar, GlassCard, NeonBar)
- `cup-clash-screens.jsx` — Dashboard, Predictions, Schedule, Standings, Leaderboard, Profile
- `cup-clash-extras.jsx` — Chat, Notifications, Bracket, TournamentPicks
- `cup-clash-funnels.jsx` — Welcome, SignUp, CreateGroup, Pricing, AdminPanel
- `cup-clash-more.jsx` — MyGroups, JoinGroup, Trivia
- `tweaks-panel.jsx` — Dev-only tweaks panel (do NOT ship)
- `stadium-bg.png` — Hero background image
- `tokens.css` — Extracted CSS variable token set (Section 2 above, as code)
- `tailwind.config.example.ts` — Drop-in Tailwind config

---

## 12. Implementation roadmap

A realistic order of operations:

**Week 1 — Foundations**
1. Set up Tailwind + tokens + fonts in the existing Next.js scaffold
2. Build `components/ui/*` primitives (Section 5)
3. Set up Supabase (auth, DB schema, RLS policies)
4. Build `<SignUpModal />` + Zustand auth store
5. Seed demo data so unauth'd users see Tech Titans on landing

**Week 2 — Core app**
6. Dashboard + Leaderboard + My Groups + Create Group
7. Predictions + Schedule (read-only first, then writes with optimistic updates)
8. PayPal join flow ($2 friend, $75 corporate)

**Week 3 — Engagement**
9. Chat + Realtime + Notifications
10. Bracket + Tournament Picks
11. Trivia round
12. Profile + Achievements

**Week 4 — Marketing & polish**
13. Landing page port to MDX/JSX (already-final design — direct visual port)
14. Articles section + MDX content pipeline
15. Triggered modals (Rate-us, Share, Corporate upsell)
16. Admin panel
17. SEO finalisation (sitemap, OG image, JSON-LD with real URLs)

**Pre-launch**
- Replace all `flagcdn.com` calls with a CDN'd local copy (do NOT ship third-party flag deps to prod)
- Replace `stadium-bg.png` with a properly-licensed image
- Audit `100% Ad-Free / No tracking` claim — strip analytics if you ship it (or be transparent in privacy policy)
- Trademark check on "Cup Clash" name
- Disclaimer in footer: "Not affiliated with FIFA" (already present in landing)

---

## 13. Open questions for the product team

These were left ambiguous in the prototype — confirm before shipping:

1. **Cash pots**: are buy-ins legal in target markets? Some US states classify even office pools as gambling. May need geo-detection + disclaimer.
2. **Refund policy**: if a friend joins for $2 but never plays, is that refundable? Default recommendation: no, but state it clearly at checkout.
3. **Corporate sponsor → employee data**: does the company admin see individual employee predictions, or only the aggregate leaderboard? Default recommendation: aggregate only, for privacy.
4. **Notifications**: web push vs email vs both? Default recommendation: web push for matchday, daily email digest otherwise, opt-in to both.
5. **Group size cap**: prototype says "no cap" — but PayPal payout-splitting math breaks past ~50 distinct payees. Confirm pot-disable for groups > 50.
