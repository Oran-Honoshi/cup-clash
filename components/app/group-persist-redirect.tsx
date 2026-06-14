"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadSelectedGroup } from "@/lib/group-storage";

interface Props {
  groups:   Array<{ id: string }>;
  basePath: string;
}

export function GroupPersistRedirect({ groups, basePath }: Props) {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("group")) return;

    const saved = loadSelectedGroup();
    if (!saved) return;

    const match = groups.find(g => g.id === saved);
    if (!match) return;

    router.replace(`${basePath}?group=${match.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
