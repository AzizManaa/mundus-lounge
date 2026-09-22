import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MenuBrowser } from "../../components/menu-browser";
import { SiteFooter } from "../../components/site-footer";
import { siteUrl } from "../../data/mundus-business";
import { getMenu } from "../../data/mundus-menu";

export const metadata: Metadata = {
  ...(siteUrl ? { alternates: { canonical: "/menu" } } : {}),
  description: "Explore the current Mundus Lounge menu: shisha, cocktails, spirits, food, coffee, tea, desserts, beer, wine, and more.",
  openGraph: {
    description: "Explore the current Mundus Lounge menu: shisha, cocktails, spirits, food, coffee, tea, desserts, beer, wine, and more.",
    title: "Menu | Mundus Lounge",
  },
  title: "Menu",
  twitter: {
    description: "Explore the current Mundus Lounge menu: shisha, cocktails, spirits, food, coffee, tea, desserts, beer, wine, and more.",
    title: "Menu | Mundus Lounge",
  },
};

export default async function MenuPage() {
  const menu = await getMenu();

  return (
    <>
      <main id="top">
        <header className="border-b border-ivory/10 bg-onyx py-6">
          <div className="mundus-container flex items-center justify-between gap-6">
            <Link
              aria-label="Back to Mundus Lounge homepage"
              className="inline-flex size-11 items-center justify-center"
              href="/"
            >
              <Image
                alt=""
                className="size-9"
                height={36}
                src="/brand/mundus-mark.svg"
                unoptimized
                width={36}
              />
            </Link>
            <Link className="mundus-button mundus-button--outline" href="/">
              Back to homepage
            </Link>
          </div>
        </header>

        <MenuBrowser categories={menu.categories} currency={menu.currency} />
      </main>
      <SiteFooter />
    </>
  );
}
