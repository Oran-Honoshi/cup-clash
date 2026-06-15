"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { saveSelectedGroup, loadSelectedGroup } from "@/lib/group-storage";

interface GroupContextValue {
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string) => void;
}

const GroupContext = createContext<GroupContextValue>({
  selectedGroupId: null,
  setSelectedGroupId: () => {},
});

export function GroupProvider({ children }: { children: ReactNode }) {
  const [selectedGroupId, setSelectedGroupIdState] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadSelectedGroup();
    if (saved) setSelectedGroupIdState(saved);
  }, []);

  const setSelectedGroupId = useCallback((id: string) => {
    setSelectedGroupIdState(id);
    saveSelectedGroup(id);
  }, []);

  return (
    <GroupContext.Provider value={{ selectedGroupId, setSelectedGroupId }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroupContext() {
  return useContext(GroupContext);
}
