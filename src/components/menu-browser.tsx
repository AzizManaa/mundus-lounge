"use client";

import { type KeyboardEvent, useRef, useState } from "react";
import type { MenuCategory, MenuItem, MenuSubcategory } from "../data/mundus-menu";

const categoryLabels: Record<string, string> = {
  "SHISHA EXPERIENCE": "Shisha",
  "CÓCTELES": "Cocktails",
  COMBINADOS: "Spirits",
  FOOD: "Food",
  CERVEZAS: "Beer",
  VINOS: "Wine",
  "BATIDOS & ZUMOS": "Milkshakes & Juices",
  "CAFÉS & TÉS": "Coffee & Tea",
  POSTRES: "Dessert",
  REFRESCOS: "Soft drinks",
};

function formatPrice(price: number | null | undefined, currency: string) {
  if (price == null) {
    return null;
  }

  return new Intl.NumberFormat("es-ES", {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(price);
}

function MenuItemRow({ item, currency }: { item: MenuItem; currency: string }) {
  return (
    <li className="border-b border-ivory/10 py-5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="font-display text-lg font-medium text-ivory">
          {item.name}
        </h4>
        {item.price !== undefined && (
          <span className="shrink-0 text-sm text-emerald">
            {formatPrice(item.price, currency)}
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-1.5 text-sm leading-6 text-ivory/60">
          {item.description}
        </p>
      )}
      {(item.bottle_price != null || item.shot_price != null) && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium tracking-[0.08em] text-ivory/45">
          {item.bottle_price != null && (
            <span>BOTTLE {formatPrice(item.bottle_price, currency)}</span>
          )}
          {item.shot_price != null && (
            <span>SHOT {formatPrice(item.shot_price, currency)}</span>
          )}
        </div>
      )}
    </li>
  );
}

function MenuGroup({
  category,
  currency,
}: {
  category: MenuSubcategory;
  currency: string;
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
          <MenuItemRow currency={currency} item={item} key={item.name} />
        ))}
      </ul>
    </article>
  );
}

export function MenuBrowser({
  categories,
  currency,
}: {
  categories: MenuCategory[];
  currency: string;
}) {
  const [activeCategoryName, setActiveCategoryName] = useState(categories[0].name);
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
          <p className="mundus-eyebrow mb-6">Choose your moment</p>
          <h1
            className="font-display text-5xl font-[200] tracking-[-0.05em] text-ivory sm:text-6xl"
            id="menu-heading"
          >
            The Mundus Menu
          </h1>
          <p className="mt-6 text-base leading-7 text-ivory/65 sm:text-lg">
            Explore shisha, drinks, food, and everything in between. Prices are shown in euros.
          </p>
        </header>

        <div
          aria-label="Menu categories"
          className="flex gap-7 overflow-x-auto border-b border-ivory/15 px-1 pb-5 sm:justify-center"
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

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {groups.map((group) => (
              <MenuGroup category={group} currency={currency} key={group.name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
