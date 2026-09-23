import Link from "next/link";
import type { Locale } from "../i18n";

export function LocaleSwitcher({
  label,
  locale,
  path,
}: {
  label: string;
  locale: Locale;
  path: "" | "/menu";
}) {
  return (
    <nav aria-label={label} className="flex items-center gap-2 text-xs font-bold tracking-[0.12em]">
      {(["es", "en"] as const).map((candidate) => {
        const active = locale === candidate;

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`transition-colors ${
              active ? "text-emerald" : "text-ivory/60 hover:text-ivory"
            }`}
            href={`/${candidate}${path}`}
            key={candidate}
            lang={candidate}
          >
            {candidate.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
