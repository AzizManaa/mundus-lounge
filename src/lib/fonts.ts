import localFont from "next/font/local";

export const bricolage = localFont({
  src: "../app/fonts/bricolage/BricolageGrotesque-Variable.ttf",
  display: "swap",
  variable: "--font-bricolage",
  weight: "200 800",
});

export const timberline = localFont({
  src: "../app/fonts/timberline/Timberline-Regular.otf",
  display: "swap",
  variable: "--font-timberline",
});
