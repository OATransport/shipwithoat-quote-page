import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Organized Auto Transport",
  description:
    "Privacy Policy for Organized Auto Transport quote requests, contact handling, and SMS consent practices.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="shell overflow-x-hidden">
      <section className="mx-auto w-full max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <article className="card-surface rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: April 1, 2026</p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700 sm:text-base">
            <section>
              <h2 className="text-lg font-semibold text-slate-950">Information We Collect</h2>
              <p className="mt-2">
                Organized Auto Transport collects information you submit through our quote form,
                including route details, vehicle details, shipment timing preferences, full name,
                phone number, email address, and optional notes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-950">How We Use Contact Information</h2>
              <p className="mt-2">
                We use your contact information to review your request, provide quote pricing and
                availability, answer questions, and share operational updates related to your
                transport request.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-950">SMS Consent</h2>
              <p className="mt-2">
                If you opt in to SMS, we use your phone number for non-marketing customer care
                messages related to quote requests, pricing follow-up, and transport updates.
                SMS consent is not shared with third parties for their marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-950">Data Sharing and Protection</h2>
              <p className="mt-2">
                We limit access to your information to personnel and service providers who support
                quote processing and customer communication. We apply reasonable safeguards to
                protect submitted information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-950">Contact Us</h2>
              <p className="mt-2">
                For privacy questions, contact Organized Auto Transport at{" "}
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
