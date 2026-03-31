const items = [
  {
    title: "Fast responses",
    description: "Quote requests are reviewed quickly so you can plan with confidence.",
  },
  {
    title: "Direct support",
    description: "Clear communication from a real transport team, not a maze of handoffs.",
  },
  {
    title: "Reliable transport",
    description: "Built for straightforward scheduling, dependable routing, and smooth delivery.",
  },
  {
    title: "Clear communication",
    description: "We keep details organized so pickup timing and expectations stay easy to follow.",
  },
];

export function TrustStrip() {
  return (
    <section aria-label="Trust highlights" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="soft-panel rounded-[2rem] px-6 py-6 sm:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] bg-white/60 p-5">
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
