"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGroupContext } from "@/lib/contexts/group-context";

interface GroupSwipeSelectorProps {
  groups: Array<{ id: string; name: string; passkey: string }>;
  activeGroupId: string;
  basePath: string;
}

export function GroupSwipeSelector({ groups, activeGroupId, basePath }: GroupSwipeSelectorProps) {
  const { setSelectedGroupId } = useGroupContext();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef   = useRef<HTMLButtonElement>(null);

  function handleSelect(id: string) {
    setSelectedGroupId(id);
    router.push(basePath + "?group=" + id);
  }

  // Scroll active tile into view on mount and when activeGroupId changes
  useEffect(() => {
    const tile      = activeRef.current;
    const container = containerRef.current;
    if (!tile || !container) return;
    container.scrollTo({ left: tile.offsetLeft - 14, behavior: "instant" });
  }, [activeGroupId]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        width: "100%",
        backgroundColor: "#020804",
        borderBottom: "1px solid #0c1c0c",
        display: "flex",
        alignItems: "center",
        padding: "6px 14px",
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x",
        gap: 8,
      } as React.CSSProperties}
    >
      {groups.map(group => {
        const isActive = group.id === activeGroupId;
        return (
          <button
            key={group.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => handleSelect(group.id)}
            style={{
              // 60% min-width → ~1.5 tiles visible in the viewport at once
              minWidth: "calc(60% - 4px)",
              height: 44,
              flexShrink: 0,
              borderRadius: 10,
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-barlow, sans-serif)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              cursor: "pointer",
              background: isActive ? "#162a16" : "#0c1c0c",
              border: isActive ? "1px solid #00e5a0" : "1px solid #1a3a1a",
              color: isActive ? "#00e5a0" : "#3a7a3a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              transition: "all 0.15s",
            }}
          >
            {group.name}
          </button>
        );
      })}
    </div>
  );
}
