import { NextRequest, NextResponse } from "next/server";
import { AddressSuggestion } from "@/lib/types";

const nominatimBaseUrl =
  process.env.NOMINATIM_API_URL || "https://nominatim.openstreetmap.org/search";
const userAgent = process.env.ADDRESS_USER_AGENT || "OrganizedAutoTransportQuote/1.0";

function buildUsLabel(address: Record<string, unknown>) {
  const street = [address.house_number, address.road].filter(Boolean).join(" ").trim();
  const city =
    typeof address.city === "string"
      ? address.city
      : typeof address.town === "string"
        ? address.town
        : typeof address.village === "string"
          ? address.village
          : typeof address.hamlet === "string"
            ? address.hamlet
            : "";
  const state = typeof address.state === "string" ? address.state : "";
  const postalCode = typeof address.postcode === "string" ? address.postcode : "";

  return [street, city, state, postalCode].filter(Boolean).join(", ");
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (query.length < 3) {
    return NextResponse.json({ suggestions: [] satisfies AddressSuggestion[] });
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      addressdetails: "1",
      limit: "6",
      countrycodes: "us",
      dedupe: "1",
    });

    const response = await fetch(`${nominatimBaseUrl}?${params.toString()}`, {
      headers: {
        "User-Agent": userAgent,
        "Accept-Language": "en-US,en",
      },
      next: { revalidate: 60 * 30 },
    });

    if (!response.ok) {
      throw new Error("Autocomplete provider failed");
    }

    const data = (await response.json()) as Array<{
      place_id?: number;
      lat?: string;
      lon?: string;
      address?: Record<string, unknown>;
      display_name?: string;
    }>;

    const rawSuggestions: Array<AddressSuggestion | null> = data.map((item) => {
      const address = item.address ?? {};
      const countryCode =
        typeof address.country_code === "string"
          ? address.country_code.toLowerCase()
          : "us";

      if (countryCode !== "us") {
        return null;
      }

      const label = buildUsLabel(address);

      if (!label || !item.place_id) {
          return null;
        }

        return {
          id: String(item.place_id),
          label,
          street:
            typeof address.road === "string"
              ? [address.house_number, address.road].filter(Boolean).join(" ")
              : undefined,
          city:
            typeof address.city === "string"
              ? address.city
              : typeof address.town === "string"
                ? address.town
                : typeof address.village === "string"
                  ? address.village
                  : undefined,
          state: typeof address.state === "string" ? address.state : undefined,
          postalCode: typeof address.postcode === "string" ? address.postcode : undefined,
          country: "United States",
          latitude: item.lat ? Number(item.lat) : undefined,
          longitude: item.lon ? Number(item.lon) : undefined,
        } satisfies AddressSuggestion;
      });

    const suggestions = rawSuggestions.filter(
      (value): value is AddressSuggestion => value !== null,
    );

    return NextResponse.json({
      suggestions,
      fallback: suggestions.length === 0,
    });
  } catch {
    return NextResponse.json({
      suggestions: [] satisfies AddressSuggestion[],
      fallback: true,
    });
  }
}
