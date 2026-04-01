export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="card-surface rounded-[2rem] px-6 py-10 text-center sm:px-10 sm:py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-800">
          No obligation
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Requesting a quote is simple, fast, and pressure-free
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Share the route, vehicle, and timing details that matter. Organized Auto Transport can
          review your request and send back pricing with availability.
        </p>
        <a href="#quote-form" className="primary-button mt-8">
          Start your quote
        </a>
      </div>
    </section>
  );
}
