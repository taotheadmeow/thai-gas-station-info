import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { StationPinColor } from "../lib/station-ui";

type StationMiniMapProps = {
  latitude: number;
  longitude: number;
  pinColor: StationPinColor;
  heightClassName?: string;
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
      <div style="position:relative;width:24px;height:24px;transform:translate(-50%,-100%);">
        <div style="
          width:24px;
          height:24px;
          background:${colorMap[color]};
          border:3px solid white;
          border-radius:999px 999px 999px 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,0.28);
          position:absolute;
          left:0;
          top:0;
        "></div>
        <div style="
          width:8px;
          height:8px;
          background:white;
          border-radius:999px;
          position:absolute;
          left:8px;
          top:8px;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
}

export default function StationMiniMap({
  latitude,
  longitude,
  pinColor,
  heightClassName = "h-56"
}: StationMiniMapProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 ${heightClassName}`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        className="h-full w-full"
        zoomControl
        attributionControl
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker
          position={[latitude, longitude]}
          icon={createPinIcon(pinColor)}
        />
      </MapContainer>
    </div>
  );
}