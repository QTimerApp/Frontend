import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://qtimer.pancake.wtf";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/settings`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/stats`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/profile`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/social`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];
}
