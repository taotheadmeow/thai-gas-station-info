import { useMemo, useEffect, useState } from "react";
import {
  createEmptyFuelAvailability,
  FUEL_TYPES,
  type FuelAvailability
} from "../lib/fuels";
import { getStationPinColor, getStationPinLabel } from "../lib/station-ui";
import type { Station, UpdateStationFormData } from "../lib/types";
import FuelStatusSelector from "./FuelStatusSelector";
import StationMiniMap from "./StationMiniMap";
import TurnstileWidget from "./TurnstileWidget";

type EditStationDialogProps = {
  open: boolean;
  station: Station | null;
  canUpdate: boolean;
  siteKey?: string;
  onClose: () => void;
  onSubmit: (data: UpdateStationFormData) => Promise<void>;
};

export default function EditStationDialog({
  open,
  station,
  canUpdate,
  siteKey,
  onClose,
  onSubmit
}: EditStationDialogProps) {
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [availableFuels, setAvailableFuels] = useState<FuelAvailability>(
    createEmptyFuelAvailability()
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCaptcha = useMemo(() => Boolean(siteKey), [siteKey]);

  useEffect(() => {
    if (!station) return;
    setName(station.name);
    setIsOpen(station.isOpen);
    setLatitude(station.latitude);
    setLongitude(station.longitude);
    setAvailableFuels(station.availableFuels);
  }, [station]);

  if (!open || !station) return null;

  const pinColor = getStationPinColor({
    isOpen,
    availableFuels
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUpdate) return;

    if (hasCaptcha && !turnstileToken) {
      setError("Please complete the captcha before creating a station.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        isOpen,
        latitude,
        longitude,
        availableFuels,
        turnstileToken: turnstileToken ?? undefined
      });
      setTurnstileToken(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-5 shadow-2xl">
        <StationMiniMap
          latitude={latitude}
          longitude={longitude}
          pinColor={pinColor}
        />

        <div className="mt-4 mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Edit station</h2>
            <div className="mt-1 text-sm text-slate-600">{station.name}</div>
            <div className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
              {getStationPinLabel(pinColor)}
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-1 gap-3">
            {FUEL_TYPES.map((fuel) => (
              <FuelStatusSelector
                key={fuel}
                label={fuel}
                value={availableFuels[fuel]}
                onChange={(value) =>
                  setAvailableFuels((prev) => ({
                    ...prev,
                    [fuel]: value
                  }))
                }
              />
            ))}
          </div>
          {hasCaptcha && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 text-sm font-medium text-slate-700">
                          Verify before creating
                        </div>
                        <TurnstileWidget siteKey={siteKey!} onTokenChange={setTurnstileToken} />
                      </div>
                    )}

          {!canUpdate && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Public update permission is currently disabled by backend.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canUpdate || submitting}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Saving..." : "Update station"}
          </button>
        </form>
      </div>
    </div>
  );
}