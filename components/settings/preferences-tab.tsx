"use client";

import { ThemePicker } from "@/components/ui/theme-picker";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { useNavMode, type NavMode } from "@/lib/contexts/nav-mode-context";

const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 22,
} as const;

const NAV_MODES: { id: NavMode; label: string; description: string }[] = [
  { id: "switcher", label: "Switcher", description: "5-tab bottom bar — default" },
  { id: "hub",      label: "Hub",      description: "Floating “Explore zones” picker" },
  { id: "hybrid",   label: "Hybrid",   description: "3 pinned tabs + More" },
];

export function PreferencesTab() {
  const { navMode, setNavMode } = useNavMode();

  return (
    <div className="space-y-6 max-w-xl pb-32">
      <div style={{ ...glassCard, padding: 20 }}>
        <div className="label-caps mb-3">App Theme</div>
        <ThemePicker />
      </div>

      <div style={{ ...glassCard, padding: 20 }}>
        <div className="label-caps mb-3">Language</div>
        <LanguageSelector />
      </div>

      <div style={{ ...glassCard, padding: 20 }}>
        <div className="label-caps mb-1">Navigation style</div>
        <p className="mb-3" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          Switcher is the recommended default. Hub and Hybrid are kept available for testing.
        </p>
        <div className="space-y-2">
          {NAV_MODES.map((mode) => {
            const active = navMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setNavMode(mode.id)}
                className="w-full flex items-center justify-between gap-3 text-left rounded-xl transition-all"
                style={{
                  padding: "12px 14px",
                  background: active ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.03)",
                  border: active ? "1px solid rgba(0,212,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div>
                  <div className="text-sm font-bold" style={{ color: active ? "#00D4FF" : "white" }}>{mode.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{mode.description}</div>
                </div>
                {active && (
                  <span className="h-5 w-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#00D4FF" }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: "#050810" }} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
