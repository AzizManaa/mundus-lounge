import Image from "next/image";
import Link from "next/link";
import cocktailImage from "../../public/images/mundus-menu-drinks.png";
import foodImage from "../../public/images/mundus-menu-food.png";
import shishaImage from "../../public/images/mundus-menu-shisha.png";

const menuFeatures = [
  {
    description:
      "A wide range of flavours and intensity levels, with tailored advice from the team.",
    image: shishaImage,
    number: "01",
    title: "Shisha",
  },
  {
    description:
      "Cocktails, mixed drinks, and plenty of ways to settle into the evening.",
    image: cocktailImage,
    number: "02",
    title: "Drinks",
  },
  {
    description: "Burgers, casual food, and easy snacks for the table.",
    image: foodImage,
    number: "03",
    title: "Food",
  },
];

export function MenuAtlas() {
  return (
    <section
      aria-labelledby="menu-heading"
      className="mundus-section border-y border-ivory/10 bg-olive/30"
      id="menu"
    >
      <div className="mundus-container">
        <div className="grid gap-8 border-b border-ivory/15 pb-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
          <div>
            <p className="mundus-eyebrow mb-6">Choose your moment</p>
            <h2
              className="font-display text-5xl font-[200] leading-[0.95] tracking-[-0.05em] text-ivory sm:text-6xl"
              id="menu-heading"
            >
              The Mundus Menu
            </h2>
          </div>
          <p className="max-w-lg text-base leading-7 text-ivory/70 sm:text-lg">
            Personalised shisha, cocktails, coffee and tea, plus casual food
            for an unhurried evening.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-3 sm:mt-16">
          {menuFeatures.map((feature) => (
            <li key={feature.title}>
              <Link
                aria-label={`View the ${feature.title} menu`}
                className="mundus-menu-card group block focus-visible:outline-none"
                href="/menu"
              >
                <span className="mundus-menu-card__image">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    placeholder="blur"
                    sizes="(min-width: 768px) 30vw, 100vw"
                    src={feature.image}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-onyx/20 to-onyx/30" />
                  <span className="relative z-10 mt-auto p-7 sm:p-8">
                    <span className="block text-xs font-bold tracking-[0.14em] text-emerald">
                      {feature.number}
                    </span>
                    <span className="mt-3 block font-display text-4xl font-[200] tracking-[-0.05em] text-ivory">
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
          <Link className="mundus-button mundus-button--outline" href="/menu">
            Explore the full menu
          </Link>
        </div>
      </div>
    </section>
  );
}
