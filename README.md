# Organized Auto Transport Quote Landing Page

Standalone premium vehicle transport quote page for Organized Auto Transport, built with Next.js App Router, TypeScript, and Tailwind CSS. The project is designed to deploy cleanly to Vercel and live at a dedicated URL such as `/request-transport` or `get-a-quote`.

## What’s included

- Standalone landing page focused on quote requests only
- Spacious premium UI with mobile-first responsive layout
- Multi-step quote form with inline validation and polished success state
- Dynamic vehicle make/model loading from the free NHTSA vPIC API
- Free-tier U.S.-only address autocomplete via Nominatim with graceful manual-entry fallback
- Internal submission handler ready for future GoHighLevel webhook/API connection
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
  - Optional.
  - When set, `/api/quote` forwards the structured payload to this webhook.
  - Leave blank during local development.

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

Form submissions go to:

```text
/api/quote
```

The payload is structured like this:

```json
{
  "route": {
    "pickupAddress": "string",
    "deliveryAddress": "string",
    "pickupStructured": {},
    "deliveryStructured": {}
  },
  "vehicle": {
    "year": "string",
    "make": "string",
    "model": "string",
    "type": "string",
    "running": "Yes | No"
  },
  "shipment": {
    "firstAvailablePickupDate": "YYYY-MM-DD",
    "pickupFlexibility": "Flexible | Within 1 Week | ASAP",
    "customerType": "Individual | Dealer | Auction | Broker | Other",
    "notes": "string"
  },
  "contact": {
    "fullName": "string",
    "phone": "string",
    "email": "string",
    "consent": true
  },
  "attribution": {
    "utm_source": "string",
    "utm_medium": "string",
    "utm_campaign": "string",
    "utm_term": "string",
    "utm_content": "string",
    "gclid": "string",
    "fbclid": "string",
    "referrer": "string",
    "landing_page_url": "string"
  }
}
```

### Where to connect GoHighLevel later

Use `app/api/quote/route.ts`.

- If `GHL_WEBHOOK_URL` is set, the route forwards the payload directly to that webhook.
- If it is not set, the route logs the payload during development.
- This makes local testing easy while preserving the final production payload shape.

Typical GoHighLevel setup:

1. Create an inbound webhook in GoHighLevel or a lightweight middleware endpoint.
2. Add the webhook URL to `GHL_WEBHOOK_URL`.
3. Map `contact`, `vehicle`, `shipment`, `route`, and `attribution` fields into the desired contact/opportunity/custom fields.
4. Optionally enrich with tags like `source=quote-landing-page`.

## Deployment to Vercel

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Set the framework preset to Next.js if Vercel does not detect it automatically.
4. Add production environment variables:
   - `NEXT_PUBLIC_SITE_URL`
   - `GHL_WEBHOOK_URL` if ready
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
