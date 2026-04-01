import { SectionIntro } from "@/components/ui/SectionIntro";

const faqs = [
  {
    question: "How quickly will I hear back?",
    answer:
      "Most requests receive a response quickly during business hours, with pricing and availability based on your route details.",
  },
  {
    question: "What affects pricing?",
    answer:
      "Distance, route demand, vehicle size, running condition, timing, and pickup or delivery flexibility all influence final pricing.",
  },
  {
    question: "Can you transport non-running vehicles?",
    answer:
      "Yes. Just let us know the vehicle is not running so the quote can account for the right equipment and handling.",
  },
  {
    question: "Do I need exact addresses to request a quote?",
    answer:
      "No. A nearby city, ZIP code, or general area is enough to start. You can confirm exact locations later.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionIntro
        eyebrow="Common Questions"
        title="Quick answers before you request pricing"
        description="Everything on this page is built to keep the process simple, transparent, and easy to complete."
        align="center"
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <article key={faq.question} className="card-surface rounded-[1.75rem] p-6 sm:p-7">
            <h3 className="text-lg font-semibold text-slate-950">{faq.question}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
