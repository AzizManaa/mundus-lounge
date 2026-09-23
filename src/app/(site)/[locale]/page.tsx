import { HomePage } from "../../../components/home-page";
import { requireLocale } from "../../../lib/locale";
import { getPageMetadata } from "../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return getPageMetadata(requireLocale((await params).locale), "home");
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <HomePage locale={requireLocale((await params).locale)} />;
}
