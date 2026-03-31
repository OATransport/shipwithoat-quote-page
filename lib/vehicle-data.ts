export const curatedVehicleMakes = [
  "Acura",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "Ferrari",
  "FIAT",
  "Ford",
  "Genesis",
  "GMC",
  "Honda",
  "Hyundai",
  "INFINITI",
  "Jaguar",
  "Jeep",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Lotus",
  "Lucid",
  "Maserati",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "MINI",
  "Mitsubishi",
  "Nissan",
  "Polestar",
  "Porsche",
  "Ram",
  "Rivian",
  "Rolls-Royce",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
] as const;

const makeAliases = new Map<string, string>(
  curatedVehicleMakes.map((make) => [normalizeVehicleKey(make), make]),
);

makeAliases.set("MERCEDES", "Mercedes-Benz");
makeAliases.set("MERCEDESBENZ", "Mercedes-Benz");
makeAliases.set("ROLLSROYCE", "Rolls-Royce");
makeAliases.set("LANDROVER", "Land Rover");
makeAliases.set("ALFAROMEO", "Alfa Romeo");

export function normalizeVehicleKey(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export function canonicalizeVehicleMake(value: string) {
  return makeAliases.get(normalizeVehicleKey(value)) ?? null;
}

export function cleanVehicleModelName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
