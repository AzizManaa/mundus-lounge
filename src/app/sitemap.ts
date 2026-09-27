import type { MetadataRoute } from "next";
import { siteUrl } from "../data/mundus-business";
import { locales } from "../i18n";
import { menuLocales } from "../i18n/menu";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl;

  if (!baseUrl) {
    return [];
  }

  return ["", "/menu"].flatMap((path) => {
    const pageLocales = path === "/menu" ? menuLocales : locales;
    const languages = Object.fromEntries(
      pageLocales.map((locale) => [locale, `${baseUrl}/${locale}${path}`]),
    );

    return pageLocales.map((locale) => ({
      alternates: { languages },
      url: `${baseUrl}/${locale}${path}`,
    }));
  });
}
