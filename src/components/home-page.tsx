import Image from "next/image";
import Link from "next/link";
import { getMessages, type Locale } from "../i18n";
import aboutImageOne from "../../public/images/mundus-about-one.png";
import aboutImageTwo from "../../public/images/mundus-about-two.png";
import heroImage from "../../public/images/mundus-shisha-hero.png";
import smokeLeft from "../../public/images/mundus-smoke-left.png";
import smokeRight from "../../public/images/mundus-smoke-right.png";
import { LocaleSwitcher } from "./locale-switcher";
import { MenuAtlas } from "./menu-atlas";
import { MundusMoments } from "./mundus-moments";
import { SiteFooter } from "./site-footer";
import { Testimonials } from "./testimonials";
import { WhereToFind } from "./where-to-find";

export function HomePage({ locale }: { locale: Locale }) {
  const messages = getMessages(locale);
  const navigationItems = [
    { href: "#about", label: messages.navigation.about },
    { href: "#menu", label: messages.navigation.menu },
    { href: "#visit", label: messages.navigation.visit },
    { href: "#contact", label: messages.navigation.contact },
  ];

  return (
    <>
      <main id="top">
        <header className="absolute inset-x-0 top-0 z-10 py-6 sm:py-7">
          <div className="mundus-container flex items-center justify-between gap-4">
            <a className="inline-flex size-11 items-center justify-center" href="#top">
              <Image
                alt="Mundus Lounge"
                className="size-9"
                height={36}
                src="/brand/mundus-mark.svg"
                unoptimized
                width={36}
              />
            </a>

            <nav aria-label={messages.navigation.primary} className="hidden items-center gap-8 lg:flex">
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

            <div className="flex items-center gap-4 sm:gap-6">
              <LocaleSwitcher label={messages.navigation.language} locale={locale} path="" />
              <Link className="mundus-button mundus-button--outline" href={`/${locale}/menu`}>
                {messages.navigation.viewMenu}
              </Link>
            </div>
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
              <p className="mundus-eyebrow mb-5">{messages.hero.eyebrow}</p>
              <h1 className="font-display text-5xl font-[200] leading-[0.98] tracking-[-0.055em] text-ivory sm:text-7xl lg:text-[5.6rem]">
                {messages.hero.heading[0]}
                <br />
                {messages.hero.heading[1]}
                <br />
                {messages.hero.heading[2]}
              </h1>
              <p className="mt-8 max-w-md text-base leading-7 text-ivory/80 sm:text-lg">
                {messages.hero.summary}
              </p>
              <dl className="mt-16 grid max-w-md grid-cols-2 border-t border-ivory/15 pt-7 sm:mt-20">
                <div className="border-r border-ivory/15 pr-6">
                  <dt className="text-xs font-bold tracking-[0.1em] text-ivory/60">
                    {messages.hero.shishaLabel}
                  </dt>
                  <dd className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ivory">
                    {messages.hero.shisha}
                  </dd>
                </div>
                <div className="pl-6">
                  <dt className="text-xs font-bold tracking-[0.1em] text-ivory/60">
                    {messages.hero.drinksLabel}
                  </dt>
                  <dd className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ivory">
                    {messages.hero.drinks}
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
                <Image alt={messages.about.imageOneAlt} className="object-cover" fill placeholder="blur" sizes="(min-width: 1024px) 34vw, 100vw" src={aboutImageOne} />
              </div>
              <div className="max-w-xl">
                <p className="mundus-eyebrow mb-6">{messages.about.eyebrow}</p>
                <h2 id="about-heading" className="font-display text-4xl font-[200] leading-[1.08] tracking-[-0.045em] text-ivory sm:text-5xl">
                  {messages.about.heading[0]}
                  <br />
                  {messages.about.heading[1]}
                </h2>
                <p className="mt-7 text-base leading-7 text-ivory/70 sm:text-lg">{messages.about.firstParagraph}</p>
              </div>
            </article>

            <article className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
              <div className="order-2 max-w-xl lg:order-1">
                <p className="mundus-eyebrow mb-6">{messages.about.secondEyebrow}</p>
                <h2 className="font-display text-4xl font-[200] leading-[1.08] tracking-[-0.045em] text-ivory sm:text-5xl">
                  {messages.about.secondHeading[0]}
                  <br />
                  {messages.about.secondHeading[1]}
                </h2>
                <p className="mt-7 text-base leading-7 text-ivory/70 sm:text-lg">{messages.about.secondParagraph}</p>
              </div>
              <div className="mundus-image-frame order-1 aspect-[4/5] sm:aspect-[5/4] lg:order-2">
                <Image alt={messages.about.imageTwoAlt} className="object-cover" fill placeholder="blur" sizes="(min-width: 1024px) 34vw, 100vw" src={aboutImageTwo} />
              </div>
            </article>
          </div>
        </section>

        <MenuAtlas locale={locale} />
        <MundusMoments locale={locale} />
        <Testimonials locale={locale} />
        <WhereToFind locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
