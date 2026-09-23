import Image from "next/image";
import Link from "next/link";
import { MenuBrowser } from "../../../../components/menu-browser";
import { LocaleSwitcher } from "../../../../components/locale-switcher";
import { SiteFooter } from "../../../../components/site-footer";
import { getMenu } from "../../../../data/mundus-menu";
import { getMessages } from "../../../../i18n";
import { requireLocale } from "../../../../lib/locale";
import { getPageMetadata } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return getPageMetadata(requireLocale((await params).locale), "menu");
}

export default async function LocalizedMenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = requireLocale((await params).locale);
  const menu = await getMenu(locale);
  const messages = getMessages(locale);

  return (
    <>
      <main id="top">
        <header className="border-b border-ivory/10 bg-onyx py-6">
          <div className="mundus-container flex items-center justify-between gap-4">
            <Link
              aria-label={messages.navigation.backHome}
              className="inline-flex size-11 items-center justify-center"
              href={`/${locale}`}
            >
              <Image alt="" className="size-9" height={36} src="/brand/mundus-mark.svg" unoptimized width={36} />
            </Link>
            <div className="flex items-center gap-4 sm:gap-6">
              <LocaleSwitcher label={messages.navigation.language} locale={locale} path="/menu" />
              <Link className="mundus-button mundus-button--outline" href={`/${locale}`}>
                {messages.navigation.backHome}
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
          <p className="mundus-container py-24 text-center text-ivory/70">
            {messages.menu.empty}
          </p>
        )}
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
