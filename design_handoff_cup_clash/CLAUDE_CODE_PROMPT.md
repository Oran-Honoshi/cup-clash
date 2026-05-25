# Prompt for Claude Code

Copy the entire block below into Claude Code (or any AI coding assistant) once you've loaded this handoff folder into your repo. It primes the agent with the right context and the right order of operations.

---

```
You are implementing Cup Clash — a private World Cup 2026 prediction league —
in this Next.js 14 App Router codebase.

CONTEXT
=======
The folder `design_handoff_cup_clash/` contains the complete design specification:

  • README.md                       — Master spec (READ THIS FIRST, every section)
  • tokens.css                      — Design tokens (colors, type, radii, shadows, motion)
  • tailwind.config.example.ts      — Tailwind config that mirrors the tokens
  • Cup Clash Landing.html          — Final marketing landing page (visual reference)
  • Cup Clash Prototype.html        — Mobile app prototype shell
  • cup-clash-ui.jsx                — Shared primitives (Flag, Avatar, GlassCard, etc.)
  • cup-clash-screens.jsx           — Dashboard, Predictions, Schedule, Standings,
                                      Leaderboard, Profile
  • cup-clash-extras.jsx            — Chat, Notifications, Bracket, TournamentPicks
  • cup-clash-funnels.jsx           — Welcome, SignUp, CreateGroup, Pricing, Admin
  • cup-clash-more.jsx              — MyGroups, JoinGroup, Trivia
  • stadium-bg.png                  — Hero background image

These HTML/JSX files are DESIGN REFERENCES, not production code. They use inline
styles and CDN-loaded React+Babel so the designer could iterate visually. Your
task is to recreate them as proper TypeScript + Tailwind components in this repo.

THIS REPO
=========
Already scaffolded:
  app/page.tsx                          — Landing page (empty — start here)
  app/(app)/dashboard/page.tsx          — Empty
  app/(app)/groups/page.tsx             — Empty
  app/(app)/create-group/page.tsx       — Empty
  app/(app)/leaderboard/page.tsx        — Empty
  app/(app)/predictions/page.tsx        — Empty
  app/(app)/profile/page.tsx            — Empty
  app/(app)/trivia/page.tsx             — Empty
  app/join/enter/page.tsx               — Empty
  app/api/paypal/*.ts                   — PayPal routes (stubs)
  app/api/paddle/route.ts               — Paddle webhook (stub)
  components/{admin,app,dashboard,groups,landing}/  — Empty folders ready to fill

PLAN (do not deviate — README has the full roadmap, this is the short order)
============================================================================

PHASE 0 — SETUP
  1. Install Tailwind, configure with `design_handoff_cup_clash/tailwind.config.example.ts`
     copied into `tailwind.config.ts` at the repo root.
  2. Copy `design_handoff_cup_clash/tokens.css` into `app/globals.css`.
  3. Add Google Font imports for Bricolage Grotesque, Outfit, JetBrains Mono.
  4. Install shadcn/ui CLI and add: button, dialog, dropdown-menu, accordion,
     input, label, switch, toast, sheet, popover.
  5. Install runtime deps: zustand, @tanstack/react-query, @supabase/supabase-js,
     next-auth, lucide-react.

PHASE 1 — UI PRIMITIVES  (components/ui/)
  Build these BEFORE any pages. README §5 has the spec for each:
    Flag, Avatar, GlassCard, Chip, NeonBar, ScoreInput, LiveDot,
    BottomNav, TopBar, EmptyState

PHASE 2 — LANDING PAGE  (app/page.tsx)
  Port `Cup Clash Landing.html` exactly. Keep:
    - The full JSON-LD <script type="application/ld+json"> in <head>
      (use Next 14 metadata or app/layout.tsx for OG tags)
    - The complete responsive behavior (README §10)
    - All 9 feature cards, all 6 articles, all 7 FAQ items, both pricing tiers
  Replace inline styles with Tailwind classes. Keep the prose verbatim.

PHASE 3 — AUTH + STATE
  - Set up NextAuth with email magic-link + Google provider
  - Build `<SignUpModal />` as a Radix Dialog (use the SignUpScreen layout from
    cup-clash-funnels.jsx as visual reference)
  - Build the Zustand stores from README §7: auth, picks, group
  - CRITICAL: signup is NOT a gate on the app. Users explore freely; modal opens
    only when they try to commit (create-group, join-group, save-prediction).
    See README §6.1 for the exact flow.

PHASE 4 — APP SCREENS (one per route)
  Implement in this order so each unlocks the next:
    a. Dashboard          (app/(app)/dashboard)        → README §4.1
    b. My Groups          (app/(app)/groups)           → README §4.16
    c. Create Group       (app/(app)/create-group)     → README §4.13  [3-step wizard]
    d. Join Group         (app/join/[passkey])         → README §4.17
    e. Predictions        (app/(app)/predictions)      → README §4.2
    f. Leaderboard        (app/(app)/leaderboard)      → README §4.5
    g. Schedule + Standings                            → README §4.3, §4.4
    h. Bracket + Tournament Picks                      → README §4.9, §4.10
    i. Chat               (real-time via Supabase)     → README §4.7
    j. Notifications, Profile, Trivia, Admin           → README §4.6, §4.8, §4.15, §4.18

PHASE 5 — TRIGGERED MODALS (event-driven, NEVER on cold open)
  README §6.3 has the exact triggers:
    - <RateUsModal />
    - <ShareWithFriendsModal />
    - <PaymentModal />            (PayPal flow already scaffolded)
    - <CorporateUpsellModal />

PHASE 6 — REALTIME + POLISH
  - Wire Supabase Realtime channels for leaderboards and chat
  - Replace flagcdn.com remote calls with locally-hosted flag set
  - Replace stadium-bg.png with a licensed image
  - Run Lighthouse, fix any axe-core a11y violations
  - Replace `https://cupclash.com/` in the JSON-LD with the production domain
  - Generate the real OG image at /og-image.png

RULES OF ENGAGEMENT
===================
  • Match the visual fidelity of the HTML prototypes. Compare your output to
    the prototype frequently. Side-by-side it.
  • Use Tailwind classes; do not preserve inline styles from the prototype.
  • Type everything. No `any`. Use Zod for API payload validation.
  • Server components by default. Client components only where they need
    state, effects, or browser APIs.
  • Keep speaker-notes / commented-out prototype tweaks (TweaksPanel) OUT of
    production code. They're for design-time only.
  • Follow accessibility basics: every button has an aria-label or visible
    text, focus rings stay visible, color contrast ≥ 4.5:1 for body copy.
  • Don't ship analytics or trackers — the landing page promises "100% Ad-Free"
    and "no analytics tracking". If you need product analytics, use a
    self-hosted Plausible instance and disclose it in the privacy policy.

OPEN QUESTIONS for the product owner (README §13)
==================================================
Surface these before going to production:
  1. Buy-in pot legality by region (US state-level gambling laws)
  2. Refund policy for unused $2 friend joins
  3. Whether corporate admins see individual predictions or aggregate only
  4. Notification channels: push / email / both
  5. Group size cap given PayPal payout-split constraints (>50 = manual?)

Start by reading design_handoff_cup_clash/README.md end-to-end, then
confirm you understand the Phase 0 setup before touching code.
```

---

That's it. Paste, hit enter, and let the agent loose.
