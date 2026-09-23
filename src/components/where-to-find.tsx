import { business } from "../data/mundus-business";
import { getMessages, type Locale } from "../i18n";

export function WhereToFind({ locale }: { locale: Locale }) {
  const messages = getMessages(locale).visit;
  return (
    <section
      aria-labelledby="where-to-find-heading"
      className="mundus-parallax-background mundus-where-to-find relative isolate overflow-hidden"
      id="visit"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(11, 13, 12, 0.9), rgba(11, 13, 12, 0.7) 55%, rgba(11, 13, 12, 0.88)), url('/images/mundus-where-to-find-background.webp')",
      }}
    >
      <div className="mundus-container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mundus-eyebrow mb-6">{messages.eyebrow}</p>
          <h2
            className="font-display text-4xl font-[200] leading-[1.02] tracking-[-0.05em] text-ivory sm:text-5xl"
            id="where-to-find-heading"
          >
            {messages.heading[0]}
            <br />
            {messages.heading[1]}
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 lg:grid-cols-[0.9fr_1.1fr] sm:mt-12">
          <address className="flex min-h-80 flex-col justify-between border border-ivory/20 bg-onyx/65 p-8 not-italic backdrop-blur-sm sm:p-10">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-emerald">
                MUNDUS LOUNGE
              </p>
              <p className="mt-6 font-display text-3xl font-[200] leading-tight tracking-[-0.04em] text-ivory">
                {business.address.streetAddress}
                <br />
                {business.address.postalCode} {business.address.city}
              </p>
              <p className="mt-4 text-base text-ivory/65">
                {messages.neighbourhood}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                className="mundus-button mundus-button--outline"
                href={business.directionsUrl}
                rel="noreferrer"
                target="_blank"
              >
                {messages.directions}
              </a>
              <a className="mundus-button mundus-button--quiet" href={business.telephoneUrl}>
                {messages.callMundus}
              </a>
            </div>
          </address>

          <div className="border border-emerald/80 bg-onyx/70 p-8 backdrop-blur-sm sm:p-10">
            <h3 className="font-display text-3xl font-[200] tracking-[-0.04em] text-ivory">
              {messages.openingHours}
            </h3>
            <dl className="mt-7 divide-y divide-ivory/15">
              {business.openingHours.map((hours) => (
                <div className="flex items-center justify-between gap-6 py-3" key={hours.day}>
                  <dt className="text-sm text-ivory/80 sm:text-base">
                    {messages.days[hours.day] ?? hours.day}
                  </dt>
                  <dd className="text-right text-sm font-medium text-ivory sm:text-base">
                    {hours.display === "Closed" ? messages.closed : hours.display}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
