import type { Metadata } from "next";
import { ReviewShortcut } from "../../../components/review-shortcut";
import { business, getLocalBusinessSchema, siteUrl } from "../../../data/mundus-business";
import { isLocale, locales } from "../../../i18n";
import { bricolage, italianno } from "../../../lib/fonts";
import { getLocalizedBusinessDescription } from "../../../lib/metadata";
import "../../globals.css";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  applicationName: business.name,
  title: {
    default: business.name,
    template: "%s | Mundus Lounge",
  },
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const requestedLocale = (await params).locale;
  const locale = isLocale(requestedLocale) ? requestedLocale : null;
  const schema = locale
    ? getLocalBusinessSchema(getLocalizedBusinessDescription(locale), locale)
    : null;

  return (
    <html className={`${bricolage.variable} ${italianno.variable}`} lang={locale ?? "es"}>
      <body>
        {children}
        {locale && <ReviewShortcut locale={locale} />}
        {schema && (
          <script
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
            }}
            type="application/ld+json"
          />
        )}
      </body>
    </html>
  );
}
