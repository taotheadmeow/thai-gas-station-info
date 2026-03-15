import { useEffect, useRef, useState } from "react";
import CreateStationDialog from "./components/CreateStationDialog";
import EditStationDialog from "./components/EditStationDialog";
import MapView from "./components/MapView";
import StationDialog from "./components/StationDialog";
import {
  buildCreateStationPayload,
  buildUpdateStationPayload,
  createStation,
  deleteStation,
  fetchPublicPermissions,
  fetchStations,
  updateStation
} from "./lib/api";
import type {
  CreateStationFormData,
  PublicPermissions,
  Station,
  UpdateStationFormData
} from "./lib/types";

const DEFAULT_LAT = 13.8409997;
const DEFAULT_LNG = 100.4508963;

type DialogMode = "view" | "create" | "edit" | null;

const TURNSTILE_SITE_KEY =
  (globalThis as typeof globalThis & { __TURNSTILE_SITE_KEY__?: string })
    .__TURNSTILE_SITE_KEY__;

export default function App() {
  const [stations, setStations] = useState<Station[]>([]);
  const [permissions, setPermissions] = useState<PublicPermissions>({
    create: true,
    update: true,
    delete: true
  });

  const [mapCenter, setMapCenter] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [mapRadiusKm, setMapRadiusKm] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  async function loadPermissions() {
    try {
      const data = await fetchPublicPermissions();
      setPermissions(data);
    } catch {
      setPermissions({ create: true, update: true, delete: true });
    }
  }

  async function loadStations(lat: number, lng: number, radiusKm: number) {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchStations({
        latitude: lat,
        longitude: lng,
        radiusKm
      });
      setStations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPermissions();
  }, []);

  function handleViewportChanged(data: {
    center: { lat: number; lng: number };
    radiusKm: number;
  }) {
    setMapCenter(data.center);
    setMapRadiusKm(data.radiusKm);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      loadStations(data.center.lat, data.center.lng, data.radiusKm);
    }, 400);
  }

  async function handleCreate(form: CreateStationFormData) {
    if (!form.turnstileToken) {
      throw new Error("Missing captcha token");
    }

    await createStation(
      buildCreateStationPayload({
        name: form.name,
        isOpen: form.isOpen,
        latitude: form.latitude,
        longitude: form.longitude,
        availableFuels: form.availableFuels,
        turnstileToken: form.turnstileToken
      })
    );

    await loadStations(mapCenter.lat, mapCenter.lng, mapRadiusKm);
    setDialogMode(null);
  }

  async function handleUpdate(form: UpdateStationFormData) {
    if (!selectedStation?.id) {
      throw new Error("Missing station id");
    }

    await updateStation(
      selectedStation.id,
      buildUpdateStationPayload({
        name: form.name,
        isOpen: form.isOpen,
        latitude: form.latitude,
        longitude: form.longitude,
        availableFuels: form.availableFuels
      })
    );

    await loadStations(mapCenter.lat, mapCenter.lng, mapRadiusKm);
    setDialogMode(null);
  }

  async function handleDelete() {
    if (!selectedStation?.id) return;

    await deleteStation(selectedStation.id);
    await loadStations(mapCenter.lat, mapCenter.lng, mapRadiusKm);
    setDialogMode(null);
    setSelectedStation(null);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setMapCenter({
          lat: coords.latitude,
          lng: coords.longitude
        });
      },
      (geoError) => {
        setError(geoError.message);
      }
    );
  }

  const creating = dialogMode === "create";

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-100">
      <div className="absolute inset-0">
        <MapView
          initialCenter={[mapCenter.lat, mapCenter.lng]}
          stations={stations}
          creating={creating}
          onViewportChanged={handleViewportChanged}
          onMarkerClick={(station) => {
            setSelectedStation(station);
            setDialogMode("view");
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-4 z-[900] flex justify-center px-4">
        <div className="pointer-events-auto rounded-full bg-white/95 px-4 py-2 text-sm shadow-lg backdrop-blur">
          {creating
            ? `Create mode • move map to target location`
            : loading
              ? "Loading stations..."
              : `${stations.length} stations in view`}
        </div>
      </div>

      <div className="pointer-events-none absolute right-4 top-20 z-[900] flex flex-col gap-3">
        <button
          onClick={handleUseMyLocation}
          className="pointer-events-auto rounded-full bg-white px-4 py-3 text-sm font-medium shadow-lg hover:bg-slate-50"
        >
          Use My Location
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[900] flex justify-center px-4">
        {!creating ? (
          <button
            onClick={() => setDialogMode("create")}
            disabled={!permissions.create}
            className="pointer-events-auto rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-xl hover:bg-blue-700 disabled:bg-slate-300"
          >
            Create Station
          </button>
        ) : (
          <div className="pointer-events-auto flex gap-3">
            <button
              onClick={() => setDialogMode(null)}
              className="rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-800 shadow-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => setDialogMode("create")}
              className="rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-xl"
            >
              Pin at Center
            </button>
          </div>
        )}
      </div>

      {dialogMode === "view" && (
        <StationDialog
          open
          station={selectedStation}
          canUpdate={permissions.update}
          canDelete={permissions.delete}
          onClose={() => setDialogMode(null)}
          onEdit={() => setDialogMode("edit")}
          onDelete={handleDelete}
        />
      )}

      {dialogMode === "create" && (
        <CreateStationDialog
          open
          defaultLatitude={mapCenter.lat}
          defaultLongitude={mapCenter.lng}
          canCreate={permissions.create}
          siteKey={TURNSTILE_SITE_KEY}
          onClose={() => setDialogMode(null)}
          onSubmit={handleCreate}
        />
      )}

      {dialogMode === "edit" && (
        <EditStationDialog
          open
          station={selectedStation}
          canUpdate={permissions.update}
          onClose={() => setDialogMode("view")}
          onSubmit={handleUpdate}
        />
      )}

      {error && (
        <div className="absolute bottom-24 left-1/2 z-[950] -translate-x-1/2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 shadow-lg">
          {error}
        </div>
      )}
    </main>
  );
}