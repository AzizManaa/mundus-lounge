"use client";

import { type KeyboardEvent, useRef, useState } from "react";
import type { Locale, MenuMessages } from "../i18n";
import type { MenuCategory, MenuItem, MenuSubcategory } from "../data/mundus-menu";

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
  const [activeCategoryName, setActiveCategoryName] = useState(categories[0].name);
  const categoryPickerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeCategory =
    categories.find((category) => category.name === activeCategoryName) ?? categories[0];
  const singleGroup = activeCategory.items
    ? { items: activeCategory.items, name: activeCategory.name }
    : null;
  const groups = activeCategory.subcategories ?? (singleGroup ? [singleGroup] : []);
  const activeIndex = categories.findIndex(
    (category) => category.name === activeCategory.name,
  );

  function activateCategory(index: number) {
    setActiveCategoryName(categories[index].name);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % categories.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + categories.length) % categories.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = categories.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    activateCategory(nextIndex);
  }

  return (
    <section className="bg-onyx pb-24 pt-12 sm:pb-32 sm:pt-16">
      <div className="mundus-container">
        <header className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="mundus-eyebrow mb-6">{messages.eyebrow}</p>
          <h1
            className="font-display text-5xl font-[200] tracking-[-0.05em] text-ivory sm:text-6xl"
            id="menu-heading"
          >
            {messages.heading}
          </h1>
          <p className="mt-6 text-base leading-7 text-ivory/65 sm:text-lg">
            {messages.description}
          </p>
        </header>

        <div
          className="sticky top-3 z-20 -mx-1 bg-onyx/95 px-1 py-3 backdrop-blur-sm sm:hidden"
          ref={categoryPickerRef}
        >
          <label className="sr-only" htmlFor="menu-category-select">
            {messages.browseCategory}
          </label>
          <select
            className="w-full border border-emerald/70 bg-onyx px-4 py-4 text-base font-semibold text-ivory outline-none focus:border-ivory"
            id="menu-category-select"
            onChange={(event) => setActiveCategoryName(event.target.value)}
            value={activeCategory.name}
          >
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {categoryLabels[category.name] ?? category.name}
              </option>
            ))}
          </select>
        </div>

        <div
          aria-label={messages.categoryList}
          className="hidden gap-7 overflow-x-auto border-b border-ivory/15 px-1 pb-5 sm:flex sm:justify-center"
          role="tablist"
        >
          {categories.map((category, index) => {
            const isActive = category.name === activeCategory.name;
            const tabId = `menu-tab-${index}`;

            return (
              <button
                aria-controls="menu-panel"
                aria-selected={isActive}
                className={`shrink-0 border-b-2 pb-3 text-xs font-bold tracking-[0.12em] transition-colors ${
                  isActive
                    ? "border-emerald text-ivory"
                    : "border-transparent text-ivory/50 hover:text-ivory"
                }`}
                key={category.name}
                onClick={() => setActiveCategoryName(category.name)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                role="tab"
                id={tabId}
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                {categoryLabels[category.name] ?? category.name}
              </button>
            );
          })}
        </div>

        <div
          aria-labelledby={`menu-tab-${activeIndex}`}
          className="mt-12 bg-olive/30 p-6 sm:mt-16 sm:p-10 lg:p-14"
          id="menu-panel"
          role="tabpanel"
        >
          <header className="border-b border-ivory/15 pb-8 text-center sm:pb-10">
            <h2
              className="font-display text-4xl font-[200] tracking-[-0.045em] text-ivory sm:text-6xl"
            >
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
            onClick={() =>
              categoryPickerRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            type="button"
          >
            {messages.backToCategories}
          </button>
        </div>
      </div>
    </section>
  );
}
