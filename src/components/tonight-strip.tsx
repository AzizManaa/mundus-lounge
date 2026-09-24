import Link from "next/link";
import { business } from "../data/mundus-business";
import { getMessages, type Locale } from "../i18n";
import { TonightHours } from "./tonight-hours";

export function TonightStrip({ locale }: { locale: Locale }) {
  const messages = getMessages(locale);

  return (
    <section aria-label={messages.tonight.heading} className="border-b border-brass/25 bg-olive/55">
      <div className="mundus-container flex flex-col gap-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-8">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="mt-1 text-2xl leading-none text-brass">✳</span>
          <div>
            <h2 className="font-display text-2xl font-[300] tracking-[-0.035em] text-ivory sm:text-3xl">
              {messages.tonight.heading}
            </h2>
            <p className="mt-1 text-sm text-ivory/70 sm:text-base">
              <TonightHours hours={business.openingHours} locale={locale} />
              <span aria-hidden="true" className="mx-2 text-brass/70">·</span>
              {messages.visit.neighbourhood}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 sm:shrink-0">
          <Link className="mundus-button mundus-button--outline" href={`/${locale}/menu`}>
            {messages.navigation.viewMenu}
          </Link>
          <a className="mundus-button mundus-button--quiet" href={business.directionsUrl} rel="noreferrer" target="_blank">
            {messages.visit.directions}
          </a>
        </div>
      </div>
    </section>
  );
}
