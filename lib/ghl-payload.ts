import type { QuotePayload, QuoteVehicle } from "@/lib/types";

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }
  const space = trimmed.indexOf(" ");
  if (space === -1) {
    return { firstName: trimmed, lastName: "" };
  }
  return {
    firstName: trimmed.slice(0, space),
    lastName: trimmed.slice(space + 1).trim(),
  };
}

function runningLabel(running: string): string {
  if (running === "Yes") return "Running";
  if (running === "No") return "Not running";
  return running;
}

export function buildVehiclesSummary(vehicles: QuoteVehicle[]): string {
  return vehicles
    .map(
      (v, i) =>
        `${i + 1}. ${v.year} ${v.make} ${v.model} - ${v.type} - ${runningLabel(v.running)}`,
    )
    .join("\n");
}

/**
 * Flat JSON body for GoHighLevel / Lead Connector inbound webhooks.
 * Field names are stable for workflow custom field mapping.
 * First vehicle is duplicated into legacy single-vehicle keys for existing workflows.
 */
export function buildGoHighLevelPayload(data: QuotePayload): Record<string, string> {
  const { firstName, lastName } = splitFullName(data.contact.fullName);
  const first = data.vehicles[0]!;

  return {
    firstName,
    lastName,
    fullName: data.contact.fullName.trim(),
    email: data.contact.email,
    phone: data.contact.phone,
    smsConsent: data.contact.smsConsent ? "Yes" : "No",
    pickupAddress: data.route.pickupAddress,
    pickupCity: data.route.pickupStructured?.city ?? "",
    pickupState: data.route.pickupStructured?.state ?? "",
    pickupZip: data.route.pickupStructured?.postalCode ?? "",
    deliveryAddress: data.route.deliveryAddress,
    deliveryCity: data.route.deliveryStructured?.city ?? "",
    deliveryState: data.route.deliveryStructured?.state ?? "",
    deliveryZip: data.route.deliveryStructured?.postalCode ?? "",
    vehicleYear: first.year,
    vehicleMake: first.make,
    vehicleModel: first.model,
    vehicleType: first.type,
    vehicleRunning: first.running,
    vehicleCount: String(data.vehicles.length),
    vehiclesSummary: buildVehiclesSummary(data.vehicles),
    pickupDate: data.shipment.firstAvailablePickupDate,
    pickupFlexibility: data.shipment.pickupFlexibility,
    customerType: data.shipment.customerType,
    shipmentNotes: data.shipment.notes,
    landing_page_url: data.attribution.landing_page_url,
    utm_source: data.attribution.utm_source,
    utm_medium: data.attribution.utm_medium,
    utm_campaign: data.attribution.utm_campaign,
  };
}
