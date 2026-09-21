import Image from "next/image";
import Link from "next/link";
import { MenuAtlas } from "../components/menu-atlas";
import { MundusMoments } from "../components/mundus-moments";
import { SiteFooter } from "../components/site-footer";
import { Testimonials } from "../components/testimonials";
import { WhereToFind } from "../components/where-to-find";
import aboutImageOne from "../../public/images/mundus-about-one.png";
import aboutImageTwo from "../../public/images/mundus-about-two.png";
import heroImage from "../../public/images/mundus-shisha-hero.png";
import smokeLeft from "../../public/images/mundus-smoke-left.png";
import smokeRight from "../../public/images/mundus-smoke-right.png";

const navigationItems = [
  { href: "#about", label: "About" },
  { href: "#menu", label: "Menu" },
  { href: "#visit", label: "Visit Us" },
  { href: "#contact", label: "Contact" },
];

export default function Home() {
  return (
    <>
      <main id="top">
      <header className="absolute inset-x-0 top-0 z-10 py-6 sm:py-7">
        <div className="mundus-container flex items-center justify-between gap-6">
          <a
            className="inline-flex size-11 items-center justify-center"
            href="#top"
          >
            <Image
              alt="Mundus Lounge"
              className="size-9"
              height={36}
              src="/brand/mundus-mark.svg"
              unoptimized
              width={36}
            />
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-8 lg:flex"
          >
            {navigationItems.map((item) => (
              <a
                className="text-sm font-medium text-ivory/90 no-underline transition-colors hover:text-emerald"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            className="mundus-button mundus-button--outline"
            href="/menu"
          >
            View Menu
          </Link>
        </div>
      </header>

      <section className="relative isolate flex min-h-svh overflow-hidden border-b border-ivory/10">
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 size-full object-cover object-[70%_center]"
          muted
          playsInline
          poster={heroImage.src}
          preload="metadata"
        >
          <source src="/videos/mundus-hero.mp4" type="video/mp4" />
        </video>
        <div aria-hidden="true" className="mundus-hero-overlay absolute inset-0" />

        <div className="mundus-container relative z-10 flex items-start pt-32 sm:pt-36">
          <div className="max-w-xl">
            <p className="mundus-eyebrow mb-5">Shisha Bar</p>
            <h1 className="font-display text-5xl font-[200] leading-[0.98] tracking-[-0.055em] text-ivory sm:text-7xl lg:text-[5.6rem]">
              Welcome to
              <br />
              Mundus
              <br />
              Lounge
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-ivory/80 sm:text-lg">
              A relaxed Eixample lounge for personalised shisha, cocktails,
              coffee, tea, and casual food near Sagrada Família.
            </p>
            <dl className="mt-16 grid max-w-md grid-cols-2 border-t border-ivory/15 pt-7 sm:mt-20">
              <div className="border-r border-ivory/15 pr-6">
                <dt className="text-xs font-bold tracking-[0.1em] text-ivory/60">
                  TAILORED FLAVOURS
                </dt>
                <dd className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ivory">
                  Shisha
                </dd>
              </div>
              <div className="pl-6">
                <dt className="text-xs font-bold tracking-[0.1em] text-ivory/60">
                  COCKTAILS, COFFEE &amp; TEA
                </dt>
                <dd className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ivory">
                  Drinks
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="about-heading"
        className="mundus-section relative isolate overflow-hidden"
        id="about"
      >
        <div aria-hidden="true" className="absolute -left-16 top-0 h-[34rem] w-56 opacity-70 sm:-left-12 sm:w-72">
          <Image alt="" className="object-contain object-left-top" fill sizes="18rem" src={smokeLeft} />
        </div>
        <div aria-hidden="true" className="absolute -right-14 bottom-0 h-[28rem] w-52 opacity-70 sm:-right-10 sm:w-64">
          <Image alt="" className="object-contain object-right-bottom" fill sizes="16rem" src={smokeRight} />
        </div>

        <div className="mundus-container relative z-10 grid gap-24 lg:gap-36">
          <article className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
            <div className="mundus-image-frame aspect-square sm:aspect-[4/3]">
              <Image
                alt="A prepared shisha at Mundus Lounge"
                className="object-cover"
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 34vw, 100vw"
                src={aboutImageOne}
              />
            </div>

            <div className="max-w-xl">
              <p className="mundus-eyebrow mb-6">About Us</p>
              <h2 id="about-heading" className="font-display text-4xl font-[200] leading-[1.08] tracking-[-0.045em] text-ivory sm:text-5xl">
                A lounge for
                <br />
                good company
              </h2>
              <p className="mt-7 text-base leading-7 text-ivory/70 sm:text-lg">
                Mundus is a Barcelona lounge for switching off, on your own or
                with good company. Whether you know what you like or want a
                recommendation, the team can help you find a flavour mix and
                intensity that feels right for you.
              </p>
            </div>
          </article>

          <article className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
            <div className="order-2 max-w-xl lg:order-1">
              <p className="mundus-eyebrow mb-6">Our Lounge</p>
              <h2 className="font-display text-4xl font-[200] leading-[1.08] tracking-[-0.045em] text-ivory sm:text-5xl">
                Drinks, bites, and
                <br />
                your own pace
              </h2>
              <p className="mt-7 text-base leading-7 text-ivory/70 sm:text-lg">
                Come for shisha, stay for cocktails, beer, wine, coffee, or
                tea. The menu also covers milkshakes, juices, desserts, and
                casual food, including burgers and easy snacks.
              </p>
            </div>

            <div className="mundus-image-frame order-1 aspect-[4/5] sm:aspect-[5/4] lg:order-2">
              <Image
                alt="Friends enjoying the Mundus Lounge atmosphere"
                className="object-cover"
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 34vw, 100vw"
                src={aboutImageTwo}
              />
            </div>
          </article>
        </div>
      </section>

        <MenuAtlas />
        <MundusMoments />
        <Testimonials />
        <WhereToFind />
      </main>
      <SiteFooter />
    </>
  );
}
