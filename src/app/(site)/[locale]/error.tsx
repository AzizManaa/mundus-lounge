"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ locale: string }>();
  const locale = params.locale === "en" ? "en" : "es";
  const english = locale === "en";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mundus-error-page mundus-container">
      <div className="mundus-error-page__content">
        <p className="mundus-error-page__code">M</p>
        <p className="mundus-error-page__eyebrow">Mundus Lounge</p>
        <h1>{english ? "Something went wrong." : "Algo no ha salido bien."}</h1>
        <p className="mundus-error-page__description">
          {english
            ? "We couldn’t load this page. Please try again or return to the lounge."
            : "No hemos podido cargar esta página. Inténtalo de nuevo o vuelve al lounge."}
        </p>
        <div className="mundus-error-page__actions">
          <button className="mundus-button" onClick={reset} type="button">
            {english ? "Try again" : "Reintentar"}
          </button>
          <Link className="mundus-button mundus-button--quiet" href={`/${locale}`}>
            {english ? "Back to home" : "Volver al inicio"}
          </Link>
        </div>
      </div>
    </main>
  );
}
