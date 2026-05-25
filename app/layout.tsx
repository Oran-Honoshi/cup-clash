import type { Metadata } from "next";
import { Bricolage_Grotesque, Outfit, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { PWAInit } from "@/components/pwa-init";
import { PWAInstallBanner } from "@/components/ui/pwa-install-banner";
import { SoftwareAppSchema, FAQSchema, HowToSchema } from "@/components/seo/schemas";
import { PayPalScriptLoader } from "@/components/payments/paypal-script-loader";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap",
  weight: ["400", "500", "600", "700", "800"] });
const outfit    = Outfit({             subsets: ["latin"], variable: "--font-ui",      display: "swap",
  weight: ["400", "500", "600", "700"] });
const jetbrains = JetBrains_Mono({     subsets: ["latin"], variable: "--font-mono",    display: "swap",
  weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://cupclash.live"),
  title: {
    default: "CupClash 2026 — The Ultimate World Cup Prediction Arena",
    template: "%s | Cup Clash",
  },
  description: "104 matches, 3 countries, and your football IQ against friends. Join the ultimate 2026 World Cup prediction group. For the love of the game.",
  keywords: [
    "World Cup 2026 prediction league",
    "World Cup 2026 office pool",
    "FIFA 2026 prediction game",
    "World Cup 2026 friends group",
    "World Cup 2026 printable bracket alternative",
    "best World Cup app for friends",
    "private football prediction league",
    "corporate team building World Cup 2026",
    "office World Cup pool app",
    "מונדיאל 2026 ניחושים",
    "ליגת חברים למונדיאל 2026",
    "תחזיות כדורגל 2026",
  ],
  openGraph: {
    title:       "CupClash 2026: The Social Prediction Arena",
    description: "104 matches, 3 countries, and your football IQ against friends. Join the ultimate 2026 World Cup prediction group. For the love of the game.",
    url:         "https://cupclash.live",
    siteName:    "Cup Clash",
    type:        "website",
    images: [
      {
        url:    "https://cupclash.live/opengraph-image",
        width:  1200,
        height: 630,
        alt:    "Cup Clash — World Cup 2026 Prediction League",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "CupClash 2026: The Social Prediction Arena",
    description: "104 matches, 3 countries, and your football IQ against friends. Join the ultimate 2026 World Cup prediction group.",
    images:      ["https://cupclash.live/opengraph-image"],
  },
  alternates: {
    canonical: "https://cupclash.live",
    languages: { "he": "https://cupclash.live", "en": "https://cupclash.live" },
  },
  icons: {
    icon: [
      { url: "/favicon.ico",       sizes: "any"      },
      { url: "/favicon-16x16.png", sizes: "16x16",   type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32",   type: "image/png" },
      { url: "/icon-192.png",      sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",      sizes: "512x512", type: "image/png" },
    ],
    apple:    { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${outfit.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="icon" type="image/x-icon"    href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180"    href="/apple-touch-icon.png" />
        <link rel="alternate" hrefLang="he" href="https://cupclash.live" />
        <link rel="alternate" hrefLang="en" href="https://cupclash.live" />

        {/* Extra OG tags not covered by Next.js metadata */}
        <meta property="og:locale"           content="en_US" />
        <meta property="og:locale:alternate" content="he_IL" />
        <meta property="og:image:width"      content="1200" />
        <meta property="og:image:height"     content="630"  />

        {/* WhatsApp / LinkedIn specific */}
        <meta property="og:site_name" content="Cup Clash" />
        <meta name="theme-color"      content="#00D4FF" />

        <SoftwareAppSchema />
        <FAQSchema />
        <HowToSchema />
      </head>
      <body>
        <ThemeProvider>
          {/* PayPal SDK preloaded globally so checkout components mount instantly */}
          <PayPalScriptLoader />
          {children}
        </ThemeProvider>
        <PWAInit />
        <PWAInstallBanner />
        <Analytics />
      </body>
    </html>
  );
}