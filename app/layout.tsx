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
  title: "Cup Clash — The World Cup 2026 Prediction League for Your Group",
  description:
    "Predict every match. Beat your friends. Cup Clash is the private World Cup 2026 prediction league — score guesses, live leaderboard, knockout bracket, trivia. Free to start.",
  applicationName: "Cup Clash",
  manifest: "/manifest.webmanifest",
  keywords: [
    "World Cup 2026 prediction game",
    "FIFA 2026 office pool",
    "World Cup sweepstake app",
    "football prediction league",
    "soccer prediction game friends",
    "World Cup 2026 group prediction",
  ],
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Cup Clash" },
  openGraph: {
    title: "Cup Clash — World Cup 2026 Prediction League",
    description: "Predict every match. Beat your friends. The private World Cup prediction app your group has been waiting for.",
    type: "website",
    images: [{ url: "/trophy-stadium.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cup Clash — World Cup 2026 Prediction League",
    description: "Predict every match. Beat your friends.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
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
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
