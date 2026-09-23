import type { Metadata } from "next";
import { getMessages, type Locale } from "../i18n";
import { business, siteUrl } from "../data/mundus-business";

const siteDescriptions: Record<Locale, string> = {
  es: "Un lounge relajado en Barcelona para disfrutar de shisha personalizada, cócteles, café, té y comida informal cerca de la Sagrada Família.",
  en: "A relaxed Barcelona lounge for personalised shisha, cocktails, coffee, tea, and casual food near Sagrada Família.",
};

export function getPageMetadata(locale: Locale, page: "home" | "menu"): Metadata {
  const messages = getMessages(locale);
  const description = page === "home" ? siteDescriptions[locale] : messages.menu.description;
  const pageTitle =
    page === "home"
      ? locale === "es"
        ? "Shisha Bar en el Eixample, Barcelona"
        : "Shisha Bar in Eixample, Barcelona"
      : messages.menu.title;
  const title = `${pageTitle} | Mundus Lounge`;
  const path = page === "home" ? `/${locale}` : `/${locale}/menu`;
  const alternatePaths = {
    en: "/en" + (page === "menu" ? "/menu" : ""),
    es: "/es" + (page === "menu" ? "/menu" : ""),
  };

  return {
    ...(siteUrl
      ? {
          alternates: {
            canonical: path,
            languages: alternatePaths,
          },
        }
      : {}),
    description,
    openGraph: {
      alternateLocale: locale === "es" ? ["en_ES"] : ["es_ES"],
      description,
      locale: locale === "es" ? "es_ES" : "en_ES",
      ...(siteUrl
        ? {
            images: [{
              alt: "Mundus Lounge shisha",
              height: 900,
              url: "/images/mundus-shisha-hero.jpg",
              width: 1600,
            }],
            url: path,
          }
        : {}),
      siteName: business.name,
      title,
      type: "website",
    },
    title: pageTitle,
    twitter: {
      card: "summary",
      description,
      ...(siteUrl ? { images: ["/images/mundus-shisha-hero.jpg"] } : {}),
      title,
    },
  };
}

export function getLocalizedBusinessDescription(locale: Locale) {
  return siteDescriptions[locale];
}
