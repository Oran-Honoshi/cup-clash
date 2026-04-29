/**
 * Social Auth Buttons — Apple & Facebook
 *
 * SETUP GUIDE — Apple Sign In:
 * 1. Enroll in Apple Developer Program ($99/year) at developer.apple.com
 * 2. Create a Services ID under Certificates, Identifiers & Profiles
 * 3. Enable "Sign in with Apple" and configure your domain + redirect URI
 * 4. In Supabase: Auth → Providers → Apple → enable + paste your credentials
 * 5. Uncomment the Apple signIn call below
 *
 * SETUP GUIDE — Facebook Sign In:
 * 1. Go to developers.facebook.com → My Apps → Create App
 * 2. Add "Facebook Login" product → enable Web OAuth
 * 3. Add your domain to Valid OAuth Redirect URIs
 * 4. In Supabase: Auth → Providers → Facebook → enable + paste App ID + Secret
 * 5. Uncomment the Facebook signIn call below
 */

"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface SocialAuthProps {
  redirectTo?: string;
  className?: string;
}

export function SocialAuth({ redirectTo = "/dashboard", className }: SocialAuthProps) {
  const handleApple = async () => {
    // TODO: Enable once Apple Developer credentials are configured in Supabase
    // const sb = getClient();
    // await sb.auth.signInWithOAuth({
    //   provider: "apple",
    //   options: { redirectTo: `${window.location.origin}${redirectTo}` },
    // });
    alert("Apple Sign In coming soon! Set up your Apple Developer credentials in Supabase first.");
  };

  const handleFacebook = async () => {
    // TODO: Enable once Facebook App credentials are configured in Supabase
    // const sb = getClient();
    // await sb.auth.signInWithOAuth({
    //   provider: "facebook",
    //   options: { redirectTo: `${window.location.origin}${redirectTo}` },
    // });
    alert("Facebook Sign In coming soon! Set up your Facebook App credentials in Supabase first.");
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-pitch-600">or continue with</span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Apple */}
        <button onClick={handleApple}
          className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-all text-sm font-bold text-white"
        >
          {/* Apple logo SVG */}
          <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.9-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 39.1 0 109.5-50.1 185.1-50.1 29.8 0 110.7 2.6 166.1 80.3zm-201.3-192.8c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
          </svg>
          Apple
        </button>

        {/* Facebook */}
        <button onClick={handleFacebook}
          className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-all text-sm font-bold text-white"
        >
          {/* Facebook logo SVG */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>

      <p className="text-center text-[10px] text-pitch-600">
        Social sign-in requires additional setup — see code comments
      </p>
    </div>
  );
}
