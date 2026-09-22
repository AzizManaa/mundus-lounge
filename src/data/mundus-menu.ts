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

export const menuCategories = fallbackMenu.categories;
export const menuCurrency = fallbackMenu.currency;

const menuSheetHeaders = [
  "category",
  "subcategory",
  "item",
  "description",
  "price",
  "bottle_price",
  "shot_price",
  "modifier",
  "visible",
] as const;

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

function getSheetRows(csv: string): MenuSheetRow[] {
  const [headers, ...rows] = parseCsv(csv);

  if (!headers) {
    return [];
  }

  const normalizedHeaders = headers.map((header) =>
    header.trim().toLowerCase().replaceAll(" ", "_"),
  );

  return rows
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) =>
      Object.fromEntries(
        normalizedHeaders.map((header, index) => [header, row[index]?.trim() ?? ""]),
      ),
    );
}

function menuFromSheet(csv: string): MenuData | null {
  const rows = getSheetRows(csv);

  if (!rows.some((row) => row.category && row.item)) {
    return null;
  }

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

  return parsedCategories.length > 0
    ? { categories: parsedCategories, currency: fallbackMenu.currency }
    : null;
}

function csvCell(value: string | number | null | undefined) {
  const content = value?.toString() ?? "";
  return /[",\n\r]/.test(content)
    ? `"${content.replaceAll('"', '""')}"`
    : content;
}

function menuItemToSheetRow(
  category: string,
  subcategory: string,
  modifier: string | undefined,
  item: MenuItem,
) {
  return [
    category,
    subcategory,
    item.name,
    item.description,
    item.price,
    item.bottle_price,
    item.shot_price,
    modifier,
    "true",
  ];
}

export function createMenuSheetTemplate() {
  const rows = fallbackMenu.categories.flatMap((category) => {
    if (category.subcategories) {
      return category.subcategories.flatMap((subcategory) =>
        subcategory.items.map((item) =>
          menuItemToSheetRow(
            category.name,
            subcategory.name,
            subcategory.modifier,
            item,
          ),
        ),
      );
    }

    return (category.items ?? []).map((item) =>
      menuItemToSheetRow(category.name, "", undefined, item),
    );
  });

  return [menuSheetHeaders, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
}

export async function getMenu(): Promise<MenuData> {
  const sheetUrl = process.env.MENU_SHEET_CSV_URL;

  if (!sheetUrl) {
    return fallbackMenu;
  }

  try {
    const response = await fetch(sheetUrl, { next: { revalidate: 60 } });

    if (!response.ok) {
      return fallbackMenu;
    }

    return menuFromSheet(await response.text()) ?? fallbackMenu;
  } catch {
    return fallbackMenu;
  }
}
