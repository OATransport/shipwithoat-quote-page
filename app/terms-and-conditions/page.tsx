import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Organized Auto Transport",
  description:
    "Terms and Conditions for Organized Auto Transport quote requests and non-marketing SMS communications.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="shell overflow-x-hidden">
      <section className="mx-auto w-full max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <article className="card-surface rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: April 1, 2026</p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700 sm:text-base">
            <section>
              <h2 className="text-lg font-semibold text-slate-950">SMS Program Use</h2>
              <p className="mt-2">
                By opting in, you may receive non-marketing text messages from Organized Auto
                Transport related to quote requests, pricing follow-up, and transport updates.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-950">Frequency and Carrier Rates</h2>
              <p className="mt-2">
                Message frequency may vary. Message and data rates may apply based on your carrier
                plan.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-950">Help and Opt-Out</h2>
              <p className="mt-2">
                Text <strong>HELP</strong> for assistance. Text <strong>STOP</strong> to opt out of
                SMS messages at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-950">Consent and Purchase Terms</h2>
              <p className="mt-2">
                Consent to receive text messages is not a condition of purchase.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-950">Support Contact</h2>
              <p className="mt-2">
                For support, contact Organized Auto Transport at{" "}
                <a
                  href="mailto:support@shipwithoat.com"
                  className="font-semibold text-blue-800 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
                >
                  support@shipwithoat.com
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
