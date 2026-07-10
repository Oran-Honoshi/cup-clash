"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    prevPath.current = pathname;
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        opacity: visible ? 1 : 0,
        // No transform here on purpose: a transform (even translateY(0)) or
        // `will-change: transform` makes this div a containing block for
        // `position: fixed` descendants, trapping any modal rendered inside
        // a page instead of letting it cover the viewport.
        // Transition only when showing — hide is instant so there's no ghost of the old page
        transition: visible ? "opacity 110ms ease-out" : "none",
        willChange: "opacity",
      }}
    >
      {children}
    </div>
  );
}
