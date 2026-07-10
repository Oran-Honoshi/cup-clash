import Link from "next/link";
import { ChevronRight, Newspaper } from "lucide-react";
import { relativeTime } from "@/lib/relative-time";
import type { HeroArticle } from "@/lib/services/news";

interface NewsHeroSectionProps {
  article: HeroArticle | null;
}

export function NewsHeroSection({ article }: NewsHeroSectionProps) {
  if (!article) return null;

  return (
    <div
      className="-mx-4 sm:-mx-6 px-4 sm:px-6"
      style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 12, borderBottom: "1px solid var(--br)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="ta-section-label">News</div>
        <Link
          href="/news"
          className="flex items-center gap-0.5"
          style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, color: "var(--ac)", textDecoration: "none" }}
        >
          See all <ChevronRight size={12} />
        </Link>
      </div>

      <a
        href={article.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="cc-elevated cc-elevated-interactive flex items-center gap-3 rounded-xl"
        style={{ background: "var(--sf)", border: "1px solid var(--br)", textDecoration: "none", padding: 10 }}
      >
        <div
          className="shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
          style={{ width: 60, height: 60, background: "var(--ip)" }}
        >
          {article.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <Newspaper size={20} style={{ color: "var(--mt)" }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              style={{
                fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ac)",
              }}
            >
              {article.sourceName}
            </span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--ft)", whiteSpace: "nowrap" }}>
              {relativeTime(article.publishedAt)}
            </span>
          </div>
          <div
            className="line-clamp-2"
            style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: "var(--tx)", marginTop: 2, lineHeight: 1.3 }}
          >
            {article.title}
          </div>
        </div>
      </a>
    </div>
  );
}
