"use client";

import Link from "next/link";
import { useEffect } from "react";
import { bricolage, italianno } from "../lib/fonts";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html className={`${bricolage.variable} ${italianno.variable}`} lang="es">
      <body>
        <main className="mundus-error-page mundus-container">
          <div className="mundus-error-page__content">
            <p className="mundus-error-page__code">M</p>
            <p className="mundus-error-page__eyebrow">Mundus Lounge</p>
            <h1>Algo no ha salido bien.</h1>
            <p className="mundus-error-page__description">
              No hemos podido cargar la página. Inténtalo de nuevo o vuelve al inicio.
            </p>
            <div className="mundus-error-page__actions">
              <button className="mundus-button" onClick={reset} type="button">
                Reintentar
              </button>
              <Link className="mundus-button mundus-button--quiet" href="/es">
                Volver al inicio
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
