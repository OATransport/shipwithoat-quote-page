import { NextResponse } from "next/server";
import { canonicalizeVehicleMake, curatedVehicleMakes } from "@/lib/vehicle-data";

const fallbackMakes = [...curatedVehicleMakes];

export async function GET() {
  try {
    const response = await fetch(
      "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json",
      {
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!response.ok) {
      throw new Error("Vehicle makes request failed");
    }

    const data = (await response.json()) as {
      Results?: Array<{ Make_Name?: string }>;
    };

    const makes = Array.from(
      new Set(
        (data.Results ?? [])
          .map((item) => (item.Make_Name ? canonicalizeVehicleMake(item.Make_Name) : null))
          .filter((item): item is string => Boolean(item)),
      ),
    ).sort((first, second) => first.localeCompare(second));

    if (makes.length === 0) {
      throw new Error("No vehicle makes returned");
    }

    return NextResponse.json({ makes, fallback: false });
  } catch {
    return NextResponse.json({ makes: fallbackMakes, fallback: true });
  }
}
