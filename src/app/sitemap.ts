import type { MetadataRoute } from "next";
import { siteUrl } from "../data/mundus-business";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) {
    return [];
  }

  return [
    {
      changeFrequency: "weekly",
      priority: 1,
      url: siteUrl,
    },
    {
      changeFrequency: "weekly",
      priority: 0.8,
      url: `${siteUrl}/menu`,
    },
  ];
}
