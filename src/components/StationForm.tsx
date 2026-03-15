import { useEffect, useState } from "react";
import { createEmptyFuelAvailability, FUEL_TYPES, type FuelAvailability } from "../lib/fuels";
import type { Station } from "../lib/types";

type StationFormProps = {
  mode: "create" | "edit";
  initialStation?: Station | null;
  defaultLatitude: number;
  defaultLongitude: number;
  canSubmit: boolean;
  onSubmit: (data: {
    name: string;
    isOpen: boolean;
    latitude: number;
    longitude: number;
    availableFuels: FuelAvailability;
  }) => Promise<void>;
  onCancelEdit?: () => void;
};

function nextTriState(value: boolean | null): boolean | null {
  if (value === null) return false;
  if (value === false) return true;
  return null;
}

function triStateLabel(value: boolean | null): string {
  if (value === null) return "Not sold";
  if (value === false) return "Empty";
  return "Ready";
}

function fuelClass(value: boolean | null): string {
  if (value === true) return "border-emerald-300 bg-emerald-50";
  if (value === false) return "border-amber-300 bg-amber-50";
  return "border-slate-200 bg-slate-50";
}

export default function StationForm({
  mode,
  initialStation,
  defaultLatitude,
  defaultLongitude,
  canSubmit,
  onSubmit,
  onCancelEdit
}: StationFormProps) {
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [latitude, setLatitude] = useState(defaultLatitude);
  const [longitude, setLongitude] = useState(defaultLongitude);
  const [availableFuels, setAvailableFuels] = useState<FuelAvailability>(createEmptyFuelAvailability());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialStation?.name ?? "");
    setIsOpen(initialStation?.isOpen ?? true);
    setLatitude(initialStation?.latitude ?? defaultLatitude);
    setLongitude(initialStation?.longitude ?? defaultLongitude);
    setAvailableFuels(initialStation?.availableFuels ?? createEmptyFuelAvailability());
  }, [initialStation, defaultLatitude, defaultLongitude]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        isOpen,
        latitude: Number(latitude),
        longitude: Number(longitude),
        availableFuels
      });

      if (mode === "create") {
        setName("");
        setIsOpen(true);
        setAvailableFuels(createEmptyFuelAvailability());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleFuel(key: keyof FuelAvailability) {
    setAvailableFuels((prev) => ({
      ...prev,
      [key]: nextTriState(prev[key])
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "Create station" : "Edit station"}
        </h2>
        {mode === "edit" && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Name</span>
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Station name"
            required
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
          />
          Open now
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">Latitude</span>
            <input
              type="number"
              step="any"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">Longitude</span>
            <input
              type="number"
              step="any"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              required
            />
          </label>
        </div>

        <div>
          <div className="mb-2 text-sm text-slate-600">Fuel availability</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FUEL_TYPES.map((fuel) => (
              <button
                key={fuel}
                type="button"
                onClick={() => toggleFuel(fuel)}
                className={`rounded-xl border p-3 text-left transition hover:shadow-sm ${fuelClass(
                  availableFuels[fuel]
                )}`}
              >
                <div className="font-medium">{fuel}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {triStateLabel(availableFuels[fuel])}
                </div>
              </button>
            ))}
          </div>
        </div>

        {!canSubmit && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Public access for this action is currently disabled by backend permission.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Saving..." : mode === "create" ? "Create station" : "Update station"}
        </button>
      </div>
    </form>
  );
}