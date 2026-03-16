import type { FuelAvailability } from "./fuels";

export type GeoPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
};

export type StationApiRecord = {
  id?: string;
  _id?: string | { $oid?: string };
  last_updated: string;
  location: GeoPoint;
  name: string;
  is_open: boolean;
  availableFuels: Record<string, boolean | null>;
};

export type Station = {
  id?: string;
  lastUpdated: string;
  name: string;
  isOpen: boolean;
  latitude: number;
  longitude: number;
  availableFuels: FuelAvailability;
};

export type StationUpsertPayload = {
  name: string;
  is_open: boolean;
  location: GeoPoint;
  availableFuels: FuelAvailability;
  turnstileToken?: string;
};

export type PublicPermissions = {
  create: boolean;
  update: boolean;
  delete: boolean;
};

export type CreateStationFormData = {
  name: string;
  isOpen: boolean;
  latitude: number;
  longitude: number;
  availableFuels: FuelAvailability;
  turnstileToken?: string;
};

export type UpdateStationFormData = {
  name: string;
  isOpen: boolean;
  latitude: number;
  longitude: number;
  availableFuels: FuelAvailability;
  turnstileToken?: string;
};