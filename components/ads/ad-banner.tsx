"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface AdBannerProps {
  isAdFree: boolean;
  isCorporate: boolean;
}

const ENABLED = process.env.NEXT_PUBLIC_ADSTERRA_ENABLED === "true";

// The ad network's loader script is untrusted third-party code. It must never
// run in our top-level page — a same-frame <script> can append elements
// directly to document.body (e.g. position:fixed full-viewport overlays),
// which no amount of CSS on our own container could ever clip, since those
// elements wouldn't be descendants of it. Loading it inside a sandboxed
// iframe instead means its DOM writes are confined to that iframe's own
// document, and the iframe element's on-page size is dictated solely by our
// CSS — content inside an iframe cannot resize the iframe element itself.
// No allow-same-origin (keeps the iframe's origin opaque, so it can't reach
// our page) and no allow-top-navigation (so it can't force-redirect us).
function buildAdSrcDoc(adKey: string, w: number, h: number) {
  return `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;}</style></head><body>
<script>atOptions={'key':'${adKey}','format':'iframe','height':${h},'width':${w},'params':{}};</script>
<script src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
<script>
var mo = new MutationObserver(function () {
  if (document.querySelector("iframe")) {
    parent.postMessage({ source: "cc-ad-banner", type: "filled" }, "*");
  }
});
mo.observe(document.body, { childList: true, subtree: true });
</script>
</body></html>`;
}

function AdBannerInner({ isAdFree, isCorporate }: AdBannerProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  // Unfilled slots (blocked, no inventory, etc.) collapse to a minimal strip
  // instead of always reserving the full ad-creative footprint — only grow
  // once the network actually injects a creative into the container.
  const [filled, setFilled] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!ENABLED || isAdFree || isCorporate || isMobile === null) return;

    setFilled(false);

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if ((event.data as { source?: string; type?: string } | null)?.source !== "cc-ad-banner") return;
      if ((event.data as { type?: string }).type === "filled") setFilled(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isMobile, isAdFree, isCorporate]);

  if (!ENABLED || isAdFree || isCorporate || isMobile === null) return null;

  const adKey = isMobile
    ? "e7dac21808e8fea6ad1628edbcdb0f12"
    : "57581e9e0d27e8594e8853097933815b";
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
          // Hard cap independent of `filled`/w/h — belt-and-suspenders even
          // if the state above is ever miscomputed.
          maxWidth: 728,
          maxHeight: 300,
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
        <iframe
          ref={iframeRef}
          key={`${adKey}-${w}-${h}`}
          title="Advertisement"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          srcDoc={buildAdSrcDoc(adKey, w, h)}
          style={{
            width: filled ? w : Math.min(w, 120),
            height: filled ? h : 1,
            maxWidth: w,
            maxHeight: h,
            border: 0,
            display: "block",
            overflow: "hidden",
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
