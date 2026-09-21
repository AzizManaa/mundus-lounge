import Image from "next/image";
import dominikAvatar from "../../public/images/review-dominik-skladanek.png";
import marioAvatar from "../../public/images/review-mario-steineschwanz.png";
import momentsBackgroundLeft from "../../public/images/mundus-moments-bg-left.png";
import momentsBackgroundRight from "../../public/images/mundus-moments-bg-right.png";
import nilsAvatar from "../../public/images/review-nils-grote.png";

const testimonials = [
  {
    avatar: marioAvatar,
    name: "Mario Steineschwanz",
    quote:
      "Amazing Shisha place, with the strongest ice shisha I ever had. Very friendly owner, with over 200 flavors. Cocktails also very good. Highly recommended.",
  },
  {
    avatar: dominikAvatar,
    name: "dominik skladanek",
    quote:
      "Amazing shisha bar in Barcelona! The service was incredibly friendly and attentive, and the shisha was even better. In my opinion, it's the best shisha bar in Barcelona – mainly because of the huge selection of tobacco, including both Virginia and dark blends. Highly recommended for all shisha lovers!",
  },
  {
    avatar: nilsAvatar,
    name: "Nils Grote",
    quote:
      "A huge selection of tobacco varieties. The staff is very friendly and truly attentive. Since we found this bar, we haven't wanted to go anywhere else. Highly recommended!",
  },
];

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="mundus-section mundus-testimonials relative isolate overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/4 h-[32rem] w-52 opacity-45 sm:-left-12 sm:w-64"
      >
        <Image
          alt=""
          className="object-contain object-left"
          fill
          sizes="16rem"
          src={momentsBackgroundLeft}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-0 h-[36rem] w-48 opacity-45 sm:-right-10 sm:w-60"
      >
        <Image
          alt=""
          className="object-contain object-right"
          fill
          sizes="15rem"
          src={momentsBackgroundRight}
        />
      </div>

      <div className="mundus-container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mundus-eyebrow mb-6">Testimonials</p>
          <h2
            className="font-display text-4xl font-[200] leading-[1.02] tracking-[-0.05em] text-ivory sm:text-5xl"
            id="testimonials-heading"
          >
            What people think
            <br />
            about Mundus
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3 sm:mt-16">
          {testimonials.map((testimonial) => (
            <figure
              className="relative flex min-h-80 flex-col items-center overflow-hidden border border-ivory/10 bg-onyx/75 px-8 py-10 text-center sm:px-10"
              key={testimonial.name}
            >
              <span
                aria-hidden="true"
                className="absolute left-8 top-7 font-display text-6xl leading-none text-emerald sm:left-10"
              >
                “
              </span>
              <Image
                alt={`${testimonial.name}'s profile photo`}
                className="size-16 rounded-full object-cover"
                height={64}
                src={testimonial.avatar}
                width={64}
              />
              <blockquote className="mt-7 text-base leading-7 text-ivory/75">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-auto pt-7 text-base font-semibold text-emerald">
                {testimonial.name}
              </figcaption>
              <span
                aria-hidden="true"
                className="absolute bottom-5 right-8 font-display text-6xl leading-none text-emerald sm:right-10"
              >
                ”
              </span>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
