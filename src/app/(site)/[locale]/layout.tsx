import type { Metadata } from "next";
import { ReviewShortcut } from "../../../components/review-shortcut";
import { business, getLocalBusinessSchema, siteUrl } from "../../../data/mundus-business";
import { locales } from "../../../i18n";
import { bricolage, italianno } from "../../../lib/fonts";
import { getLocalizedBusinessDescription } from "../../../lib/metadata";
import { requireLocale } from "../../../lib/locale";
import "../../globals.css";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  applicationName: business.name,
  robots: {
    follow: true,
    googleBot: { follow: true, index: true },
    index: true,
  },
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
  const locale = requireLocale((await params).locale);
  const schema = getLocalBusinessSchema(getLocalizedBusinessDescription(locale), locale);

  return (
    <html className={`${bricolage.variable} ${italianno.variable}`} lang={locale}>
      <body>
        {children}
        <ReviewShortcut locale={locale} />
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
