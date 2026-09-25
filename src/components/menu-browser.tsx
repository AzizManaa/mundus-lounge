"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Locale, MenuMessages } from "../i18n";
import type { MenuCategory, MenuItem, MenuSubcategory } from "../data/mundus-menu";
import shishaImage from "../../public/images/mundus-menu-shisha.webp";
import drinksImage from "../../public/images/mundus-moment-cocktail.webp";
import foodImage from "../../public/images/mundus-menu-food.webp";

type ChapterId = keyof MenuMessages["chapters"];

const chapters = [
  { id: "ritual", image: shishaImage },
  { id: "bar", image: drinksImage },
  { id: "table", image: foodImage },
] as const;

const categoryChapters: Record<string, ChapterId> = {
  "SHISHA EXPERIENCE": "ritual",
  COCTELES: "bar",
  COCKTAILS: "bar",
  COMBINADOS: "bar",
  COMBINED: "bar",
  CERVEZAS: "bar",
  BEERS: "bar",
  VINOS: "bar",
  WINES: "bar",
  "BATIDOS & ZUMOS": "bar",
  "SMOOTHIES & JUICES": "bar",
  REFRESCOS: "bar",
  "SOFT DRINKS": "bar",
  FOOD: "table",
  "CAFES & TES": "table",
  "COFFEES & TEAS": "table",
  POSTRES: "table",
  DESSERTS: "table",
};

function chapterForCategory(name: string): ChapterId | null {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
  return categoryChapters[normalized] ?? null;
}

function formatPrice(
  price: number | null | undefined,
  currency: string,
  locale: Locale,
) {
  if (price == null) {
    return null;
  }

  return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-ES", {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(price);
}

function MenuItemRow({
  item,
  currency,
  locale,
  priceLabels,
}: {
  item: MenuItem;
  currency: string;
  locale: Locale;
  priceLabels: { bottle: string; shot: string };
}) {
  return (
    <li className="night-atlas__item border-b border-cream/10 py-4 last:border-b-0 sm:py-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 sm:gap-4">
        <h4 className="font-display text-base font-medium leading-snug text-cream sm:text-lg">
          {item.name}
        </h4>
        {item.price !== undefined && (
          <span className="shrink-0 border border-honey/30 px-2 py-1 text-xs font-bold tabular-nums text-honey sm:border-0 sm:p-0 sm:text-sm">
            {formatPrice(item.price, currency, locale)}
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-1.5 text-sm leading-5 text-cream/60 sm:leading-6">
          {item.description}
        </p>
      )}
      {(item.bottle_price != null || item.shot_price != null) && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium tracking-[0.08em] text-cream/45">
          {item.bottle_price != null && (
            <span>{priceLabels.bottle} {formatPrice(item.bottle_price, currency, locale)}</span>
          )}
          {item.shot_price != null && (
            <span>{priceLabels.shot} {formatPrice(item.shot_price, currency, locale)}</span>
          )}
        </div>
      )}
    </li>
  );
}

function MenuGroup({
  category,
  currency,
  locale,
  priceLabels,
}: {
  category: MenuSubcategory;
  currency: string;
  locale: Locale;
  priceLabels: { bottle: string; shot: string };
}) {
  return (
    <article className="border border-cream/15 bg-onyx/35 p-6 sm:p-8">
      <h3 className="font-display text-2xl font-medium tracking-[-0.03em] text-cream sm:text-3xl">
        {category.name}
      </h3>
      {category.description && (
        <p className="mt-2 text-sm italic text-cream/55">{category.description}</p>
      )}
      {category.modifier && (
        <p className="mt-3 text-xs font-bold tracking-[0.1em] text-honey">
          {category.modifier}
        </p>
      )}
      <ul className="mt-5">
        {category.items.map((item) => (
          <MenuItemRow currency={currency} item={item} key={item.name} locale={locale} priceLabels={priceLabels} />
        ))}
      </ul>
    </article>
  );
}

function MobileMenuGroup({
  category,
  currency,
  defaultOpen,
  locale,
  priceLabels,
}: {
  category: MenuSubcategory;
  currency: string;
  defaultOpen: boolean;
  locale: Locale;
  priceLabels: { bottle: string; shot: string };
}) {
  return (
    <details
      className="group border border-cream/15 bg-onyx/35"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 marker:content-none">
        <div>
          <h3 className="font-display text-2xl font-medium tracking-[-0.03em] text-cream">
            {category.name}
          </h3>
        </div>
        <span
          aria-hidden="true"
          className="text-2xl leading-none text-honey transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="border-t border-cream/10 px-6 pb-6">
        {category.description && (
          <p className="mt-4 text-sm italic text-cream/55">{category.description}</p>
        )}
        {category.modifier && (
          <p className="mt-3 text-xs font-bold tracking-[0.1em] text-honey">
            {category.modifier}
          </p>
        )}
        <ul className="mt-5">
          {category.items.map((item) => (
            <MenuItemRow currency={currency} item={item} key={item.name} locale={locale} priceLabels={priceLabels} />
          ))}
        </ul>
      </div>
    </details>
  );
}

export function MenuBrowser({
  categories,
  currency,
  locale,
  messages,
}: {
  categories: MenuCategory[];
  currency: string;
  locale: Locale;
  messages: MenuMessages;
}) {
  const categoryLabels = messages.categoryLabels;
  const initialCategory = categories.find((category) => chapterForCategory(category.name) === "ritual") ?? categories[0];
  const [activeCategoryName, setActiveCategoryName] = useState(initialCategory.name);
  const [linkFeedback, setLinkFeedback] = useState("");
  const categoryDialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const hasSyncedInitialUrl = useRef(false);
  const activeCategory =
    categories.find((category) => category.name === activeCategoryName) ?? categories[0];
  const activeChapter = chapterForCategory(activeCategory.name);
  const singleGroup = activeCategory.items
    ? { items: activeCategory.items, name: activeCategory.name }
    : null;
  const groups = activeCategory.subcategories ?? (singleGroup ? [singleGroup] : []);
  const chapterCategories = chapters
    .map((chapter) => ({
      ...chapter,
      categories: categories.filter((category) => chapterForCategory(category.name) === chapter.id),
    }))
    .filter((chapter) => chapter.categories.length > 0);
  const otherCategories = categories.filter((category) => chapterForCategory(category.name) === null);

  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const requestedCategory = params.get("category");
      const requestedChapter = params.get("chapter");
      const category =
        categories.find((entry) => entry.name === requestedCategory) ??
        categories.find((entry) => chapterForCategory(entry.name) === requestedChapter);
      setActiveCategoryName(category?.name ?? initialCategory.name);
      setLinkFeedback("");
      if (category && !hasSyncedInitialUrl.current) {
        requestAnimationFrame(() => panelRef.current?.scrollIntoView({ block: "start" }));
      }
      hasSyncedInitialUrl.current = true;
    }

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [categories, initialCategory.name]);

  function selectCategory(name: string, scrollToMenu = false) {
    setActiveCategoryName(name);
    setLinkFeedback("");
    const url = new URL(window.location.href);
    url.searchParams.delete("chapter");
    url.searchParams.set("category", name);
    window.history.pushState(null, "", url);
    if (scrollToMenu) {
      requestAnimationFrame(() => {
        panelHeadingRef.current?.focus({ preventScroll: true });
        panelRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  }

  async function copyCategoryLink() {
    const url = new URL(window.location.href);
    url.searchParams.delete("chapter");
    url.searchParams.set("category", activeCategory.name);
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkFeedback(messages.linkCopied);
    } catch {
      setLinkFeedback(messages.copyLinkFailed);
    }
  }

  function renderCategoryChoice(category: MenuCategory) {
    return (
      <button
        aria-current={activeCategory.name === category.name ? "true" : undefined}
        className="night-atlas__sheet-category"
        key={category.name}
        onClick={() => {
          categoryDialogRef.current?.close();
          selectCategory(category.name, true);
        }}
        type="button"
      >
        <span>{categoryLabels[category.name] ?? category.name}</span>
        <span aria-hidden="true" className="night-atlas__sheet-category-mark">
          {activeCategory.name === category.name ? "●" : "↗"}
        </span>
      </button>
    );
  }

  return (
    <section aria-labelledby="menu-heading" className="night-atlas pb-24 pt-10 sm:pb-32 sm:pt-16">
      <div className="mundus-container">
        <header className="night-atlas__intro">
          <div>
            <p className="mundus-eyebrow mb-5">{messages.eyebrow}</p>
            <h1 className="font-display text-5xl font-[200] leading-[0.98] tracking-[-0.055em] text-cream sm:text-6xl lg:text-7xl" id="menu-heading">
              {messages.heading}
            </h1>
          </div>
          <p className="night-atlas__description">{messages.description}</p>
        </header>

        <div className="night-atlas__mobile-nav sticky top-2 z-20 py-2 sm:hidden">
          <button
            aria-controls="menu-category-dialog"
            aria-haspopup="dialog"
            className="night-atlas__mobile-trigger"
            onClick={() => categoryDialogRef.current?.showModal()}
            type="button"
          >
            <span className="night-atlas__mobile-trigger-top">
              <span><span aria-hidden="true">✳</span> {messages.browseCategories}</span>
            </span>
            <span className="night-atlas__mobile-trigger-bottom">
              <span>{categoryLabels[activeCategory.name] ?? activeCategory.name}</span>
              <span aria-hidden="true">⌄</span>
            </span>
          </button>

          <dialog
            aria-labelledby="menu-category-dialog-title"
            className="night-atlas__sheet"
            id="menu-category-dialog"
            onClick={(event) => {
              if (event.target === categoryDialogRef.current) categoryDialogRef.current?.close();
            }}
            ref={categoryDialogRef}
          >
            <div className="night-atlas__sheet-inner">
              <div className="night-atlas__sheet-header">
                <div>
                  <p className="night-atlas__panel-kicker">{messages.browseCategories}</p>
                  <h2 className="font-display text-3xl font-[300] tracking-[-0.04em] text-cream" id="menu-category-dialog-title">
                    {messages.categoryList}
                  </h2>
                </div>
                <button aria-label={messages.closeCategories} className="night-atlas__sheet-close" onClick={() => categoryDialogRef.current?.close()} type="button">×</button>
              </div>
              <div className="night-atlas__sheet-sections">
                {chapterCategories.map((chapter) => (
                  <section aria-labelledby={`sheet-chapter-${chapter.id}`} className="night-atlas__sheet-section" key={chapter.id}>
                    <h3 className="night-atlas__sheet-section-heading" id={`sheet-chapter-${chapter.id}`}>
                      {messages.chapters[chapter.id].title}
                    </h3>
                    {chapter.categories.map(renderCategoryChoice)}
                  </section>
                ))}
                {otherCategories.length > 0 && (
                  <section aria-labelledby="sheet-chapter-other" className="night-atlas__sheet-section">
                    <h3 className="night-atlas__sheet-section-heading" id="sheet-chapter-other">{messages.otherCategories}</h3>
                    {otherCategories.map(renderCategoryChoice)}
                  </section>
                )}
              </div>
            </div>
          </dialog>
        </div>

        <div className="night-atlas__chapters" role="group" aria-label={messages.categoryList}>
          {chapters.map((chapter) => {
            const firstCategory = categories.find((category) => chapterForCategory(category.name) === chapter.id);
            if (!firstCategory) return null;

            return (
              <button
                aria-controls="menu-panel"
                aria-current={activeChapter === chapter.id ? "true" : undefined}
                className="night-atlas__chapter group"
                key={chapter.id}
                onClick={() => selectCategory(firstCategory.name, true)}
                type="button"
              >
                <Image alt="" className="night-atlas__chapter-image" fill placeholder="blur" preload={chapter.id === "ritual"} sizes="(min-width: 1024px) 32vw, (min-width: 640px) 33vw, 38vw" src={chapter.image} />
                <span aria-hidden="true" className="night-atlas__chapter-shade" />
                <span className="night-atlas__chapter-content">
                  <span className="night-atlas__chapter-title">{messages.chapters[chapter.id].title}</span>
                  <span className="night-atlas__chapter-description">{messages.chapters[chapter.id].description}</span>
                </span>
                <span aria-hidden="true" className="night-atlas__chapter-arrow">↗</span>
              </button>
            );
          })}
        </div>

        <nav aria-label={messages.categoryList} className="night-atlas__index hidden sm:block">
          <div className="night-atlas__index-heading">
            <span className="night-atlas__index-cross" aria-hidden="true">✳</span>
            <h2 className="font-display text-2xl font-[300] tracking-[-0.03em] text-cream">{messages.indexHeading}</h2>
          </div>
          <div className="night-atlas__category-grid">
            {categories.map((category) => (
              <button
                aria-controls="menu-panel"
                aria-current={activeCategory.name === category.name ? "true" : undefined}
                className="night-atlas__category"
                key={category.name}
                onClick={() => selectCategory(category.name, true)}
                type="button"
              >
                <span>{categoryLabels[category.name] ?? category.name}</span>
                <span aria-hidden="true" className="night-atlas__category-arrow">↗</span>
              </button>
            ))}
          </div>
        </nav>

        <div
          aria-labelledby="menu-panel-heading"
          className="night-atlas__panel mt-9 p-5 sm:mt-12 sm:p-10 lg:p-14"
          id="menu-panel"
          ref={panelRef}
          role="region"
        >
          <header className="night-atlas__panel-heading">
            <span className="night-atlas__panel-kicker">{activeChapter ? messages.chapters[activeChapter].title : messages.categoryList}</span>
            <div className="flex items-center gap-2">
              <span aria-live="polite" className="max-w-28 text-right text-xs leading-tight text-cream/65">{linkFeedback}</span>
              <button
                aria-label={messages.copyLink}
                className="inline-flex size-11 shrink-0 items-center justify-center border border-gold/45 text-gold transition-colors hover:border-gold hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-honey"
                onClick={copyCategoryLink}
                title={messages.copyLink}
                type="button"
              >
                <svg aria-hidden="true" fill="none" height="19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24" width="19">
                  <circle cx="18" cy="5" r="2" />
                  <circle cx="6" cy="12" r="2" />
                  <circle cx="18" cy="19" r="2" />
                  <path d="m8 11 8-5m-8 7 8 5" />
                </svg>
              </button>
            </div>
            <h2 className="font-display text-4xl font-[200] tracking-[-0.045em] text-cream sm:text-6xl" id="menu-panel-heading" ref={panelHeadingRef} tabIndex={-1}>
              {categoryLabels[activeCategory.name] ?? activeCategory.name}
            </h2>
          </header>

          <div className="night-atlas__panel-content" key={activeCategory.name}>
            {activeCategory.name === "SHISHA EXPERIENCE" && (
              <aside className="mt-6 border-l-2 border-honey bg-onyx/45 px-5 py-4 text-left sm:mt-8">
                <p className="text-sm font-semibold text-cream">
                  {messages.recommendation.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-cream/65">
                  {messages.recommendation.body}
                </p>
              </aside>
            )}

            <div className="mt-8 grid gap-4 sm:hidden">
              {groups.map((group, index) => (
                <MobileMenuGroup
                  category={group}
                  currency={currency}
                  defaultOpen={groups.length === 1 || index === 0}
                  key={`${activeCategory.name}-${group.name}`}
                  locale={locale}
                  priceLabels={messages}
                />
              ))}
            </div>

            <div className="mt-10 hidden gap-6 sm:grid lg:grid-cols-2">
              {groups.map((group) => (
                <MenuGroup category={group} currency={currency} key={group.name} locale={locale} priceLabels={messages} />
              ))}
            </div>
          </div>

          <button
            className="mt-8 w-full border border-cream/20 px-5 py-4 text-xs font-bold tracking-[0.12em] text-cream transition-colors hover:border-honey hover:text-honey sm:hidden"
            onClick={() => categoryDialogRef.current?.showModal()}
            type="button"
          >
            {messages.backToCategories}
          </button>
        </div>
      </div>
    </section>
  );
}
