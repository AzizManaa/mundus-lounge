import Image from "next/image";
import { business } from "../data/mundus-business";
import { getMessages, type Locale } from "../i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const currentYear = new Date().getFullYear();
  const { footer: messages, navigation } = getMessages(locale);

  return (
    <footer className="border-t border-cream/10 bg-black py-14 sm:py-16" id="contact">
      <div className="mundus-container">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <Image
              alt="Mundus Lounge"
              className="h-auto w-40 max-w-full"
              height={89}
              src="/brand/mundus-lockup.svg"
              unoptimized
              width={160}
            />
            <p className="mt-4 max-w-48 text-sm leading-6 text-cream/60">
              {messages.summary}
            </p>
            <a
              aria-label={messages.instagram}
              className="mt-5 inline-flex size-11 items-center justify-center border border-cream/20 text-cream/75 transition-colors hover:border-honey hover:text-honey"
              href={business.instagramUrl}
              rel="noopener noreferrer"
              target="_blank"
              title={messages.instagram}
            >
              <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect height="18" rx="5" width="18" x="3" y="3" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>

          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-honey">
              {messages.findUs}
            </p>
            <p className="mt-4 text-lg text-cream">{business.address.streetAddress}</p>
            <p className="mt-1 text-sm text-cream/60">
              {business.address.postalCode} {business.address.city}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-honey">
              {messages.call}
            </p>
            <a
              className="mt-4 inline-block font-display text-2xl font-medium tracking-[-0.04em] text-cream no-underline transition-colors hover:text-honey"
              href={business.telephoneUrl}
            >
              {business.phone}
            </a>
            <p className="mt-2 text-sm text-cream/60">{messages.callMundus}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/50 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Mundus Lounge. {messages.copyright}</p>
          <p className="flex items-center gap-1.5">
            {messages.craftedBy}
            <a
              className="inline-flex items-center text-cream/70 no-underline transition-colors hover:text-honey"
              href="https://aziz-manaa.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              NekoDesk
              <svg
                aria-hidden="true"
                className="ml-1.5 size-3.5 text-honey"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M12 18c-3.6 0-6 1.7-6 3.6 0 .8.7 1.4 1.5 1.4 1.3 0 1.8-1 4.5-1s3.2 1 4.5 1c.8 0 1.5-.6 1.5-1.4C18 19.7 15.6 18 12 18Z" />
                <path d="M5.2 13.6c-1.3-1.3-1.8-3.1-.8-4.1 1-1 2.8-.5 4.1.8 1.3 1.3 1.8 3.1.8 4.1-1 1-2.8.5-4.1-.8Z" />
                <path d="M18.8 13.6c1.3-1.3 1.8-3.1.8-4.1-1-1-2.8-.5-4.1.8-1.3 1.3-1.8 3.1-.8 4.1 1 1 2.8.5 4.1-.8Z" />
                <path d="M9.2 8.2c-.4-1.8.2-3.6 1.6-3.9 1.4-.3 2.6 1.1 3 2.9.4 1.8-.2 3.6-1.6 3.9-1.4.3-2.6-1.1-3-2.9Z" />
              </svg>
            </a>
          </p>
          <a className="text-cream/60 no-underline transition-colors hover:text-honey" href="#top">
            {navigation.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
