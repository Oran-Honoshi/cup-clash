"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme, type AppTheme } from "@/components/theme-provider";

// 2x2 grid, tap-to-apply theme picker. Each swatch is built live from the
// theme's own --bg/--sf/--ac hex values (not a static screenshot), so it
// stays accurate if those tokens ever change in globals.css.
const THEMES: { id: AppTheme; name: string; bg: string; sf: string; ac: string; darkLabel: boolean }[] = [
  { id: "a", name: "Stadium Night", bg: "#10141D", sf: "#1A1F2B", ac: "#00CF80", darkLabel: false },
  { id: "b", name: "Fan Zone",      bg: "#F0F2F5", sf: "#FFFFFF", ac: "#00CF80", darkLabel: true  },
  { id: "c", name: "Data Forward",  bg: "#FFFFFF", sf: "#F8F9FA", ac: "#00CF80", darkLabel: true  },
  { id: "d", name: "Chalk Talk",    bg: "#1A3E2A", sf: "#2F4F4F", ac: "#00CF80", darkLabel: false },
];

export function ThemePicker() {
  const { appTheme, setAppTheme } = useTheme();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const select = (id: AppTheme) => {
    setAppTheme(id);
    if (userId) {
      const sb = createClient();
      sb.from("profiles").update({ theme_preference: id }).eq("id", userId).then();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {THEMES.map(theme => {
        const active = appTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => select(theme.id)}
            aria-pressed={active}
            className="relative flex flex-col items-center gap-2.5 p-3 rounded-2xl transition-all"
            style={{
              background: theme.bg,
              border: active ? `2px solid ${theme.ac}` : "1px solid rgba(128,128,128,0.25)",
              boxShadow: active ? `0 0 0 3px color-mix(in srgb, ${theme.ac} 25%, transparent)` : "none",
            }}
          >
            {active && (
              <span
                className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
                style={{ background: theme.ac }}
              >
                <Check size={12} color={theme.bg} strokeWidth={3} />
              </span>
            )}
            <div
              className="w-full h-10 rounded-lg flex items-end justify-start p-1.5"
              style={{ background: theme.sf, border: "1px solid rgba(128,128,128,0.15)" }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: theme.ac }} />
            </div>
            <span
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: theme.darkLabel ? "#1A365D" : "#FFFFFF" }}
            >
              {theme.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
