const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercelProductionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

export const siteUrl = configuredSiteUrl
  ? configuredSiteUrl.replace(/\/$/, "")
  : vercelProductionDomain
    ? `https://${vercelProductionDomain}`
    : undefined;

type OpeningHours = {
  closes?: string;
  day: string;
  display: string;
  opens?: string;
};

const openingHours: readonly OpeningHours[] = [
  { day: "Monday", display: "Closed" },
  { day: "Tuesday", display: "16:00–01:00", opens: "16:00", closes: "01:00" },
  { day: "Wednesday", display: "16:00–01:00", opens: "16:00", closes: "01:00" },
  { day: "Thursday", display: "16:00–01:00", opens: "16:00", closes: "01:00" },
  { day: "Friday", display: "17:00–02:00", opens: "17:00", closes: "02:00" },
  { day: "Saturday", display: "17:00–02:00", opens: "17:00", closes: "02:00" },
  { day: "Sunday", display: "16:00–01:00", opens: "16:00", closes: "01:00" },
];

export const business = {
  address: {
    city: "Barcelona",
    country: "ES",
    postalCode: "08013",
    streetAddress: "C/ de Padilla, 177",
  },
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=C%2F%20de%20Padilla%2C%20177%2C%2008013%20Barcelona",
  name: "Mundus Lounge",
  openingHours,
  phone: "931 05 83 58",
  telephoneUrl: "tel:+34931058358",
} as const;

export function getLocalBusinessSchema(description: string, locale: "es" | "en") {
  return {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    ...(siteUrl ? { "@id": `${siteUrl}/#business`, url: siteUrl } : {}),
    address: {
      "@type": "PostalAddress",
      addressCountry: business.address.country,
      addressLocality: business.address.city,
      postalCode: business.address.postalCode,
      streetAddress: business.address.streetAddress,
    },
    description,
    inLanguage: locale,
    name: business.name,
    openingHoursSpecification: business.openingHours
      .filter((hours) => hours.opens && hours.closes)
      .map((hours) => ({
        "@type": "OpeningHoursSpecification",
        closes: hours.closes,
        dayOfWeek: hours.day,
        opens: hours.opens,
      })),
    telephone: business.telephoneUrl.slice(4),
  };
}
