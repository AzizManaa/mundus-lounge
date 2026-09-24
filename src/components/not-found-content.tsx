import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../i18n";

export function NotFoundContent({
  locale,
  showLanguageLink = false,
}: {
  locale: Locale;
  showLanguageLink?: boolean;
}) {
  const english = locale === "en";

  return (
    <main className="mundus-not-found">
      <div className="mundus-not-found__visual" aria-hidden="true">
        <Image
          alt=""
          className="mundus-not-found__image"
          fill
          preload
          sizes="(min-width: 768px) 50vw, 100vw"
          src="/images/404.webp"
        />
      </div>
      <div className="mundus-container mundus-not-found__inner">
        <div className="mundus-not-found__content">
          <p className="mundus-not-found__eyebrow">Mundus Lounge <span aria-hidden="true">✦</span> 404</p>
          <h1>
            {english
              ? "This page went up in smoke."
              : "Esta página se ha esfumado."}
          </h1>
          <p className="mundus-not-found__description">
            {english
              ? "Good news: your seat is still here. Head back to the lounge or browse the menu."
              : "La buena noticia: tu sitio sigue aquí. Vuelve al lounge o echa un vistazo a la carta."}
          </p>
          <div className="mundus-error-page__actions">
            <Link className="mundus-button" href={`/${locale}`}>
              {english ? "Back to the lounge" : "Volver al lounge"}
            </Link>
            <Link className="mundus-button mundus-button--quiet" href={`/${locale}/menu`}>
              {english ? "See the menu" : "Ver la carta"}
            </Link>
          </div>
          {showLanguageLink && (
            <Link className="mundus-error-page__language" href="/en">
              Continue in English
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
