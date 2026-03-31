import { NextRequest, NextResponse } from "next/server";
import { canonicalizeVehicleMake, cleanVehicleModelName } from "@/lib/vehicle-data";

const fallbackModelsByMake: Record<string, string[]> = {
  Ford: ["F-150", "Explorer", "Escape", "Mustang", "Edge"],
  Chevrolet: ["Silverado", "Tahoe", "Equinox", "Malibu", "Traverse"],
  Toyota: ["Camry", "Corolla", "RAV4", "Tacoma", "Highlander"],
  Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey"],
  Nissan: ["Altima", "Rogue", "Sentra", "Pathfinder", "Frontier"],
};

export async function GET(request: NextRequest) {
  const year = request.nextUrl.searchParams.get("year")?.trim() || "";
  const makeInput = request.nextUrl.searchParams.get("make")?.trim() || "";
  const make = canonicalizeVehicleMake(makeInput) ?? makeInput;

  if (!year || !make) {
    return NextResponse.json({ models: [], fallback: true });
  }

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(
        make,
      )}/modelyear/${encodeURIComponent(year)}?format=json`,
      {
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!response.ok) {
      throw new Error("Vehicle models request failed");
    }

    const data = (await response.json()) as {
      Results?: Array<{ Model_Name?: string }>;
    };

    const models = Array.from(
      new Set(
        (data.Results ?? [])
          .map((item) => (item.Model_Name ? cleanVehicleModelName(item.Model_Name) : ""))
          .filter((item): item is string => Boolean(item)),
      ),
    )
      .filter(
        (item) =>
          item.length <= 40 &&
          !/incomplete|commercial|chassis cab|cutaway|school bus|transit bus/i.test(item),
      )
      .sort((first, second) => first.localeCompare(second));

    if (models.length === 0) {
      const fallbackModels = fallbackModelsByMake[make] ?? [];
      return NextResponse.json({ models: fallbackModels, fallback: true });
    }

    return NextResponse.json({ models: models.slice(0, 120), fallback: false });
  } catch {
    return NextResponse.json({
      models: fallbackModelsByMake[make] ?? [],
      fallback: true,
    });
  }
}
