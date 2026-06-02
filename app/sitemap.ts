import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cupclash.live";
  const now = new Date();

  return [
    { url: base,                        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/schedule`,          lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/about`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/how-it-works`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`,           lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`,           lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/terms`,             lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];
}
