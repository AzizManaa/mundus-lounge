import Image from "next/image";
import afterDarkImage from "../../public/images/mundus-moment-after-dark.png";
import cocktailImage from "../../public/images/mundus-moment-cocktail.png";
import foodImage from "../../public/images/mundus-moment-food.png";
import goodCompanyImage from "../../public/images/mundus-moment-good-company.png";
import loungeTableImage from "../../public/images/mundus-moment-lounge-table.jpg";
import shishaImage from "../../public/images/mundus-moment-shisha.png";

const momentTiles = [
  {
    className: "col-span-2 row-span-2",
    image: shishaImage,
    label: "Shisha ritual",
    objectPosition: "object-center",
  },
  {
    className: "",
    image: cocktailImage,
    label: "Cocktails",
    objectPosition: "object-center",
  },
  {
    className: "",
    image: loungeTableImage,
    label: "Lounge table",
    objectPosition: "object-center",
  },
  {
    className: "col-span-2",
    image: foodImage,
    label: "Food to share",
    objectPosition: "object-center",
  },
  {
    className: "",
    image: afterDarkImage,
    label: "After dark",
    objectPosition: "object-center",
  },
  {
    className: "",
    image: goodCompanyImage,
    label: "Good company",
    objectPosition: "object-center",
  },
];

export function MundusMoments() {
  return (
    <section aria-labelledby="moments-heading" className="mundus-section">
      <div className="mundus-container">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 sm:flex-row sm:items-end">
          <div>
            <p className="mundus-eyebrow mb-6">Mundus moments</p>
            <h2
              className="font-display text-5xl font-[200] leading-[0.95] tracking-[-0.05em] text-ivory sm:text-6xl"
              id="moments-heading"
            >
              Made for slow evenings
            </h2>
          </div>
          <p className="max-w-sm text-base leading-7 text-ivory/65">
            Personalised shisha, drinks, and the good company that makes an
            evening at Mundus its own.
          </p>
        </div>

        <div className="grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[14rem] sm:grid-cols-4 sm:gap-4">
          {momentTiles.map((tile) => (
            <figure
              className={`group relative cursor-default overflow-hidden border border-ivory/15 p-5 transition-colors duration-500 hover:border-emerald/55 sm:p-6 motion-reduce:transition-none ${tile.className}`}
              key={tile.label}
            >
              <Image
                alt={tile.label}
                className={`object-cover transition-[filter,scale] duration-700 ease-out group-hover:scale-[1.035] group-hover:brightness-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${tile.objectPosition}`}
                fill
                placeholder="blur"
                sizes="(min-width: 640px) 25vw, 50vw"
                src={tile.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/85 via-transparent to-transparent transition-opacity duration-700 group-hover:opacity-75 motion-reduce:transition-none" />
              <figcaption className="relative z-10 flex h-full translate-y-1 flex-col justify-end transition-transform duration-500 ease-out group-hover:translate-y-0 motion-reduce:translate-y-0 motion-reduce:transition-none">
                <span className="font-display text-2xl font-[200] tracking-[-0.03em] text-ivory sm:text-3xl">
                  {tile.label}
                </span>
              </figcaption>
              <span
                aria-hidden="true"
                className="absolute inset-x-5 bottom-0 z-10 h-px origin-left scale-x-0 bg-emerald transition-transform duration-700 ease-out group-hover:scale-x-100 sm:inset-x-6 motion-reduce:transition-none"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
