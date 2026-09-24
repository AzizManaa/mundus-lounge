import { NotFoundContent } from "../components/not-found-content";
import { bricolage, italianno } from "../lib/fonts";
import "./globals.css";

export default function NotFound() {
  return (
    <html className={`${bricolage.variable} ${italianno.variable}`} lang="es">
      <body>
        <NotFoundContent locale="es" showLanguageLink />
      </body>
    </html>
  );
}
