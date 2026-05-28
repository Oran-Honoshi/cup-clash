# Critique: Dashboard

**Target:** `app/(app)/dashboard/page.tsx` + `components/dashboard/`  
**Date:** 2026-05-28  
**Register:** Product

---

## AI Slop Verdict

**Partial fail.** The dashboard reads as well-executed but predictable. A designer would clock two absolute-ban violations immediately: the hero-metric stat card trio and the side-stripe current-user highlight. The pervasive blur/glass across every panel compounds it — when every surface is glass, the material signal is gone. Individual components are well-crafted; the constellation is the problem.

---

## Assessment B: Detector Hits

| # | File | Line | Pattern | Severity |
|---|------|------|---------|----------|
| 1 | `leaderboard.tsx` | 267 | `borderLeft: "2px solid #00FF88"` — side-stripe border | **P1 (banned)** |
| 2 | `stat-cards.tsx` | all | Icon + big mono number + small-caps label, 3-col grid — hero-metric template | **P1 (banned)** |
| 3 | `stat-cards.tsx` | 43–44 | `backdropFilter: blur(40px)` — glassmorphism as default | P2 |
| 4 | `wall-of-shame.tsx` | 34 | `backdropFilter: blur(24px)` — glassmorphism as default | P2 |
| 5 | `next-match-card.tsx` | 87–88 | `backdropFilter: blur(40px)` — glassmorphism as default | P2 |
| 6 | `leaderboard.tsx` | 198–199 | `backdropFilter: blur(20px)` on PlayerDrawer — glass-on-glass | P2 |
| 7 | `buy-in-status.tsx` | 22 | `backdropFilter: blur(24px)` — glassmorphism as default | P2 |

No gradient text, no em dashes detected.

---

## Nielsen Heuristics

| # | Heuristic | Score | Notes |
|---|-----------|-------|-------|
| H1 | System status visibility | 3/4 | Save states on NextMatchCard are thorough; lock feedback clear; stat cards show live rank |
| H2 | Match between system and world | 3/4 | Football metaphors land; "Wall of Shame" is on-brand dark humor |
| H3 | User control and freedom | 2/4 | No undo on submitted predictions; group context is ambient — no explicit "you're in X group" anchor |
| H4 | Consistency and standards | 2/4 | StatCards use raw `style={}` throughout while all other components mix Tailwind + style; inconsistent panel color (some `rgba(18,14,38,0.32)`, some `rgba(255,255,255,0.07)`) |
| H5 | Error prevention | 3/4 | Score inputs constrained; deadline lock prevents post-match edits |
| H6 | Recognition over recall | 2/4 | Active group is shown in the group picker trigger but easily missed; no persistent "Group: X" heading on the page |
| H7 | Flexibility and efficiency | 2/4 | No keyboard shortcuts; prediction submit requires mouse/tap + separate confirm; no quick-predict affordance |
| H8 | Aesthetic and minimalist | 2/4 | Three stat cards at top + leaderboard table = rank and points shown twice; Wall of Shame is the bottom of the leaderboard reformatted — redundant content |
| H9 | Error recovery | 3/4 | NextMatchCard error states are distinct and actionable |
| H10 | Help and documentation | 2/4 | New users with no predictions see "-" / "0" everywhere; no empty-state copy or next-step prompt |

**Average: 2.4 / 4**

---

## Cognitive Load

Heavy. On first load a user sees: stat cards (3 numbers) + group picker + leaderboard podium + leaderboard table + wall of shame + next match card + buy-in status. That's 7 distinct information regions before any interaction. On mobile it becomes a single-column scroll of ~2000px before hitting the prediction input — the primary action.

The leaderboard and Wall of Shame duplicate intent. The Wall of Shame is specifically the bottom-3 of the same leaderboard, stylistically repackaged. A user who reads both learns nothing new.

---

## Priority Issues

### P1 — Fix before ship

**Side-stripe border on current user row** (`leaderboard.tsx:267`)
```js
// BANNED — remove
borderLeft: "2px solid #00FF88", paddingLeft: "calc(1.25rem - 2px)"
```
Replace with a full background tint (already present: `rgba(0,255,136,0.08)`) and a text color shift or a trailing badge. The background alone is sufficient to read "this is you."

**Hero-metric stat cards** (`stat-cards.tsx`)  
Icon + large mono number + small-caps label in a 3-column grid is the exact hero-metric template. The pattern is banned because it is the most instantly recognizable SaaS cliché. The data here (rank, points, exact scores) is genuinely useful — the problem is the presentation, not the content. Options:
- Inline these three values into the leaderboard header row for the current user (they belong there)
- Or replace the grid with a single horizontal scoreline strip: `#3  ·  14 pts  ·  2 exact` — one line, no cards
- The points value is already in the leaderboard row; showing it again above as a card is redundant

### P2 — Fix in this sprint

**Glassmorphism as default across every panel**  
All five components apply `backdropFilter: blur()` reflexively. When every surface blurs, the technique stops being purposeful and becomes wallpaper. The dark background (`#050810`) is opaque — nothing meaningful is visible through these panels anyway, making the blur a pure performance cost with no visual payoff. Remove `backdropFilter` and `WebkitBackdropFilter` from all panels. The solid tinted backgrounds (`rgba(18,14,38,0.32)`) hold up without the blur.

**Mobile scroll order buries primary action**  
On mobile the 12-col grid collapses to single column in source order: StatCards → Leaderboard → WallOfShame → NextMatchCard → BuyInStatus. The prediction card — the one thing users come to act on — is rank 4. Consider reordering on mobile: NextMatchCard first (primary action), then leaderboard, then secondary widgets.

**StatCards: no responsive text sizing**  
Three cells at 343px mobile width = ~111px each. The 9px label text (`fontSize: 9`) is technically legible but uncomfortably small. The value at 22px is fine. The icon wastes 26px (20px + 6px margin) in a cell where every pixel matters. Remove the icon column — the label provides the same semantic anchor.

### P3 — Polish pass

**Podium order without orientation**  
The podium renders 2nd / 1st / 3rd left-to-right (physical podium metaphor). Without a visible medal or position label on mobile, users read it left-to-right as 2nd-best first, which is confusing. The medal badge (🥈 🥇 🥉) covers this for some browsers but ensure the position number is always visible, not just the emoji.

**PlayerDrawer is glass on glass**  
The drawer (`leaderboard.tsx:198`) applies `backdropFilter: blur(20px)` over a panel that itself already has a glass treatment. The result is a muddy blur stack. Solid dark overlay (`rgba(5,8,16,0.92)`) would be cleaner.

**"Wall of Shame" and Leaderboard redundancy**  
Wall of Shame shows the bottom 3 accuracy players. The leaderboard already ranks everyone. Unless Wall of Shame uses a different metric (accuracy% vs. points), the component should either be removed or replaced with something that provides unique signal — e.g., "Biggest single-match points swing" or "Closest to perfect score."

**GuestBanner touch target**  
The "Create a group" and "Sign in" buttons in GuestBanner use a compact padding. Confirm `py-2.5` minimum on both.

---

## Persona Red Flags

**Mobile-first user (375px):** Has to scroll past ~1200px of leaderboard content before reaching the prediction input. The single action they came to perform is below the fold by two screen heights.

**New user (no predictions yet):** Stat cards read `#- · 0 pts · 0 exact`. No guidance on what to do. The empty NextMatchCard state would help — confirm it has an inviting empty state rather than just blank inputs.

**Admin user:** BuyInStatus shows pot progress. If the group isn't full, the progress bar is the most actionable thing for an admin (share the link). No direct "share group" CTA from the dashboard — requires navigating to the group page.
