import { bricolage, timberline } from "../../lib/fonts";
import "../globals.css";

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${bricolage.variable} ${timberline.variable}`} lang="es">
      <body>{children}</body>
    </html>
  );
}
