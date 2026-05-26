# Product

## Register

brand

> **Dual-surface project.** This default applies to the landing, pricing, articles, and for-companies pages — the immediate priority before World Cup kickoff. Anything under `app/(app)/*` (dashboard, groups, predictions, chat, bracket, tournament-picks, profile, notifications, trivia) is a **product** surface and should be designed against [reference/product.md](.claude/skills/impeccable/reference/product.md). When invoking impeccable on a product route, override the register explicitly.

## Users

**Primary: the friend-group organizer.** The person who decides "we should do a Cup Clash for the World Cup," names the group (Tech Titans, Family Cup, Saturday Pub Lads), picks the scoring rules, and pesters their group chat to join. They're 25–45, in an office or friend cohort that follows the tournament socially, and they want zero-friction invites — a passkey they can paste in WhatsApp and a $2 PayPal split that doesn't make them look like the cheap one. They use the app on a phone, often during the match itself, alongside the broadcast.

Secondary: the casual participant who joins via passkey, makes picks, checks rank — never creates a group. And the corporate sponsor (HR or team lead) who pays $75 to make the same experience free for an office of 50.

**The job to be done:** turn a tournament that everyone is already watching into a social event with stakes — bragging rights, a small pot, group-chat-grade banter — without it becoming a chore to maintain.

## Product Purpose

Cup Clash is a private prediction league for the 2026 FIFA World Cup. Users create or join small groups (friends, family, office, bar), predict the outcome of all 104 matches plus tournament-long picks (Champion, Golden Boot, Golden Ball), and compete on a private leaderboard with live chat during matches.

Success looks like:
- **Pre-tournament (now → June 11):** the landing/funnel converts visitors to signed-up group organizers. The guest-explore funnel lets people poke around before committing.
- **During tournament (June 11 → July 19):** organizers come back daily, picks get locked before kickoff, the chat lights up during matches, and the leaderboard moves enough to keep stragglers engaged.
- **Monetization:** $2 PayPal pots cover friend groups; $75 corporate sponsorship makes office leagues free for everyone. **Zero ads, zero tracking** — this is a paid product positioned against the surveillance economy of sportsbooks.

## Brand Personality

**Loud, hyped, gameday — but never casino.** Three words: *stadium, social, sharp*.

- **Stadium.** The energy of a packed pub watching the second-half stoppage-time winner. Big numbers in JetBrains Mono that feel like a scoreboard. Live timers, pulsing dots, score flips that snap. A dark palette earned by the broadcast context — matches are watched at night, on couches, on phones held in one hand. Neon green for "you" / wins / accent CTAs. Cyan for live state. Amber for leaders.
- **Social.** It's a group game first, a stats game second. Chat bubbles, leaderboard movement, "you climbed 3 ranks" — these are the payoff, not the picks UI. Copy reads like a group-chat friend, not a sportsbook host.
- **Sharp.** Production craft visible in the typography (Bricolage Grotesque display, Outfit body, JetBrains Mono numerals), the glass-blur surfaces, the motion timing. Confident. Knows what it is. Doesn't apologize for the dark mode or hedge with a "light theme coming soon."

## Anti-references

Three specific anti-lanes, in order of how easy they'd be to fall into:

1. **Sportsbook / gambling apps** (DraftKings, FanDuel, Bet365). Cup Clash shares the *category* (sports + small money + predictions) and the *palette* (dark + neon). It must not share the *patterns*: aggressive odds boards, urgency manipulation, casino-grade animations, "free $50 bet" carrots, dark-pattern cancel flows, "responsible gambling" disclaimers. A $2 pot among friends is a social pool, not gambling — the interface has to make that obvious.
2. **Generic SaaS dashboards** (Stripe-imitation landings, Linear-imitation app shells, Vercel-template features grids). The category default for a "modern dark app" is light navy + soft purple + identical feature card grids. Cup Clash uses a sharper palette and richer typography precisely to escape this gravity. No hero-metric template, no "Built for teams" three-up icon grid.
3. **Children's game / cartoon UI** (Duolingo's mascot-driven warmth, FIFA Mobile's heavy stylization). Cup Clash is playful but adult. No mascots, no oversized cartoon UI elements, no "Whoops! Better luck next time!" copy. Restraint in personality, not in energy.

## Design Principles

1. **Stadium energy, not casino energy.** Loudness comes from match drama — live timers, score flips, the leaderboard re-sorting after a result — not from urgency manipulation, fake scarcity, or "lock in your bet" pressure. If a piece of motion or copy could appear on a sportsbook, rework it.
2. **Earn the dark mode.** Dark is the right choice (night matches, immersive viewing, the scoreboard metaphor) but it has to be justified with depth, glow, and considered contrast. Flat dark UI reads as default-cool. The glass-blur surfaces, the neon halo on primary CTAs, the inset highlights on cards — these are the work that makes dark feel intentional.
3. **The funnel earns trust before it asks.** Guests can explore the demo dashboard freely. The signup modal opens only at the moment of real commitment (create-group, join-group, save-prediction). Every gate is a moment we've earned, not a barrier we've installed. **Never gate the first session.**
4. **Mobile-first means thumb-first.** Most product-surface interactions happen on a phone during or right before a match, often one-handed. Primary actions reach the thumb (bottom nav, sticky CTAs at the bottom of long lists). Desktop is a courtesy view, not the design target.
5. **Show the game, not the picks UI.** Picks are input; live state, leaderboard movement, and chat are the payoff. When a match is live, it dominates the dashboard. When a result lands, the leaderboard reorders visibly. Hierarchy should reflect that the product is about *following the tournament with friends*, not about a pick-entry form.
6. **Practice what you preach on privacy.** The landing says "100% ad-free, no tracking." That promise sets the visual tone (no analytics pixel widgets, no engagement-bait modals, no dark-pattern unsubscribe), and it ships in the product (no third-party fonts in prod, hosted flag CDN, opt-in notifications only).

## Accessibility & Inclusion

**Target: WCAG 2.1 AA, mobile-first, motion-respectful.**

- **Contrast:** 4.5:1 for body text, 3:1 for large text and UI components. The dark + glass + neon palette needs explicit checking — `fg/muted` (white/70%) on glass backgrounds is the recurring failure mode; verify before shipping any new surface.
- **Motion:** respect `prefers-reduced-motion: reduce`. The `livePulse`, `floatY`, score-flip, and modal-slide animations all need a reduced-motion fallback that preserves state changes without movement.
- **Keyboard nav:** every interactive element reachable and visible-focus styled. The bottom nav, modal stack, and FAQ accordion need explicit focus management.
- **Screen reader:** flags need accessible labels (`alt="Brazil"`), score inputs need labeled controls, live regions for leaderboard updates during matches.
- **Color-coding:** green/red for win/loss is the convention but never the sole signal. Pair with iconography or text (crown for #1, dimmed avatar for eliminated).
- **Internationalization:** the audience is global (World Cup), so copy should avoid US-centric metaphors. RTL is not in scope for v1 but layouts should not bake in LTR-only assumptions.
