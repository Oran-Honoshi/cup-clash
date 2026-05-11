import type { Metadata } from "next";
import { Urbanist, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { PWAInit } from "@/components/pwa-init";
import { SoftwareAppSchema, FAQSchema, HowToSchema } from "@/components/seo/schemas";
import "./globals.css";

const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const inter    = Inter({     subsets: ["latin"], variable: "--font-sans",    display: "swap" });
const jetbrains= JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://cupclash.live"),
  title: {
    default:  "Cup Clash | World Cup 2026 Prediction League for Friends & Offices",
    template: "%s | Cup Clash",
  },
  description: "The ultimate World Cup 2026 prediction league for private groups. Set up in 60 seconds, $2 per player for the whole tournament. Live leaderboards, brackets, and group chat.",
  keywords: [
    "World Cup 2026 prediction league",
    "World Cup 2026 office pool",
    "FIFA 2026 prediction game",
    "World Cup 2026 friends group",
    "World Cup 2026 printable bracket alternative",
    "best World Cup app for friends",
    "private football prediction league",
    "מונדיאל 2026 ניחושים",
    "ליגת חברים למונדיאל 2026",
    "תחזיות כדורגל 2026",
  ],
  openGraph: {
    title:       "Cup Clash — World Cup 2026 Prediction League",
    description: "The excitement of the tournament for the price of a coffee. $2 for 104 matches.",
    url:         "https://cupclash.live",
    siteName:    "Cup Clash",
    type:        "website",
    locale:      "en_US",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Cup Clash — World Cup 2026 Prediction League",
    description: "$2 for the whole World Cup 2026. Set up your group in 60 seconds.",
  },
  alternates: {
    canonical: "https://cupclash.live",
    languages: { "he": "https://cupclash.live" },
  },
  icons: {
    icon: [
      { url: "/favicon.ico",       sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png",      sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",      sizes: "512x512", type: "image/png" },
    ],
    apple:   { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${urbanist.variable} ${inter.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="icon" type="image/x-icon"    href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180"    href="/apple-touch-icon.png" />
        <link rel="alternate" hrefLang="he" href="https://cupclash.live" />
        <link rel="alternate" hrefLang="en" href="https://cupclash.live" />
        <SoftwareAppSchema />
        <FAQSchema />
        <HowToSchema />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <PWAInit />
        <Analytics />
      </body>
    </html>
  );
}