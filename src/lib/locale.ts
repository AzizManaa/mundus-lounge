import { notFound } from "next/navigation";
import { isLocale, type Locale } from "../i18n";

export function requireLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}
