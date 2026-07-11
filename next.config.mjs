/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Dynamic pages (leaderboard, dashboard, etc.) must never serve a stale
    // client-side Router Cache entry after in-app navigation — scores/points
    // change server-side (cron scoring) without the user triggering a fetch.
    staleTimes: { dynamic: 0 },
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ljivgwkczgqvcqkdzsxr.supabase.co" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "media.giphy.com" },
      { protocol: "https", hostname: "media0.giphy.com" },
      { protocol: "https", hostname: "media1.giphy.com" },
      { protocol: "https", hostname: "media2.giphy.com" },
      { protocol: "https", hostname: "media3.giphy.com" },
      { protocol: "https", hostname: "media4.giphy.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
    // Allow unoptimized for flag CDN
    unoptimized: false,
  },
};

export default nextConfig;
