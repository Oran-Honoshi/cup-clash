"use client";

import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  isAdFree: boolean;
  isCorporate: boolean;
}

const ENABLED = process.env.NEXT_PUBLIC_ADSTERRA_ENABLED === "true";

export function AdBanner({ isAdFree, isCorporate }: AdBannerProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
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

    const key = isMobile
      ? "e7dac21808e8fea6ad1628edbcdb0f12"
      : "57581e9e0d27e8594e8853097933815b";
    const w = isMobile ? 300 : 728;
    const h = isMobile ? 250 : 90;

    const s1 = document.createElement("script");
    s1.innerHTML = `atOptions={'key':'${key}','format':'iframe','height':${h},'width':${w},'params':{}};`;
    const s2 = document.createElement("script");
    s2.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
    s2.async = true;
    container.appendChild(s1);
    container.appendChild(s2);
  }, [isMobile, isAdFree, isCorporate]);

  if (!ENABLED || isAdFree || isCorporate || isMobile === null) return null;

  const w = isMobile ? 300 : 728;
  const h = isMobile ? 250 : 90;

  return (
    <div className="flex justify-center w-full overflow-hidden py-2">
      <div ref={containerRef} style={{ width: w, height: h }} />
    </div>
  );
}
