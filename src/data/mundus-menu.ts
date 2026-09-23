import type { Locale } from "../i18n";
import menu from "./mundus-menu.json";

export type MenuItem = {
  name: string;
  description?: string | null;
  price?: number;
  bottle_price?: number | null;
  shot_price?: number | null;
};

export type MenuSubcategory = {
  name: string;
  description?: string;
  modifier?: string;
  items: MenuItem[];
};

export type MenuCategory = {
  name: string;
  items?: MenuItem[];
  subcategories?: MenuSubcategory[];
};

export type MenuData = {
  categories: MenuCategory[];
  currency: string;
};

type MenuSheetRow = Record<string, string>;

type CategoryBuilder = {
  groups: Map<string, MenuSubcategory>;
  items: MenuItem[];
  name: string;
};

const fallbackMenu: MenuData = {
  categories: menu.categories as MenuCategory[],
  currency: menu.currency,
};

const headerAliases: Record<string, string> = {
  item_name: "item",
  show_online: "visible",
};

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      cell = "";
      row = [];
    } else {
      cell += character;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function parsePrice(value: string | undefined) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number.parseFloat(
    value.replace(",", ".").replaceAll(/[^\d.-]/g, ""),
  );

  return Number.isFinite(parsed) ? parsed : undefined;
}

function isVisible(value: string | undefined) {
  return !["0", "false", "no", "off"].includes(value?.trim().toLowerCase() ?? "");
}

function getSheetRows(csv: string): MenuSheetRow[] | null {
  const [headers, ...rows] = parseCsv(csv);

  if (!headers) {
    return null;
  }

  const normalizedHeaders = headers.map((header) => {
    const key = header
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    return headerAliases[key] ?? key;
  });

  if (!["category", "item", "visible"].every((header) => normalizedHeaders.includes(header))) {
    return null;
  }

  return rows
    .filter((row) =>
      row.some((cell, index) => normalizedHeaders[index] !== "visible" && cell.trim()),
    )
    .map((row) =>
      Object.fromEntries(
        normalizedHeaders.map((header, index) => [header, row[index]?.trim() ?? ""]),
      ),
    );
}

function menuFromSheetRows(rows: MenuSheetRow[]): MenuData {
  const categories = new Map<string, CategoryBuilder>();

  for (const row of rows) {
    if (!row.category || !row.item || !isVisible(row.visible)) {
      continue;
    }

    const category =
      categories.get(row.category) ?? {
        groups: new Map<string, MenuSubcategory>(),
        items: [],
        name: row.category,
      };
    const price = parsePrice(row.price);
    const bottlePrice = parsePrice(row.bottle_price);
    const shotPrice = parsePrice(row.shot_price);
    const item: MenuItem = {
      name: row.item,
      ...(row.description ? { description: row.description } : {}),
      ...(price !== undefined ? { price } : {}),
      ...(bottlePrice !== undefined ? { bottle_price: bottlePrice } : {}),
      ...(shotPrice !== undefined ? { shot_price: shotPrice } : {}),
    };

    if (row.subcategory) {
      const group = category.groups.get(row.subcategory) ?? {
        items: [],
        name: row.subcategory,
        ...(row.modifier ? { modifier: row.modifier } : {}),
      };

      if (row.modifier && !group.modifier) {
        group.modifier = row.modifier;
      }

      group.items.push(item);
      category.groups.set(row.subcategory, group);
    } else {
      category.items.push(item);
    }

    categories.set(row.category, category);
  }

  const parsedCategories = Array.from(categories.values())
    .map((category): MenuCategory | null => {
      const subcategories = Array.from(category.groups.values()).filter(
        (group) => group.items.length > 0,
      );

      if (subcategories.length > 0) {
        return { name: category.name, subcategories };
      }

      return category.items.length > 0
        ? { items: category.items, name: category.name }
        : null;
    })
    .filter((category): category is MenuCategory => category !== null);

  return { categories: parsedCategories, currency: fallbackMenu.currency };
}

function translatedText(value: string | undefined, fallback: string | undefined) {
  const text = value?.trim() ?? "";
  return text && !text.startsWith("#") && !/^loading\.{0,3}$/i.test(text)
    ? text
    : (fallback ?? "");
}

function mergeEnglishRows(spanishRows: MenuSheetRow[], englishRows: MenuSheetRow[]) {
  const sharedFields = ["price", "bottle_price", "shot_price", "visible"];
  const rowsMatch =
    spanishRows.length === englishRows.length &&
    spanishRows.every((spanish, index) =>
      sharedFields.every((field) => spanish[field] === englishRows[index][field]),
    );

  if (!rowsMatch) {
    return spanishRows;
  }

  return spanishRows.map((spanish, index) => {
    const english = englishRows[index];

    return {
      ...spanish,
      category: translatedText(english.category, spanish.category),
      subcategory: translatedText(english.subcategory, spanish.subcategory),
      item: translatedText(english.item, spanish.item),
      description: translatedText(english.description, spanish.description),
      modifier: translatedText(english.modifier, spanish.modifier),
    };
  });
}

async function fetchSheetRows(url: string | undefined): Promise<MenuSheetRow[] | null> {
  if (!url) {
    return null;
  }

  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    return response.ok ? getSheetRows(await response.text()) : null;
  } catch {
    return null;
  }
}

export async function getMenu(locale: Locale): Promise<MenuData> {
  const spanishUrl = process.env.MENU_SHEET_CSV_URL_ES;
  const englishUrl = process.env.MENU_SHEET_CSV_URL_EN;
  const [spanishRows, englishRows] = await Promise.all([
    fetchSheetRows(spanishUrl),
    locale === "en" ? fetchSheetRows(englishUrl) : Promise.resolve(null),
  ]);
  const spanishMenu = spanishRows !== null ? menuFromSheetRows(spanishRows) : null;

  if (locale === "es") {
    return spanishMenu ?? fallbackMenu;
  }

  const englishMenu = englishRows !== null
    ? menuFromSheetRows(
        spanishRows !== null ? mergeEnglishRows(spanishRows, englishRows) : englishRows,
      )
    : null;

  return englishMenu ?? spanishMenu ?? fallbackMenu;
}
