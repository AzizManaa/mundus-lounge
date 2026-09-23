import { Bricolage_Grotesque, Italianno } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const italianno = Italianno({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-italianno",
  weight: "400",
});
