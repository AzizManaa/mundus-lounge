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

export const menuCategories = menu.categories as MenuCategory[];
export const menuCurrency = menu.currency;
