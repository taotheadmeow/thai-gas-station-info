import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import type { StationPinColor } from "../lib/station-ui";
import "leaflet/dist/leaflet.css";

type StationMiniMapProps = {
  latitude: number;
  longitude: number;
  pinColor: StationPinColor;
  heightClassName?: string;
  pickerMode?: boolean;
  onLocationChange?: (location: { latitude: number; longitude: number }) => void;
};

function createPinIcon(color: StationPinColor) {
  const colorMap: Record<StationPinColor, string> = {
    blue: "#2563eb",
    green: "#16a34a",
    yellow: "#eab308",
    red: "#dc2626",
    gray: "#6b7280"
  };

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:28px;height:28px;transform:translate(-50%,-100%);">
        <div style="
          width:28px;
          height:28px;
          background:${colorMap[color]};
          border:3px solid white;
          border-radius:999px 999px 999px 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 10px rgba(0,0,0,0.30);
          position:absolute;
          left:0;
          top:0;
        "></div>
        <div style="
          width:10px;
          height:10px;
          background:white;
          border-radius:999px;
          position:absolute;
          left:9px;
          top:9px;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
}

function SyncMapCenter({
  latitude,
  longitude
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    const center = map.getCenter();
    const sameEnough =
      Math.abs(center.lat - latitude) < 0.000001 &&
      Math.abs(center.lng - longitude) < 0.000001;

    if (!sameEnough) {
      map.setView([latitude, longitude], map.getZoom(), { animate: false });
    }
  }, [latitude, longitude, map]);

  return null;
}

function CenterReporter({
  onLocationChange
}: {
  onLocationChange?: (location: { latitude: number; longitude: number }) => void;
}) {
  const map = useMap();

  useMapEvents({
    move() {
      const center = map.getCenter();
      onLocationChange?.({
        latitude: center.lat,
        longitude: center.lng
      });
    },
    moveend() {
      const center = map.getCenter();
      onLocationChange?.({
        latitude: center.lat,
        longitude: center.lng
      });
    },
    zoom() {
      const center = map.getCenter();
      onLocationChange?.({
        latitude: center.lat,
        longitude: center.lng
      });
    },
    zoomend() {
      const center = map.getCenter();
      onLocationChange?.({
        latitude: center.lat,
        longitude: center.lng
      });
    }
  });

  useEffect(() => {
    const center = map.getCenter();
    onLocationChange?.({
      latitude: center.lat,
      longitude: center.lng
    });
  }, [map, onLocationChange]);

  return null;
}

function FixedCenterPin({ color }: { color: StationPinColor }) {
  const pinHtml = useMemo(() => createPinIcon(color).options.html ?? "", [color]);

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-[700] -translate-x-1/2 -translate-y-full">
      <div dangerouslySetInnerHTML={{ __html: pinHtml }} />
    </div>
  );
}

export default function StationMiniMap({
  latitude,
  longitude,
  pinColor,
  heightClassName = "h-56",
  pickerMode = false,
  onLocationChange
}: StationMiniMapProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 ${heightClassName}`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        className="h-full w-full"
        zoomControl
        attributionControl
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <SyncMapCenter latitude={latitude} longitude={longitude} />
        {pickerMode && <CenterReporter onLocationChange={onLocationChange} />}
      </MapContainer>

      <FixedCenterPin color={pinColor} />
    </div>
  );
}