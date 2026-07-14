"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

// Three nav-model options carried over from the Zones design handoff — see
// zone_design/README.md "Navigation model". Switcher ships as the default;
// Hub/Hybrid stay reachable via Settings for testing, not removed.
export type NavMode = "switcher" | "hub" | "hybrid";
const VALID_MODES: NavMode[] = ["switcher", "hub", "hybrid"];
const STORAGE_KEY = "cupclash_nav_mode";

interface NavModeContextValue {
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
}

const NavModeContext = createContext<NavModeContextValue | null>(null);

function getInitialNavMode(): NavMode {
  if (typeof window === "undefined") return "switcher";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as NavMode | null;
    if (saved && VALID_MODES.includes(saved)) return saved;
  } catch {}
  return "switcher";
}

export function NavModeProvider({ children }: { children: ReactNode }) {
  const [navMode, setNavModeState] = useState<NavMode>(getInitialNavMode);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, navMode); } catch {}
  }, [navMode]);

  const setNavMode = useCallback((mode: NavMode) => {
    if (VALID_MODES.includes(mode)) setNavModeState(mode);
  }, []);

  return (
    <NavModeContext.Provider value={{ navMode, setNavMode }}>
      {children}
    </NavModeContext.Provider>
  );
}

export function useNavMode() {
  const ctx = useContext(NavModeContext);
  if (!ctx) throw new Error("useNavMode must be used within NavModeProvider");
  return ctx;
}
