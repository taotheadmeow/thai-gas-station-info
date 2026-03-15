export const FUEL_TYPES = [
  "Premium Diesel",
  "Diesel",
  "B20",
  "Gasohol 95 (E10)",
  "Gasohol 91 (E10)",
  "E20",
  "Gasoline 95",
  "Premium Gasohol",
  "E85"
] as const;

export type FuelType = (typeof FUEL_TYPES)[number];
export type FuelAvailability = Record<FuelType, boolean | null>;

export function createEmptyFuelAvailability(): FuelAvailability {
  return {
    "Premium Diesel": null,
    "Diesel": null,
    "B20": null,
    "Gasohol 95 (E10)": null,
    "Gasohol 91 (E10)": null,
    "E20": null,
    "Gasoline 95": null,
    "Premium Gasohol": null,
    "E85": null
  };
}