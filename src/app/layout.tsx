import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "Mundus Lounge | Shisha Bar in Eixample, Barcelona",
  description:
    "A relaxed Barcelona lounge for personalised shisha, cocktails, coffee, tea, and casual food near Sagrada Família.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${timberline.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
