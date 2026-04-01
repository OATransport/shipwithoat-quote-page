# Organized Auto Transport Quote Landing Page

Standalone premium vehicle transport quote page for Organized Auto Transport, built with Next.js App Router, TypeScript, and Tailwind CSS. The project is designed to deploy cleanly to Vercel and live at a dedicated URL such as `/request-transport` or `get-a-quote`.

## What’s included

- Standalone landing page focused on quote requests only
- Spacious premium UI with mobile-first responsive layout
- Multi-step quote form with inline validation and polished success state
- Dynamic vehicle make/model loading from the free NHTSA vPIC API
- Free-tier U.S.-only address autocomplete via Nominatim with graceful manual-entry fallback
- Quote submissions validated in `/api/quote` and forwarded to GoHighLevel when `GHL_WEBHOOK_URL` is set
- Hidden attribution capture for UTM values, `gclid`, `fbclid`, referrer, and landing page URL
- SEO-ready metadata, canonical support, Open Graph defaults, and semantic structure

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Zod

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env template:

```bash
cp .env.example .env.local
```

3. Start the dev server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000/request-transport
```

## Environment variables

Use `.env.local` for local development and Vercel project settings for production.

- `NEXT_PUBLIC_SITE_URL`
  - Public site URL used for metadata and canonical generation.
  - Local example: `http://localhost:3000`
  - Production example: `https://quotes.shipwithoat.com`

- `GHL_WEBHOOK_URL`
  - GoHighLevel (Lead Connector) inbound webhook URL.
  - When set, `/api/quote` POSTs a **flat** JSON body mapped for CRM workflows (see below).
  - Omit or leave empty to skip the webhook (payload is logged server-side for debugging).

- `NOMINATIM_API_URL`
  - Optional.
  - Defaults to the free Nominatim endpoint: `https://nominatim.openstreetmap.org/search`

- `ADDRESS_USER_AGENT`
  - Optional.
  - Sent by the server route when requesting address suggestions.

## How the address solution works

- The UI uses a refined autocomplete field for pickup and delivery.
- Client-side typing calls the internal route: `/api/address/autocomplete?q=...`
- That route requests suggestions from the free Nominatim geocoding API.
- Results are restricted to `countrycodes=us` and filtered again server-side to U.S. results only.
- Suggestions are normalized into a clean internal format with label, street, city, state, postal code, country, and optional coordinates.
- If the provider returns no useful results or is unavailable, the UI quietly falls back to manual entry. Users can still submit city/state, ZIP, or full addresses without seeing developer-oriented wording.

## How vehicle year/make/model loading works

- Year values are generated locally for a wide usable range.
- The make list loads from `/api/vehicle/makes`
- That route fetches NHTSA make data and filters it into a curated consumer-make list.
- The model list loads from `/api/vehicle/models?year=...&make=...`
- That route uses the selected year and make with the NHTSA vPIC make/year endpoint.
- If the API returns no results or is temporarily unavailable, the form falls back gracefully:
  - make search uses a curated common-make list
  - model search uses either a small curated fallback list or manual text entry

## Quote submission architecture

The browser POSTs a nested JSON body to `/api/quote`. The route validates it with Zod, then:

- If `GHL_WEBHOOK_URL` is set, the server POSTs a **flat** JSON object to that webhook (built in `lib/ghl-payload.ts`).
- If not set, the server logs that flat shape for local debugging.

**Client → `/api/quote` (nested)** — same shape the `QuoteForm` sends today (`route`, `vehicle`, `shipment`, `contact`, `attribution`).

**Server → GoHighLevel webhook (flat)** — field keys:

`firstName`, `lastName`, `fullName`, `email`, `phone`, `pickupAddress`, `pickupCity`, `pickupState`, `pickupZip`, `deliveryAddress`, `deliveryCity`, `deliveryState`, `deliveryZip`, `vehicleYear`, `vehicleMake`, `vehicleModel`, `vehicleType`, `vehicleRunning`, `pickupDate`, `pickupFlexibility`, `customerType`, `shipmentNotes`, `landing_page_url`, `utm_source`, `utm_medium`, `utm_campaign`

City, state, and ZIP are taken from structured address objects when the user picks a suggestion; otherwise those fields are empty strings while line addresses still contain what the user typed.

### GoHighLevel setup

1. Inbound webhook URL goes in `GHL_WEBHOOK_URL` (see `.env.example`).
2. In your GHL workflow, map the flat keys above to contact and custom fields.

## Deployment to Vercel

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Set the framework preset to Next.js if Vercel does not detect it automatically.
4. Add production environment variables:
   - `NEXT_PUBLIC_SITE_URL`
   - `GHL_WEBHOOK_URL` (production webhook URL)
   - optional Photon settings if desired
5. Deploy.

Vercel will build using:

```bash
npm install
npm run build
```

## Adding the live page to Wix later

You have two clean options:

1. Link out from Wix navigation or buttons directly to the deployed quote page URL, such as:
   - `https://quotes.shipwithoat.com/request-transport`

2. Embed the page in Wix with an iframe if you need it visually inside a Wix page.

Recommended approach:

- Use a dedicated subdomain or standalone URL and link to it from Wix.
- This keeps performance, analytics, and future CRM integrations simpler.

## Project structure

```text
app/
  api/
    address/autocomplete/route.ts
    quote/route.ts
    vehicle/makes/route.ts
    vehicle/models/route.ts
  request-transport/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  form/
    AddressAutocomplete.tsx
    QuoteForm.tsx
    StepHeader.tsx
  landing/
    FaqSection.tsx
    FinalCta.tsx
    TrustStrip.tsx
  ui/
    SectionIntro.tsx
lib/
  constants.ts
  types.ts
  utils.ts
.env.example
.gitignore
README.md
next.config.ts
next-env.d.ts
package.json
postcss.config.mjs
tsconfig.json
```

## Previewing before deploy

- Run `npm run dev`
- Visit `http://localhost:3000/request-transport`
- Test:
  - mobile responsive layout
  - route step validation
  - make/model loading
  - address suggestions
  - successful form submission
  - attribution capture by adding URL params like `?utm_source=google&gclid=test123`

## Notes

- This project is intentionally standalone and does not assume a broader site rebuild.
- The root route redirects to `/request-transport` so the app still behaves cleanly if deployed on its own.
# shipwithoat-quote-page
