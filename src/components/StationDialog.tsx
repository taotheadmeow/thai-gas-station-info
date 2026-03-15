import { FUEL_TYPES } from "../lib/fuels";
import {
  getStationPinColor,
  getStationPinLabel
} from "../lib/station-ui";
import type { Station } from "../lib/types";
import StationMiniMap from "./StationMiniMap";

type StationDialogProps = {
  open: boolean;
  station: Station | null;
  canUpdate: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function fuelLabel(value: boolean | null): string {
  if (value === true) return "Ready";
  if (value === false) return "Empty";
  return "Not sold";
}

export default function StationDialog({
  open,
  station,
  canUpdate,
  canDelete,
  onClose,
  onEdit,
  onDelete
}: StationDialogProps) {
  if (!open || !station) return null;

  const pinColor = getStationPinColor({
    isOpen: station.isOpen,
    availableFuels: station.availableFuels
  });

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-5 shadow-2xl">
        <StationMiniMap
          latitude={station.latitude}
          longitude={station.longitude}
          pinColor={pinColor}
        />

        <div className="mt-4 mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{station.name}</h2>
            <div className="mt-1 text-sm text-slate-600">
              {station.isOpen ? "Open" : "Closed"}
            </div>
            <div className="text-xs text-slate-500">
              Updated: {station.lastUpdated}
            </div>
            <div className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
              {getStationPinLabel(pinColor)}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FUEL_TYPES.map((fuel) => (
            <div key={fuel} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="font-medium">{fuel}</div>
              <div className="mt-1 text-sm text-slate-600">
                {fuelLabel(station.availableFuels[fuel])}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={onEdit}
            disabled={!canUpdate}
            className="rounded-2xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-slate-300"
          >
            Edit
          </button>

          <button
            onClick={onDelete}
            disabled={!canDelete}
            className="rounded-2xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:bg-slate-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}