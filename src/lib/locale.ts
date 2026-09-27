import { notFound } from "next/navigation";
import { isLocale, type Locale } from "../i18n";
import { isMenuLocale, type MenuLocale } from "../i18n/menu";

export function requireMenuLocale(value: string): MenuLocale {
  if (!isMenuLocale(value)) notFound();
  return value;
}

export function requireLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}
