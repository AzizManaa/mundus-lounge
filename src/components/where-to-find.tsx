const openingHours = [
  ["Monday", "Closed"],
  ["Tuesday", "16:00–01:00"],
  ["Wednesday", "16:00–01:00"],
  ["Thursday", "16:00–01:00"],
  ["Friday", "17:00–02:00"],
  ["Saturday", "17:00–02:00"],
  ["Sunday", "16:00–01:00"],
];

export function WhereToFind() {
  return (
    <section
      aria-labelledby="where-to-find-heading"
      className="mundus-parallax-background mundus-where-to-find relative isolate overflow-hidden"
      id="visit"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(11, 13, 12, 0.9), rgba(11, 13, 12, 0.7) 55%, rgba(11, 13, 12, 0.88)), url('/images/mundus-where-to-find-background.png')",
      }}
    >
      <div className="mundus-container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mundus-eyebrow mb-6">Where to find us</p>
          <h2
            className="font-display text-4xl font-[200] leading-[1.02] tracking-[-0.05em] text-ivory sm:text-5xl"
            id="where-to-find-heading"
          >
            Your next slow evening
            <br />
            starts in Eixample
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 lg:grid-cols-[0.9fr_1.1fr] sm:mt-12">
          <address className="flex min-h-80 flex-col justify-between border border-ivory/20 bg-onyx/65 p-8 not-italic backdrop-blur-sm sm:p-10">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-emerald">
                MUNDUS LOUNGE
              </p>
              <p className="mt-6 font-display text-3xl font-[200] leading-tight tracking-[-0.04em] text-ivory">
                C/ de Padilla, 177
                <br />
                08013 Barcelona
              </p>
              <p className="mt-4 text-base text-ivory/65">
                Eixample, near Sagrada Família
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                className="mundus-button mundus-button--outline"
                href="https://www.google.com/maps/search/?api=1&query=C%2F%20de%20Padilla%2C%20177%2C%2008013%20Barcelona"
                rel="noreferrer"
                target="_blank"
              >
                Get directions
              </a>
              <a className="mundus-button mundus-button--quiet" href="tel:+34931058358">
                Call Mundus
              </a>
            </div>
          </address>

          <div className="border border-emerald/80 bg-onyx/70 p-8 backdrop-blur-sm sm:p-10">
            <h3 className="font-display text-3xl font-[200] tracking-[-0.04em] text-ivory">
              Opening hours
            </h3>
            <dl className="mt-7 divide-y divide-ivory/15">
              {openingHours.map(([day, hours]) => (
                <div className="flex items-center justify-between gap-6 py-3" key={day}>
                  <dt className="text-sm text-ivory/80 sm:text-base">{day}</dt>
                  <dd className="text-right text-sm font-medium text-ivory sm:text-base">
                    {hours}
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
