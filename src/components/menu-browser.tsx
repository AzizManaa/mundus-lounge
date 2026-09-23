"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Locale, MenuMessages } from "../i18n";
import type { MenuCategory, MenuItem, MenuSubcategory } from "../data/mundus-menu";
import shishaImage from "../../public/images/mundus-menu-shisha.png";
import drinksImage from "../../public/images/mundus-moment-cocktail.png";
import foodImage from "../../public/images/mundus-menu-food.png";

type ChapterId = keyof MenuMessages["chapters"];

const chapters = [
  { id: "ritual", image: shishaImage, number: "01" },
  { id: "bar", image: drinksImage, number: "02" },
  { id: "table", image: foodImage, number: "03" },
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
    <li className="border-b border-ivory/10 py-4 last:border-b-0 sm:py-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 sm:gap-4">
        <h4 className="font-display text-base font-medium leading-snug text-ivory sm:text-lg">
          {item.name}
        </h4>
        {item.price !== undefined && (
          <span className="shrink-0 border border-emerald/30 px-2 py-1 text-xs font-bold tabular-nums text-emerald sm:border-0 sm:p-0 sm:text-sm">
            {formatPrice(item.price, currency, locale)}
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-1.5 text-sm leading-5 text-ivory/60 sm:leading-6">
          {item.description}
        </p>
      )}
      {(item.bottle_price != null || item.shot_price != null) && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium tracking-[0.08em] text-ivory/45">
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
    <article className="border border-ivory/15 bg-onyx/35 p-6 sm:p-8">
      <h3 className="font-display text-2xl font-medium tracking-[-0.03em] text-ivory sm:text-3xl">
        {category.name}
      </h3>
      {category.description && (
        <p className="mt-2 text-sm italic text-ivory/55">{category.description}</p>
      )}
      {category.modifier && (
        <p className="mt-3 text-xs font-bold tracking-[0.1em] text-emerald">
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
  itemCount,
  locale,
  priceLabels,
}: {
  category: MenuSubcategory;
  currency: string;
  defaultOpen: boolean;
  itemCount: { one: string; other: string };
  locale: Locale;
  priceLabels: { bottle: string; shot: string };
}) {
  return (
    <details
      className="group border border-ivory/15 bg-onyx/35"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 marker:content-none">
        <div>
          <h3 className="font-display text-2xl font-medium tracking-[-0.03em] text-ivory">
            {category.name}
          </h3>
          <p className="mt-1 text-xs font-bold tracking-[0.1em] text-emerald">
            {category.items.length} {category.items.length === 1 ? itemCount.one : itemCount.other}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="text-2xl leading-none text-emerald transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="border-t border-ivory/10 px-6 pb-6">
        {category.description && (
          <p className="mt-4 text-sm italic text-ivory/55">{category.description}</p>
        )}
        {category.modifier && (
          <p className="mt-3 text-xs font-bold tracking-[0.1em] text-emerald">
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
  const categoryDialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
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

  function selectCategory(name: string, scrollToMenu = false) {
    setActiveCategoryName(name);
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

  function renderCategoryChoice(category: MenuCategory) {
    const index = categories.indexOf(category);

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
        <span className="night-atlas__category-number">{String(index + 1).padStart(2, "0")}</span>
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
            <h1 className="font-display text-5xl font-[200] leading-[0.98] tracking-[-0.055em] text-ivory sm:text-6xl lg:text-7xl" id="menu-heading">
              {messages.heading}
            </h1>
          </div>
          <p className="night-atlas__description">{messages.description}</p>
        </header>

        <div
          className="night-atlas__mobile-nav sticky top-0 z-20 -mx-1 px-1 py-3 backdrop-blur-sm sm:hidden"
        >
          <button
            aria-controls="menu-category-dialog"
            aria-haspopup="dialog"
            className="night-atlas__mobile-trigger"
            onClick={() => categoryDialogRef.current?.showModal()}
            type="button"
          >
            <span className="night-atlas__mobile-trigger-top">
              <span><span aria-hidden="true">✳</span> {messages.browseAtlas}</span>
              <span>{String(categories.indexOf(activeCategory) + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}</span>
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
                  <p className="night-atlas__panel-kicker">{messages.browseAtlas}</p>
                  <h2 className="font-display text-3xl font-[300] tracking-[-0.04em] text-ivory" id="menu-category-dialog-title">
                    {messages.categoryList}
                  </h2>
                </div>
                <button aria-label={messages.closeCategories} className="night-atlas__sheet-close" onClick={() => categoryDialogRef.current?.close()} type="button">×</button>
              </div>
              <div className="night-atlas__sheet-sections">
                {chapterCategories.map((chapter) => (
                  <section aria-labelledby={`sheet-chapter-${chapter.id}`} className="night-atlas__sheet-section" key={chapter.id}>
                    <h3 className="night-atlas__sheet-section-heading" id={`sheet-chapter-${chapter.id}`}>
                      <span>{chapter.number}</span> {messages.chapters[chapter.id].title}
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

        <div className="night-atlas__chapters" role="group" aria-label={messages.eyebrow}>
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
                  <span className="night-atlas__chapter-number">{chapter.number} / 03</span>
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
            <h2 className="font-display text-2xl font-[300] tracking-[-0.03em] text-ivory">{messages.indexHeading}</h2>
          </div>
          <div className="night-atlas__category-grid">
            {categories.map((category, index) => (
              <button
                aria-controls="menu-panel"
                aria-current={activeCategory.name === category.name ? "true" : undefined}
                className="night-atlas__category"
                key={category.name}
                onClick={() => selectCategory(category.name, true)}
                type="button"
              >
                <span className="night-atlas__category-number">{String(index + 1).padStart(2, "0")}</span>
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
            <h2 className="font-display text-4xl font-[200] tracking-[-0.045em] text-ivory sm:text-6xl" id="menu-panel-heading" ref={panelHeadingRef} tabIndex={-1}>
              {categoryLabels[activeCategory.name] ?? activeCategory.name}
            </h2>
          </header>

          {activeCategory.name === "SHISHA EXPERIENCE" && (
            <aside className="mt-6 border-l-2 border-emerald bg-onyx/45 px-5 py-4 text-left sm:mt-8">
              <p className="text-sm font-semibold text-ivory">
                {messages.recommendation.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-ivory/65">
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
                itemCount={messages.itemCount}
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

          <button
            className="mt-8 w-full border border-ivory/20 px-5 py-4 text-xs font-bold tracking-[0.12em] text-ivory transition-colors hover:border-emerald hover:text-emerald sm:hidden"
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
