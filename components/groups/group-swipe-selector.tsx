"use client";

import { useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useGroupContext } from "@/lib/contexts/group-context";
import { BallLoader } from "@/components/ui/BallLoader";
import { FlipCard } from "@/components/ui/flip-card";

interface GroupSwipeSelectorProps {
  groups: Array<{ id: string; name: string; passkey: string }>;
  activeGroupId: string;
  basePath: string;
}

// Left/right inset so the first/last tile is never flush against the
// screen edge, and the next tile visibly peeks in to signal scrollability.
const PEEK_PADDING = 20;

export function GroupSwipeSelector({ groups, activeGroupId, basePath }: GroupSwipeSelectorProps) {
  const { setSelectedGroupId, refreshPredictions } = useGroupContext();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef   = useRef<HTMLButtonElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSelect(id: string) {
    setSelectedGroupId(id);
    refreshPredictions(id);
    startTransition(() => {
      router.push(basePath + "?group=" + id);
    });
  }

  // Scroll active tile into view on mount and when activeGroupId changes
  useEffect(() => {
    const tile      = activeRef.current;
    const container = containerRef.current;
    if (!tile || !container) return;
    container.scrollTo({ left: tile.offsetLeft - PEEK_PADDING, behavior: "instant" });
  }, [activeGroupId]);

  return (
    <>
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
        padding: `6px ${PEEK_PADDING}px`,
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x",
        scrollPaddingLeft: PEEK_PADDING,
        scrollPaddingRight: PEEK_PADDING,
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
            aria-pressed={isActive}
            style={{
              // 60% min-width → ~1.5 tiles visible in the viewport at once
              minWidth: "calc(60% - 4px)",
              height: 44,
              flexShrink: 0,
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <FlipCard
              flipped={isActive}
              duration={340}
              front={<GroupTileFace name={group.name} active={false} />}
              back={<GroupTileFace name={group.name} active={true} />}
            />
          </button>
        );
      })}
    </div>
    {isPending && (
      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", backgroundColor: "#020804" }}>
        <BallLoader size="md" label={null} />
      </div>
    )}
    </>
  );
}

function GroupTileFace({ name, active }: { name: string; active: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
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
        background: active ? "#162a16" : "#0c1c0c",
        border: active ? "1px solid #00e5a0" : "1px solid #1a3a1a",
        color: active ? "#00e5a0" : "#3a7a3a",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {name}
    </div>
  );
}
