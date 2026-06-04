import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Outfit, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/i18n/locale-provider";
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

export const viewport: Viewport = {
  themeColor: "#0a1b0e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cupclash.live"),
  title: {
    default: "CupClash 2026: The Ultimate World Cup Prediction Arena",
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
  applicationName: "Cup Clash",
  appleWebApp: {
    capable: true,
    title: "Cup Clash",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    title:          "CupClash 2026: The Social Prediction Arena",
    description:    "104 matches, 3 countries, and your football IQ against friends. Join the ultimate 2026 World Cup prediction group. For the love of the game.",
    url:            "https://cupclash.live",
    siteName:       "Cup Clash",
    type:           "website",
    locale:         "en_US",
    alternateLocale: ["he_IL"],
    images: [
      {
        url:    "https://cupclash.live/icons/og-image.png",
        width:  1200,
        height: 630,
        alt:    "Cup Clash: World Cup 2026 Prediction League",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "CupClash 2026: The Social Prediction Arena",
    description: "104 matches, 3 countries, and your football IQ against friends. Join the ultimate 2026 World Cup prediction group.",
    images:      ["https://cupclash.live/icons/og-image.png"],
  },
  alternates: {
    canonical: "https://cupclash.live",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${outfit.variable} ${jetbrains.variable}`}>
      <head>
        <SoftwareAppSchema />
        <FAQSchema />
        <HowToSchema />
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5832631613316478" crossOrigin="anonymous" />
      </head>
      <body>
        <noscript>
          <div style={{
            padding: "2.5rem 1.5rem",
            textAlign: "center",
            background: "#050810",
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1.5,
          }}>
            <strong style={{ display: "block", marginBottom: "0.5rem", fontSize: "1.125rem" }}>
              Cup Clash needs JavaScript.
            </strong>
            Predictions, the live leaderboard, and the countdown clock all run in your browser. Enable JavaScript to play.
          </div>
        </noscript>
        <LocaleProvider>
        <ThemeProvider>
          {/* PayPal SDK preloaded globally so checkout components mount instantly */}
          <PayPalScriptLoader />
          {children}
        </ThemeProvider>
        </LocaleProvider>
        <PWAInit />
        <PWAInstallBanner />
      </body>
    </html>
  );
}
