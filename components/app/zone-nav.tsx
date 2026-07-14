"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Compass, X } from "lucide-react";
import { ZONES, isZoneActive, type Zone } from "@/lib/zones";
import { useNavMode } from "@/lib/contexts/nav-mode-context";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";

// Keyboard-avoidance: only react to keyboard-sized viewport changes (>100px)
// — gesture nav on Android briefly fires tiny visualViewport resizes that
// would otherwise make the bar jump on fast upward scrolls. Same fix as the
// nav bar this component replaces (components/app/mobile-nav.tsx).
function useKeyboardAvoidance(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const reposition = () => {
      const el = ref.current;
      if (!el) return;
      const offsetFromBottom = window.innerHeight - vv.height - (vv.offsetTop ?? 0);
      el.style.transform = offsetFromBottom > 100 ? `translateY(-${offsetFromBottom}px)` : "translateY(0)";
    };
    vv.addEventListener("resize", reposition);
    reposition();
    return () => { vv.removeEventListener("resize", reposition); };
  }, [ref]);
}

function ZoneTab({ zone, active }: { zone: Zone; active: boolean }) {
  const Icon = zone.icon;
  const color = active ? zone.accent : "var(--mt)";
  return (
    <Link href={zone.href} className="flex flex-col items-center gap-[3px] flex-1 min-w-0">
      <Icon size={20} strokeWidth={active ? 2.5 : 1.75} style={{ color }} />
      <span
        className="ta-nav-label"
        style={{ color, fontFamily: "var(--font-zone-body)" }}
      >
        {zone.label}
      </span>
      <div style={{ width: 20, height: 2, borderRadius: 1, background: active ? color : "transparent" }} />
    </Link>
  );
}

// Bottom-sheet listing zones as cards — reused by Hybrid's "More" button and
// Hub's "Explore Zones" pill (zone_design/README.md modal spec: bottom sheet
// for a single-decision picker).
function ZoneSheet({ zones, open, onClose }: { zones: Zone[]; open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col justify-end"
      style={{ zIndex: 9998, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className={zoneFontVars}
        style={{ background: "var(--nv)", border: "1px solid var(--br)", boxShadow: "0 -8px 40px var(--shad)", borderRadius: "24px 24px 0 0" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--mt)" }} />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b" style={{ borderColor: "var(--dv)" }}>
          <span style={{ fontFamily: "var(--font-zone-display)", fontSize: 16, fontWeight: 700, textTransform: "uppercase", color: "var(--tx)" }}>
            Explore zones
          </span>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl" style={{ background: "var(--ip)", color: "var(--mt)" }}>
            <X size={15} />
          </button>
        </div>
        <div className="px-3 py-2">
          {zones.map((zone) => {
            const active = isZoneActive(zone, pathname);
            const Icon = zone.icon;
            return (
              <Link
                key={zone.key}
                href={zone.href}
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors"
                style={active
                  ? { background: `color-mix(in srgb, ${zone.accent} 12%, transparent)`, color: zone.accent }
                  : { color: "var(--t2)" }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75} style={{ color: active ? zone.accent : "var(--t2)" }} />
                <span style={{ fontFamily: "var(--font-zone-body)", fontWeight: 700, fontSize: 14 }}>{zone.label}</span>
              </Link>
            );
          })}
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 12px)", minHeight: 12 }} />
      </div>
    </div>,
    document.body
  );
}

function SwitcherBar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  useKeyboardAvoidance(navRef);

  return (
    <nav
      ref={navRef}
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t ${zoneFontVars}`}
      style={{ background: "var(--nv)", borderColor: "var(--br)", willChange: "transform" }}
    >
      <div className="flex items-center justify-around px-1" style={{ height: 78, paddingTop: 10, paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
        {ZONES.map((zone) => (
          <ZoneTab key={zone.key} zone={zone} active={isZoneActive(zone, pathname)} />
        ))}
      </div>
    </nav>
  );
}

function HybridBar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  useKeyboardAvoidance(navRef);
  const [moreOpen, setMoreOpen] = useState(false);
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  const pinned = ZONES.filter(z => z.key === "home" || z.key === "social" || z.key === "game");
  const overflow = ZONES.filter(z => z.key === "news" || z.key === "stats");
  const overflowActive = overflow.some(z => isZoneActive(z, pathname));

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t ${zoneFontVars}`}
        style={{ background: "var(--nv)", borderColor: "var(--br)", willChange: "transform" }}
      >
        <div className="flex items-center justify-around px-1" style={{ height: 78, paddingTop: 10, paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
          {pinned.map((zone) => (
            <ZoneTab key={zone.key} zone={zone} active={isZoneActive(zone, pathname)} />
          ))}
          <button onClick={() => setMoreOpen(o => !o)} className="flex flex-col items-center gap-[3px] min-w-0 flex-1">
            <Compass size={20} strokeWidth={(moreOpen || overflowActive) ? 2.5 : 1.75} style={{ color: (moreOpen || overflowActive) ? "var(--tx)" : "var(--mt)" }} />
            <span className="ta-nav-label" style={{ color: (moreOpen || overflowActive) ? "var(--tx)" : "var(--mt)", fontFamily: "var(--font-zone-body)" }}>More</span>
            <div style={{ width: 20, height: 2, borderRadius: 1, background: (overflowActive && !moreOpen) ? "var(--tx)" : "transparent" }} />
          </button>
        </div>
      </nav>
      <ZoneSheet zones={overflow} open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}

function HubPill() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed z-40 lg:hidden flex items-center gap-2 ${zoneFontVars}`}
        style={{
          bottom: "max(20px, env(safe-area-inset-bottom))",
          right: 20,
          padding: "12px 20px",
          borderRadius: 999,
          background: "var(--nv)",
          border: "1px solid var(--br)",
          boxShadow: "0 4px 20px var(--shad)",
          color: "var(--tx)",
          fontFamily: "var(--font-zone-body)",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        <Compass size={16} />
        Explore zones →
      </button>
      <ZoneSheet zones={ZONES} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function ZoneNav() {
  const { navMode } = useNavMode();
  if (navMode === "hub") return <HubPill />;
  if (navMode === "hybrid") return <HybridBar />;
  return <SwitcherBar />;
}
