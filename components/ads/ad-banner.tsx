"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface AdBannerProps {
  isAdFree: boolean;
  isCorporate: boolean;
}

const ENABLED = process.env.NEXT_PUBLIC_ADSTERRA_ENABLED === "true";

function AdBannerInner({ isAdFree, isCorporate }: AdBannerProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  // Unfilled slots (blocked, no inventory, etc.) collapse to a minimal strip
  // instead of always reserving the full ad-creative footprint — only grow
  // once the network actually injects a creative into the container.
  const [filled, setFilled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!ENABLED || isAdFree || isCorporate || isMobile === null || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";
    setFilled(false);

    const adKey = isMobile
      ? "e7dac21808e8fea6ad1628edbcdb0f12"
      : "57581e9e0d27e8594e8853097933815b";
    const w = isMobile ? 300 : 728;
    const h = isMobile ? 250 : 90;

    const s1 = document.createElement("script");
    s1.innerHTML = `atOptions={'key':'${adKey}','format':'iframe','height':${h},'width':${w},'params':{}};`;
    const s2 = document.createElement("script");
    s2.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
    s2.async = true;
    container.appendChild(s1);
    container.appendChild(s2);

    const observer = new MutationObserver(() => {
      if (container.querySelector("iframe")) setFilled(true);
    });
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      container.innerHTML = "";
    };
  }, [isMobile, isAdFree, isCorporate]);

  if (!ENABLED || isAdFree || isCorporate || isMobile === null) return null;

  const w = isMobile ? 300 : 728;
  const h = isMobile ? 250 : 90;

  return (
    <div className="flex justify-center w-full py-1.5">
      <div
        className="flex flex-col items-center overflow-hidden"
        style={{
          gap: filled ? 4 : 0,
          padding: filled ? 6 : 4,
          background: "var(--ip)",
          border: "1px dashed var(--br)",
          borderRadius: 8,
          transition: "padding 0.2s ease",
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontWeight: 500,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "var(--ft)",
            opacity: 0.7,
          }}
        >
          Sponsored
        </span>
        <div
          ref={containerRef}
          style={{
            width: filled ? w : Math.min(w, 120),
            height: filled ? h : 1,
            transition: "width 0.2s ease, height 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}

export function AdBanner(props: AdBannerProps) {
  const pathname = usePathname();
  return <AdBannerInner key={pathname} {...props} />;
}
