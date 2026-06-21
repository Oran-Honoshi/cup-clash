"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useGroupContext } from "@/lib/contexts/group-context";

interface GroupSwipeSelectorProps {
  groups: Array<{ id: string; name: string; passkey: string }>;
  activeGroupId: string;
  basePath: string; // e.g. "/dashboard", "/predictions", etc.
}

export function GroupSwipeSelector({ groups, activeGroupId, basePath }: GroupSwipeSelectorProps) {
  const { setSelectedGroupId } = useGroupContext();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  function handleSelect(id: string) {
    setSelectedGroupId(id);
    router.push(basePath + "?group=" + id);
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "sticky",
        zIndex: 20,
        width: "100%",
        backgroundColor: "#020804",
        borderBottom: "1px solid #0c1c0c",
        height: 42,
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
        touchAction: "pan-x",
        gap: 6,
        top: 0,
      } as React.CSSProperties}
    >
      {groups.map((group) => {
        const isActive = group.id === activeGroupId;
        const label = group.name.length > 18 ? group.name.slice(0, 18) : group.name;
        return (
          <button
            key={group.id}
            onClick={() => handleSelect(group.id)}
            style={{
              padding: "5px 13px",
              borderRadius: 20,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              flexShrink: 0,
              cursor: "pointer",
              background: isActive ? "#162a16" : "transparent",
              border: isActive ? "1px solid #00e5a0" : "1px solid #1a3a1a",
              color: isActive ? "#00e5a0" : "#3a7a3a",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
