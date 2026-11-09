"use client";

import { useEffect, useRef } from "react";
import { menuLanguageNames, menuLocales, type MenuLocale } from "../i18n/menu";

export function MenuLanguageSwitcher({ locale, label }: { locale: MenuLocale; label: string }) {
  const picker = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !picker.current?.contains(event.target)) {
        if (picker.current) picker.current.open = false;
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  function closePicker() {
    if (picker.current) picker.current.open = false;
  }

  return (
    <details
      ref={picker}
      className="group relative shrink-0"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          closePicker();
          picker.current?.querySelector("summary")?.focus();
        }
      }}
    >
      <summary
        aria-label={`${label}: ${menuLanguageNames[locale]}`}
        className="flex min-h-11 cursor-pointer list-none items-center gap-2 border border-gold/45 bg-onyx px-3 text-sm text-cream transition-colors hover:border-gold hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-honey [&::-webkit-details-marker]:hidden"
      >
        <svg aria-hidden="true" className="size-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
        <span lang={locale}>{menuLanguageNames[locale]}</span>
        <svg aria-hidden="true" className="size-3 text-gold transition-transform group-open:rotate-180 motion-reduce:transition-none" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m2 4 4 4 4-4" />
        </svg>
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 w-48 border border-gold/40 bg-onyx p-1.5 shadow-xl shadow-black/40">
        {menuLocales.map((language) => (
          <a
            key={language}
            href={`/${language}/menu`}
            lang={language}
            aria-current={language === locale ? "true" : undefined}
            className={`flex min-h-11 w-full items-center justify-between gap-3 px-3 text-left text-sm transition-colors hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-honey ${language === locale ? "bg-gold/10 text-gold" : "text-cream"}`}
            onClick={(event) => {
              event.currentTarget.search = window.location.search;
            }}
          >
            {menuLanguageNames[language]}
            {language === locale ? <span aria-hidden="true">✓</span> : <span aria-hidden="true" className="text-xs uppercase text-cream/45">{language}</span>}
          </a>
        ))}
      </div>
    </details>
  );
}
