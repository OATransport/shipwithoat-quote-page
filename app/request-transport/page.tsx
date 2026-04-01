import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { QuoteForm } from "@/components/form/QuoteForm";

export default function RequestTransportPage() {
  return (
    <main className="shell overflow-x-hidden">
      <section className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:px-8 lg:pt-16 xl:gap-20">
        <div className="flex flex-col justify-center lg:pr-4">
          <div className="soft-panel inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700">
            <span className="h-2 w-2 rounded-full bg-blue-700" aria-hidden />
            Premium vehicle transport quote request
          </div>
          <h1 className="mt-6 max-w-lg text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.05]">
            Request Your Vehicle Transport Quote
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">
            Share your route, vehicle, and timing details to receive pricing and availability from
            Organized Auto Transport.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-blue-700" aria-hidden />
              <p className="text-sm leading-6 text-slate-600">
                U.S. vehicle transport with direct support
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-blue-700" aria-hidden />
              <p className="text-sm leading-6 text-slate-600">
                Clean quote request with no obligation to book
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-blue-700" aria-hidden />
              <p className="text-sm leading-6 text-slate-600">
                Fast follow-up on pricing and availability
              </p>
            </div>
          </div>
        </div>

        <div className="lg:pl-2">
          <QuoteForm />
        </div>
      </section>

      <TrustStrip />
      <FaqSection />
      <FinalCta />
    </main>
  );
}
