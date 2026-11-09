import type { Metadata } from "next";
import "../globals.css";
export const metadata: Metadata = { title: "Gestión de carta | Mundus", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
