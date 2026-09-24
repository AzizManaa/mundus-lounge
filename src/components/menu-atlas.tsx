import Image from "next/image";
import Link from "next/link";
import { getMessages, type Locale } from "../i18n";
import foodImage from "../../public/images/mundus-menu-food.webp";
import { MenuImageReveal } from "./menu-image-reveal";

export function MenuAtlas({ locale }: { locale: Locale }) {
  const messages = getMessages(locale).menuAtlas;
  const menuFeatures = messages.features.map((feature, index) => ({
    ...feature,
    image: [null, null, foodImage][index],
    chapter: (["ritual", "bar", "table"] as const)[index],
  }));

  return (
    <section
      aria-labelledby="menu-heading"
      className="mundus-section border-y border-ivory/10 bg-olive/30"
      id="menu"
    >
      <div className="mundus-container">
        <div className="grid gap-8 border-b border-ivory/15 pb-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
          <div>
            <p className="mundus-eyebrow mb-6">{messages.eyebrow}</p>
            <h2
              className="font-display text-5xl font-[200] leading-[0.95] tracking-[-0.05em] text-ivory sm:text-6xl"
              id="menu-heading"
            >
              {messages.heading}
            </h2>
          </div>
          <p className="max-w-lg text-base leading-7 text-ivory/70 sm:text-lg">
            {messages.description}
          </p>
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-3 sm:mt-16">
          {menuFeatures.map((feature) => (
            <li key={feature.title}>
              <Link
                aria-label={`${messages.viewMenu}: ${feature.title}`}
                className="mundus-menu-card group block focus-visible:outline-none"
                href={`/${locale}/menu?chapter=${feature.chapter}`}
              >
                <span className="mundus-menu-card__image">
                  {feature.image ? (
                    <Image
                      alt=""
                      className="object-cover"
                      fill
                      placeholder="blur"
                      sizes="(min-width: 768px) 30vw, 100vw"
                      src={feature.image}
                    />
                  ) : (
                    <MenuImageReveal variant={feature.chapter === "ritual" ? "shisha" : "drinks"} />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-onyx/20 to-onyx/30" />
                  <span className="relative z-10 mt-auto p-7 sm:p-8">
                    <span className="block font-display text-4xl font-[200] tracking-[-0.05em] text-ivory">
                      {feature.title}
                    </span>
                  </span>
                </span>

                <span className="mundus-menu-card__details">
                  <span className="text-sm leading-6 text-ivory/65">
                    {feature.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <Link className="mundus-button mundus-button--outline" href={`/${locale}/menu`}>
            {messages.viewMenu}
          </Link>
        </div>
      </div>
    </section>
  );
}
