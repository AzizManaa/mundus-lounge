import type { MetadataRoute } from "next";
import { siteUrl } from "../data/mundus-business";
import { locales } from "../i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl;

  if (!baseUrl) {
    return [];
  }

  return ["", "/menu"].flatMap((path) => {
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`]),
    );

    return locales.map((locale) => ({
      alternates: { languages },
      url: `${baseUrl}/${locale}${path}`,
    }));
  });
}
