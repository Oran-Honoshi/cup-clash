"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SocialAuthProps {
  redirectTo?: string;
  className?: string;
}

export function SocialAuth({ className }: SocialAuthProps) {
  const handleGoogle = async () => {
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://cupclash.live/auth/callback" },
    });
  };

  const handleFacebook = async () => {
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: "https://cupclash.live/auth/callback" },
    });
  };

  const handleApple = () => {
    // TODO: Enable once Apple Developer credentials are configured in Supabase
    // 1. Enroll in Apple Developer Program at developer.apple.com
    // 2. Create a Services ID, enable Sign in with Apple, configure domain + redirect URI
    // 3. Supabase: Auth → Providers → Apple → enable + paste credentials
    alert("Apple Sign In coming soon!");
  };

  const btnClass =
    "flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-all text-sm font-bold text-white";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-pitch-600">or continue with</span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      {/* Google — Facebook temporarily hidden */}
      <div className="grid grid-cols-1 gap-2">
        <button onClick={handleGoogle} className={btnClass}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        {/* Facebook — temporarily hidden; re-enable by uncommenting
        <button onClick={handleFacebook} className={btnClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
        */}
      </div>

      {/* Apple — not yet configured */}
      <button onClick={handleApple} className={cn(btnClass, "w-full opacity-50 cursor-not-allowed")}>
        <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.9-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 39.1 0 109.5-50.1 185.1-50.1 29.8 0 110.7 2.6 166.1 80.3zm-201.3-192.8c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
        </svg>
        Apple (coming soon)
      </button>
    </div>
  );
}
