import { FUEL_TYPES, type FuelAvailability } from "./fuels";

export type StationPinColor = "blue" | "green" | "yellow" | "red" | "gray";

const DIESEL_FUELS = new Set([
  "Premium Diesel",
  "Diesel",
  "B20"
] as const);

const GASOLINE_FUELS = new Set([
  "Gasohol 95 (E10)",
  "Gasohol 91 (E10)",
  "E20",
  "Gasoline 95",
  "Premium Gasohol",
  "E85"
] as const);

export function isFuelAvailable(value: boolean | null): boolean {
  return value === true;
}

export function getStationPinColor(params: {
  isOpen: boolean;
  availableFuels: FuelAvailability;
}): StationPinColor {
  const { isOpen, availableFuels } = params;

  if (!isOpen) {
    return "gray";
  }

  const soldFuels = FUEL_TYPES.filter((fuel) => availableFuels[fuel] !== null);
  const readyFuels = FUEL_TYPES.filter((fuel) => availableFuels[fuel] === true);

  const allSoldFuelsReady =
    soldFuels.length > 0 &&
    soldFuels.every((fuel) => availableFuels[fuel] === true);

  if (allSoldFuelsReady) {
    return "blue";
  }

  const hasDieselFamily = Array.from(DIESEL_FUELS).some(
    (fuel) => availableFuels[fuel] === true
  );

  const hasGasolineFamily = Array.from(GASOLINE_FUELS).some(
    (fuel) => availableFuels[fuel] === true
  );

  if (hasDieselFamily && hasGasolineFamily) {
    return "green";
  }

  if (hasDieselFamily || hasGasolineFamily) {
    return "yellow";
  }

  return "red";
}

export function getStationPinLabel(color: StationPinColor): string {
  switch (color) {
    case "blue":
      return "All sold fuels are ready";
    case "green":
      return "Diesel + gasoline available";
    case "yellow":
      return "Only one fuel family available";
    case "red":
      return "Open but no fuel available";
    case "gray":
      return "Closed";
  }
}