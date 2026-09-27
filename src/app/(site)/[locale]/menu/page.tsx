import Image from "next/image";
import Link from "next/link";
import { MenuBrowser } from "../../../../components/menu-browser";
import { MenuLanguageSwitcher } from "../../../../components/menu-language-switcher";
import { SiteFooter } from "../../../../components/site-footer";
import { getMenu } from "../../../../data/mundus-menu";
import { getMenuMessages, homeLocaleFor } from "../../../../i18n/menu";
import { requireMenuLocale } from "../../../../lib/locale";
import { getMenuMetadata } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return getMenuMetadata(requireMenuLocale((await params).locale));
}

export default async function LocalizedMenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = requireMenuLocale((await params).locale);
  const menu = await getMenu(locale);
  const messages = getMenuMessages(locale);
  const homeLocale = homeLocaleFor(locale);

  return (
    <>
      <main id="top">
        <header className="border-b border-cream/10 bg-onyx py-6">
          <div className="mundus-container flex items-center justify-between gap-4">
            <Link
              aria-label={messages.backHome}
              className="inline-flex size-11 items-center justify-center"
              href={`/${homeLocale}`}
            >
              <Image alt="" className="size-9" height={36} src="/brand/mundus-mark.svg" unoptimized width={36} />
            </Link>
            <div className="flex items-center gap-4 sm:gap-6">
              <MenuLanguageSwitcher label={messages.language} locale={locale} />
              <Link className="mundus-button mundus-button--outline" href={`/${homeLocale}`}>
                {messages.backHome}
              </Link>
            </div>
          </div>
        </header>

        {menu.categories.length > 0 ? (
          <MenuBrowser
            categories={menu.categories}
            currency={menu.currency}
            locale={locale}
            messages={messages.menu}
          />
        ) : (
          <p className="mundus-container py-24 text-center text-cream/70">
            {messages.menu.empty}
          </p>
        )}
      </main>
      <SiteFooter locale={homeLocale} copy={messages} />
    </>
  );
}
