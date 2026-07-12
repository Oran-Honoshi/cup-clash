"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { saveSelectedGroup, loadSelectedGroup } from "@/lib/group-storage";
import { createClient } from "@/lib/supabase/client";

type PredCache = Record<string, { home: number; away: number }>;

interface GroupContextValue {
  selectedGroupId:     string | null;
  setSelectedGroupId:  (id: string) => void;
  predictions:         PredCache;
  setPrediction:       (matchId: string, home: number, away: number) => void;
  refreshPredictions:  (groupId: string, userId?: string) => Promise<void>;
  setActiveUserId:     (userId: string) => void;
}

const GroupContext = createContext<GroupContextValue>({
  selectedGroupId:    null,
  setSelectedGroupId: () => {},
  predictions:        {},
  setPrediction:      () => {},
  refreshPredictions: async () => {},
  setActiveUserId:    () => {},
});

export function GroupProvider({ children }: { children: ReactNode }) {
  const [selectedGroupId, setSelectedGroupIdState] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredCache>({});
  const activeUserIdRef = useRef<string | null>(null);
  // Guards against out-of-order responses: this cache is shared app-wide and
  // scoped only by matchId, not groupId, so if two refreshPredictions calls
  // for different groups overlap (e.g. a fast group switch), a slower older
  // request resolving after a newer one must not clobber it with stale data.
  const requestSeqRef = useRef(0);

  useEffect(() => {
    const saved = loadSelectedGroup();
    if (saved) setSelectedGroupIdState(saved);
  }, []);

  const setSelectedGroupId = useCallback((id: string) => {
    setSelectedGroupIdState(id);
    saveSelectedGroup(id);
  }, []);

  const setActiveUserId = useCallback((userId: string) => {
    activeUserIdRef.current = userId;
  }, []);

  const setPrediction = useCallback((matchId: string, home: number, away: number) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home, away } }));
  }, []);

  const refreshPredictions = useCallback(async (groupId: string, userId?: string) => {
    const uid = userId ?? activeUserIdRef.current;
    if (!uid) return;
    const seq = ++requestSeqRef.current;
    const { data } = await createClient()
      .from("group_predictions")
      .select("match_id, home_score, away_score")
      .eq("group_id", groupId)
      .eq("user_id", uid);
    if (seq !== requestSeqRef.current) return; // a newer request already superseded this one
    if (data) {
      const cache: PredCache = {};
      for (const row of data as { match_id: string; home_score: number; away_score: number }[]) {
        cache[row.match_id] = { home: row.home_score, away: row.away_score };
      }
      setPredictions(cache);
    }
  }, []);

  return (
    <GroupContext.Provider value={{
      selectedGroupId, setSelectedGroupId,
      predictions, setPrediction, refreshPredictions, setActiveUserId,
    }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroupContext() {
  return useContext(GroupContext);
}
