import type { Metadata } from "next";
import { locales, type Locale } from "../i18n";
import { business, siteUrl } from "../data/mundus-business";
import { getMenuMessages, homeLocaleFor, menuLocales, type MenuLocale } from "../i18n/menu";

const siteDescriptions: Record<Locale, string> = {
  es: "Un lounge relajado en Barcelona para disfrutar de shisha personalizada, cócteles, café, té y comida informal cerca de la Sagrada Família.",
  en: "A relaxed Barcelona lounge for personalised shisha, cocktails, coffee, tea, and casual food near Sagrada Família.",
};

export function getPageMetadata(locale: Locale, page: "home" | "menu"): Metadata {
  return localizedMetadata(locale, page);
}

export function getMenuMetadata(locale: MenuLocale): Metadata {
  return localizedMetadata(locale, "menu");
}

const openGraphLocales: Record<MenuLocale, string> = {
  es: "es_ES", en: "en_GB", ca: "ca_ES", fr: "fr_FR", ru: "ru_RU",
};

function localizedMetadata(locale: MenuLocale, page: "home" | "menu"): Metadata {
  const messages = getMenuMessages(locale);
  const description = page === "home" ? siteDescriptions[homeLocaleFor(locale)] : messages.menu.description;
  const pageTitle =
    page === "home"
      ? locale === "es"
        ? "Shisha Bar en el Eixample, Barcelona"
        : "Shisha Bar in Eixample, Barcelona"
      : messages.menu.title;
  const title = `${pageTitle} | Mundus Lounge`;
  const path = page === "home" ? `/${locale}` : `/${locale}/menu`;
  const pageLocales = page === "menu" ? menuLocales : locales;
  const alternatePaths = Object.fromEntries(pageLocales.map((language) => [language, `/${language}${page === "menu" ? "/menu" : ""}`]));

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
      alternateLocale: pageLocales.filter((language) => language !== locale).map((language) => openGraphLocales[language]),
      description,
      locale: openGraphLocales[locale],
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
