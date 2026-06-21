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
        transform: `translateY(${visible ? 0 : 6}px)`,
        // Transition only when showing — hide is instant so there's no ghost of the old page
        transition: visible ? "opacity 110ms ease-out, transform 110ms ease-out" : "none",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
