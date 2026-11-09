import type { Metadata } from "next";
import "../globals.css";
import "../../components/loyalty/loyalty.css";
export const metadata: Metadata = {
  title: "Tu tarjeta VIP | Mundus Lounge",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function VipLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
