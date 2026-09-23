import { bricolage, italianno } from "../../lib/fonts";
import "../globals.css";

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${bricolage.variable} ${italianno.variable}`} lang="es">
      <body>{children}</body>
    </html>
  );
}
