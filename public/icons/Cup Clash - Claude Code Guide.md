# Cup Clash — Icon & Meta Implementation Guide (for Claude Code)

This package gives **Cup Clash** a complete, production-ready icon set built from the
1024px master artwork. Everything below is copy-and-paste. Hand this whole file to
Claude Code as the task brief.

**Adopted treatment:** every app/home-screen/PWA icon uses **B · Centered** — the trophy
eased in with a soft vignette so it survives every phone mask. The favicon uses a tight
**bowl crop (C)** for legibility, and the full scene (A) is kept only for store/marketing art.

---

## 0. What you're installing

| Goal | Files |
|---|---|
| Browser tab icon | `favicon.ico`, `favicon-32.png`, `favicon-16.png` |
| iOS "Add to Home Screen" | `apple-touch-icon.png` (180×180) |
| Android / PWA install | `icon-192.png`, `icon-512.png`, `maskable-192.png`, `maskable-512.png` + `site.webmanifest` |
| Shared-link preview | `og-image.png` (1200×630) + OG/Twitter meta tags |
| In-app / nav mark | `clean-512.png` (bold crop) |

**Design guarantees already baked in:** the green pitch bleeds to all four edges
(so OS rounding never shows a white corner), the trophy sits inside Android's inner-80%
safe zone (never clipped by circle/squircle/teardrop masks), and the favicon is cropped to
the cup bowl so it stays legible at 16px.

---

## 1. Drop the files in

Copy the contents of the `/icons` folder and the `/handoff` folder into your project.
Icon paths in the manifest are root-absolute (`/icons/...`), so the icons must be served
from the web root.

### Plain HTML site
```
your-site/
├── index.html
├── favicon.ico                 ← copy from icons/favicon.ico
├── apple-touch-icon.png        ← copy from icons/apple-touch-icon.png
├── site.webmanifest            ← copy from handoff/site.webmanifest
└── icons/
    ├── favicon-16.png
    ├── favicon-32.png
    ├── icon-192.png
    ├── icon-512.png
    ├── maskable-192.png
    ├── maskable-512.png
    └── og-image.png
```

### Next.js (App Router)
- Put `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest`, and the `icons/`
  folder inside **`/public`**. They are served from the root (`/favicon.ico`,
  `/icons/og-image.png`, …) — paths work unchanged.
- Paste the head snippet into your root layout's `<head>`, **or** use the metadata API (§4).

### Vite / CRA / SvelteKit / Astro
- Put everything in the **`/public`** directory. Same root-absolute paths apply.

> **Important:** `favicon.ico` and `apple-touch-icon.png` work best at the web **root**
> (`/favicon.ico`, `/apple-touch-icon.png`) — iOS and some crawlers probe those exact URLs.

---

## 2. Add the `<head>` tags

Paste the entire contents of **`handoff/head-snippet.html`** into your `<head>`.
The domain is already set to **`https://cupclash.live`** — `og:image` / `twitter:image`
URLs are absolute, as social platforms require. Double-check it matches your live domain.

---

## 3. The web manifest

`handoff/site.webmanifest` is ready to go:

```json
{
  "name": "Cup Clash",
  "short_name": "Cup Clash",
  "description": "Predict. Compete. Clash.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a1b0e",
  "theme_color": "#0a1b0e",
  "icons": [
    { "src": "/icons/icon-192.png",     "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png",     "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```
Keep both `any` **and** `maskable` entries — that pairing is what stops Android from
either clipping or shrink-padding the icon.

---

## 4. (Optional) Next.js metadata API instead of raw tags

In `app/layout.tsx`:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cup Clash — Football Tournaments",
  description: "Predict. Compete. Clash.",
  manifest: "/site.webmanifest",
  themeColor: "#0a1b0e",
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Cup Clash",
    title: "Cup Clash — Football Tournaments",
    description: "Predict. Compete. Clash.",
    url: "https://cupclash.live/",
    images: [{ url: "https://cupclash.live/icons/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cup Clash — Football Tournaments",
    description: "Predict. Compete. Clash.",
    images: ["https://cupclash.live/icons/og-image.png"],
  },
};
```

---

## 5. Using the mark inside the UI

- **Nav bar / app header:** `clean-512.png` (the bold crop) at ~32–40px, rounded ~22%,
  paired with the wordmark text. Don't use the full-scene icon in nav — the field detail
  turns to mush below ~48px.
- **Avatars / compact chips:** `clean-512.png`.
- **Splash / large hero / store listing:** `icon-512.png`.

---

## 6. Verify it works

1. **Lighthouse → PWA / "Installable"** — should pass with no icon warnings.
2. **Browser tab** — favicon shows after a hard refresh (try a private window; favicons
   cache hard).
3. **Android Chrome → Install app** — home-screen icon shows the trophy, green to the edge.
4. **iOS Safari → Share → Add to Home Screen** — squircle, no white border.
5. **Share preview** — paste your URL into Slack / iMessage / the
   [opengraph.xyz](https://www.opengraph.xyz) debugger. The OG image needs a **public,
   absolute https URL** (works once deployed, not on `localhost`).

---

## 7. Brand values used

- **Tagline:** "Predict. Compete. Clash." (in manifest, meta description, and baked into
  `og-image.png`).
- **Domain:** `https://cupclash.live`.
- **Title:** "Cup Clash — Football Tournaments".
- **Theme color:** `#0a1b0e` (sampled from the artwork).

> If you ever change the tagline or wordmark, the text on `og-image.png` is part of the
> image (not live HTML) — ask the designer to re-render that one file.

---

*Generated from `CupClash-New-Icon.png` (1024×1024). See `Cup Clash — Icon System.html`
for the visual showcase.*
