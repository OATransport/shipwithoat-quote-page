import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildGoHighLevelPayload } from "@/lib/ghl-payload";

const structuredAddressSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  })
  .nullable()
  .optional();

const vehicleSchema = z.object({
  year: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  type: z.string().min(1),
  running: z.string().min(1),
});

const quoteSchema = z.object({
  route: z.object({
    pickupAddress: z.string().min(3),
    deliveryAddress: z.string().min(3),
    pickupStructured: structuredAddressSchema,
    deliveryStructured: structuredAddressSchema,
  }),
  vehicles: z.array(vehicleSchema).min(1),
  shipment: z.object({
    firstAvailablePickupDate: z.string().min(1),
    pickupFlexibility: z.string().min(1),
    customerType: z.string().min(1),
    notes: z.string(),
  }),
  contact: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().email(),
    consent: z.literal(true),
  }),
  attribution: z.object({
    utm_source: z.string(),
    utm_medium: z.string(),
    utm_campaign: z.string(),
    utm_term: z.string(),
    utm_content: z.string(),
    gclid: z.string(),
    fbclid: z.string(),
    referrer: z.string(),
    landing_page_url: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please review the highlighted fields and try again.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const ghlBody = buildGoHighLevelPayload(parsed.data);
    const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL?.trim();

    if (ghlWebhookUrl) {
      const webhookResponse = await fetch(ghlWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ghlBody),
      });

      if (!webhookResponse.ok) {
        return NextResponse.json(
          {
            ok: false,
            message: "The quote was captured, but the downstream webhook was unavailable.",
          },
          { status: 502 },
        );
      }
    } else {
      console.log("GHL_WEBHOOK_URL not set; quote payload (GoHighLevel shape):", JSON.stringify(ghlBody, null, 2));
    }

    return NextResponse.json({
      ok: true,
      message: "Quote request submitted successfully.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "We couldn't process the quote request.",
      },
      { status: 500 },
    );
  }
}
