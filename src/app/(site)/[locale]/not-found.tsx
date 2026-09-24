"use client";

import { useParams } from "next/navigation";
import { NotFoundContent } from "../../../components/not-found-content";

export default function LocaleNotFound() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale === "en" ? "en" : "es";
  return <NotFoundContent locale={locale} />;
}
