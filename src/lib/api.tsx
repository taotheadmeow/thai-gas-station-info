import { createEmptyFuelAvailability, FUEL_TYPES } from "./fuels";
import type {
  PublicPermissions,
  Station,
  StationApiRecord,
  StationUpsertPayload
} from "./types";

const API_BASE_URL =
  (globalThis as typeof globalThis & { __APP_API_BASE_URL__?: string }).__APP_API_BASE_URL__ ||
  "http://localhost:8788";

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

function normalizeStationId(item: StationApiRecord): string | undefined {
  if (typeof item.id === "string") return item.id;
  if (typeof item._id === "string") return item._id;
  if (item._id && typeof item._id === "object" && item._id.$oid) return item._id.$oid;
  return undefined;
}

function normalizeAvailableFuels(
  input: Record<string, boolean | null> | undefined
): Station["availableFuels"] {
  const base = createEmptyFuelAvailability();

  if (!input) return base;

  for (const fuel of FUEL_TYPES) {
    const value = input[fuel];
    if (value === true || value === false || value === null) {
      base[fuel] = value;
    }
  }

  return base;
}

export async function fetchStations(params: {
  latitude: number;
  longitude: number;
  radiusKm: number;
}): Promise<Station[]> {
  const query = new URLSearchParams({
    coordinate: `${params.latitude},${params.longitude}`,
    radius: String(params.radiusKm)
  });

  const response = await fetch(buildUrl(`/api/stations?${query.toString()}`), {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stations: ${response.status}`);
  }

  const data = (await response.json()) as StationApiRecord[];

  return data.map((item) => {
    const [lng, lat] = item.location.coordinates;

    return {
      id: normalizeStationId(item),
      lastUpdated: item.last_updated,
      name: item.name,
      isOpen: item.is_open,
      latitude: lat,
      longitude: lng,
      availableFuels: normalizeAvailableFuels(item.availableFuels)
    };
  });
}

export async function fetchPublicPermissions(): Promise<PublicPermissions> {
  const response = await fetch(buildUrl("/api/permissions/public"), {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    return {
      create: true,
      update: true,
      delete: true
    };
  }

  const data = (await response.json()) as Partial<PublicPermissions>;

  return {
    create: Boolean(data.create),
    update: Boolean(data.update),
    delete: Boolean(data.delete)
  };
}

export async function createStation(payload: StationUpsertPayload): Promise<void> {
  const response = await fetch(buildUrl("/api/stations"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function updateStation(id: string, payload: StationUpsertPayload): Promise<void> {
  const response = await fetch(buildUrl(`/api/stations/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function deleteStation(id: string): Promise<void> {
  const response = await fetch(buildUrl(`/api/stations/${id}`), {
    method: "DELETE",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export function buildCreateStationPayload(input: {
  name: string;
  isOpen: boolean;
  latitude: number;
  longitude: number;
  availableFuels: Station["availableFuels"];
  turnstileToken: string;
}): StationUpsertPayload {
  return {
    name: input.name,
    is_open: input.isOpen,
    location: {
      type: "Point",
      coordinates: [input.longitude, input.latitude]
    },
    availableFuels: input.availableFuels,
    turnstileToken: input.turnstileToken
  };
}

export function buildUpdateStationPayload(input: {
  name: string;
  isOpen: boolean;
  latitude: number;
  longitude: number;
  availableFuels: Station["availableFuels"];
}): StationUpsertPayload {
  return {
    name: input.name,
    is_open: input.isOpen,
    location: {
      type: "Point",
      coordinates: [input.longitude, input.latitude]
    },
    availableFuels: input.availableFuels
  };
}