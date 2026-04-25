# Cup Clash

Private prediction leagues for the 2026 World Cup. Score guesses, top scorers, knockout brackets — tracked in one place. Predict every match, beat your friends.

This is the **landing page + foundation** scaffold. Database (Supabase), auth, betting engine, and Stripe wire-up come next.

## Stack

- Next.js 14 (App Router) + React 18
- TypeScript, Tailwind CSS 3
- framer-motion (page reveals + micro-interactions)
- date-fns (countdowns, time math)
- lucide-react (all UI icons)
- zod (form validation, ready for the admin payout modal)
- PWA-ready (installable on mobile home screen)

## Architecture

### The swap-in service layer

All data access goes through `lib/services/`. Right now those functions return mock data from `lib/mocks/data.ts` (seeded from the project sample JSON). When Supabase is ready, you replace the function bodies — the call sites and types don't change.

```
lib/
  types/          # Domain types (Group, Member, Match, etc.)
  countries.ts    # Country catalog with theme tokens
  mocks/          # Seed data for development
  services/       # ← swap these to Supabase queries later
    groups.ts
    matches.ts
```

### Hybrid design system

White-first SaaS aesthetic for credibility (Linear / Notion / Vercel territory), plus one signature stadium-energy element: the **CountdownCard** in the hero. Dark, glowing, and re-tints to whatever country the user picks. Every accent on the page (CTAs, gradients, focus rings) shifts in real time when the country changes.

The brand fallback is indigo → violet (`#6366F1` → `#8B5CF6`). When a user picks a country, that gradient endpoint flexes to the country accent.

### Theming via CSS variables

`ThemeProvider` writes `--accent` and `--accent-glow` (RGB triplets) into `:root`. Tailwind utilities like `text-accent`, `bg-accent`, `border-accent`, `shadow-cta` all pick these up automatically. Zero re-renders, instant theme switch.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Mobile install (PWA)

The app is a Progressive Web App — once deployed over HTTPS, users can install it to their phone home screen:

- **iOS**: Safari → Share → "Add to Home Screen"
- **Android**: Chrome will prompt automatically; or use "Install app" from the menu

The icons (`icon-192.png`, `icon-512.png`, `icon-maskable.png`, `apple-icon.png`) and `manifest.webmanifest` are already in `public/`. To regenerate icons, edit `public/icon.svg` and re-run the icon script (or replace the PNGs directly).

## Deploy to Vercel

1. **Push to GitHub** (one-time setup):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Cup Clash landing"
   git branch -M main
   git remote add origin https://github.com/<your-username>/cup-clash.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to <https://vercel.com/new>
   - Click **Import** next to your `cup-clash` repo
   - Framework preset is auto-detected (Next.js)
   - Click **Deploy** — no env vars needed yet

3. **Share the preview URL** for QA. Pull requests get their own preview URLs.

## What's built

- ✅ Landing page (Navbar, Hero, Features, How it works, Country picker, Pricing, Final CTA, Footer)
- ✅ Hybrid design: light SaaS layout + dark stadium countdown jewel
- ✅ Dynamic country theming (12 countries, click any flag to re-skin)
- ✅ PWA: manifest, icons (192, 512, maskable, apple), Apple meta tags
- ✅ Reusable UI primitives (Button, Card, Badge, IconBox, Logo)
- ✅ Typed service layer with mocks behind it
- ✅ Mobile-responsive (proper hamburger menu, stacked hero, grid breakpoints)
- ✅ Reduced-motion support for accessibility

## What's next

- Supabase schema + auth (replace `lib/services/*` bodies)
- Group dashboard (member list, buy-in tracker, prize-split modal with `zod` validation)
- Betting engine (match guesses, lock logic, point history)
- Admin pages (scoring rules, finance panel)
- Stripe checkout (Stripe action stub exists in your project files)

## Libraries: installed vs deferred

The full library wishlist (~12 packages) is curated. Installed only what's used right now:

**Now:**
- `framer-motion` — landing reveals + theme transitions
- `zod` — ready for form validation
- `date-fns`, `lucide-react`, `clsx`, `tailwind-merge` — already in core

**Deferred** (added when the relevant feature lands):
- `@tanstack/react-query` — needs a real API
- `currency.js` — needs the buy-in feature
- `canvas-confetti` — needs the win-state celebration
- `recharts` — needs the performance chart
- `@react-pdf/renderer` — needs the admin payout report
- `next-themes` — already replaced by our custom ThemeProvider
- `react-copy-to-clipboard` — replaced with native `navigator.clipboard`

## File map

```
app/
  layout.tsx           # Inter font, ThemeProvider, PWA metadata
  page.tsx             # Landing page (server component)
  globals.css          # Design system + CSS variables
components/
  theme-provider.tsx   # Country theme context
  logo.tsx             # Cup Clash mark + wordmark
  ui/                  # Reusable primitives
    button.tsx
    card.tsx           # Card, Badge, IconBox
  landing/             # All landing page sections
    navbar.tsx
    hero.tsx
    countdown-card.tsx # Stadium-energy jewel
    features.tsx
    how-it-works.tsx
    country-picker-section.tsx
    pricing.tsx
    cta-and-footer.tsx
lib/
  types/               # Domain types
  countries.ts         # Country catalog + theme tokens
  mocks/               # Seed data
  services/            # ← Supabase swap-in point
  utils.ts             # cn() class merger
public/
  manifest.webmanifest # PWA manifest
  icon.svg             # Source SVG
  icon-192.png         # PWA icon
  icon-512.png         # PWA icon (large)
  icon-maskable.png    # Adaptive Android icon
  apple-icon.png       # iOS home screen
  favicon.ico
```
