import type { Metadata } from "next";
import localFont from "next/font/local";
import { business, localBusinessSchema, siteUrl } from "../data/mundus-business";
import "./globals.css";

const siteDescription =
  "A relaxed Barcelona lounge for personalised shisha, cocktails, coffee, tea, and casual food near Sagrada Família.";

const bricolage = localFont({
  src: "./fonts/bricolage/BricolageGrotesque-Variable.ttf",
  display: "swap",
  variable: "--font-bricolage",
  weight: "200 800",
});

const timberline = localFont({
  src: "./fonts/timberline/Timberline-Regular.otf",
  display: "swap",
  variable: "--font-timberline",
});

export const metadata: Metadata = {
  ...(siteUrl
    ? {
        alternates: { canonical: "/" },
        metadataBase: new URL(siteUrl),
      }
    : {}),
  applicationName: business.name,
  description: siteDescription,
  openGraph: {
    description: siteDescription,
    ...(siteUrl
      ? {
          images: [
            {
              alt: "Mundus Lounge shisha bar in Barcelona",
              url: "/images/mundus-shisha-hero.png",
            },
          ],
        }
      : {}),
    locale: "en_ES",
    siteName: business.name,
    title: "Mundus Lounge | Shisha Bar in Eixample, Barcelona",
    type: "website",
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
    },
    index: true,
  },
  title: {
    default: "Mundus Lounge | Shisha Bar in Eixample, Barcelona",
    template: "%s | Mundus Lounge",
  },
  twitter: {
    card: "summary",
    description: siteDescription,
    ...(siteUrl ? { images: ["/images/mundus-shisha-hero.png"] } : {}),
    title: "Mundus Lounge | Shisha Bar in Eixample, Barcelona",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${timberline.variable}`}
    >
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
