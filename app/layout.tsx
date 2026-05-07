import type { Metadata, Viewport } from "next";
import { Urbanist, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Urbanist — modern geometric, sporty display font
const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cupclash.live"),
  title: "Cup Clash | World Cup 2026 Prediction League & Office Pool",
  description:
    "Ditch Excel. Run your World Cup 2026 group with Cup Clash. Live leaderboards, brackets, and trivia for the 48-team tournament. Ad-free & mobile-ready.",
  applicationName: "Cup Clash",
  manifest: "/manifest.webmanifest",
  keywords: [
    "World Cup 2026 office pool platform",
    "private World Cup prediction league for friends",
    "FIFA 2026 bracket challenge for groups",
    "best World Cup sweepstake app 2026",
    "automated World Cup leaderboard generator",
    "World Cup 2026 group betting tracker",
    "soccer prediction software for coworkers",
    "online World Cup pool manager with buy-in",
    "48-team World Cup bracket maker",
    "custom World Cup trivia game for members",
  ],
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Cup Clash" },
  openGraph: {
    title: "Cup Clash | World Cup 2026 Prediction League & Office Pool",
    description: "Ditch Excel. Run your World Cup 2026 group with Cup Clash. Live leaderboards, brackets, and trivia for the 48-team tournament. Ad-free & mobile-ready.",
    type: "website",
    images: [{ url: "/trophy-stadium.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cup Clash | World Cup 2026 Prediction League",
    description: "Ditch Excel. Run your World Cup pool like a pro. Live leaderboards, brackets, trivia. Ad-free.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico",        sizes: "any"                },
      { url: "/favicon-16x16.png",  sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png",  sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png",       sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",       sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#050a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${urbanist.variable} ${inter.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}