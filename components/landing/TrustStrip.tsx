const items = [
  {
    title: "Fast Responses",
    description:
      "We review quote requests quickly so you can move forward with pricing and timing.",
  },
  {
    title: "Direct Support",
    description:
      "You’ll hear from Organized Auto Transport directly with clear next steps.",
  },
  {
    title: "Open Carrier Transport",
    description:
      "Built for straightforward vehicle shipping with practical, dependable transport planning.",
  },
  {
    title: "Clear Scheduling",
    description:
      "Pickup timing, route details, and expectations are kept simple and easy to follow.",
  },
];

export function TrustStrip() {
  return (
    <section aria-label="Trust highlights" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="soft-panel rounded-[2rem] px-6 py-6 sm:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] bg-white/60 p-5">
              <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
