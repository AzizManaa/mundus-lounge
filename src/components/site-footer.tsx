import Image from "next/image";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-ivory/10 bg-black py-14 sm:py-16" id="contact">
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
            <p className="mt-4 max-w-48 text-sm leading-6 text-ivory/60">
              Personalised shisha, drinks, and casual food in Barcelona.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-emerald">
              FIND US
            </p>
            <p className="mt-4 text-lg text-ivory">C/ de Padilla, 177</p>
            <p className="mt-1 text-sm text-ivory/60">08013 Barcelona</p>
          </div>

          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-emerald">
              CALL
            </p>
            <a
              className="mt-4 inline-block font-display text-2xl font-medium tracking-[-0.04em] text-ivory no-underline transition-colors hover:text-emerald"
              href="tel:+34931058358"
            >
              +34 931 05 83 58
            </a>
            <p className="mt-2 text-sm text-ivory/60">Call Mundus</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ivory/10 pt-6 text-xs text-ivory/50 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Mundus Lounge. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted by
            <a
              className="inline-flex items-center text-ivory/70 no-underline transition-colors hover:text-emerald"
              href="https://aziz-manaa.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              NekoDesk
              <svg
                aria-hidden="true"
                className="ml-1.5 size-3.5 text-emerald"
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
          <a className="text-ivory/60 no-underline transition-colors hover:text-emerald" href="#top">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
