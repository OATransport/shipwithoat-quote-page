export const vehicleTypes = [
  "Sedan",
  "SUV",
  "Truck",
  "Van",
  "Coupe",
  "Wagon",
  "Motorcycle",
  "Classic Car",
  "Luxury / Exotic",
  "Other",
] as const;

export const flexibilityOptions = ["Flexible", "Within 1 Week", "ASAP"] as const;

export const customerTypes = [
  "Individual",
  "Dealer",
  "Auction",
  "Broker",
  "Other",
] as const;

export const runningOptions = ["Yes", "No"] as const;

export const years = Array.from(
  { length: 40 },
  (_, index) => `${new Date().getFullYear() + 1 - index}`,
);
