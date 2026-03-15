import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { getStationPinColor } from "../lib/station-ui";
import type { Station } from "../lib/types";

type MapViewProps = {
  initialCenter: [number, number];
  stations: Station[];
  creating: boolean;
  onViewportChanged: (data: {
    center: { lat: number; lng: number };
    radiusKm: number;
  }) => void;
  onMarkerClick: (station: Station) => void;
};

function createPinIcon(color: "blue" | "green" | "yellow" | "red" | "gray") {
  const colorMap = {
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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

function MapViewportListener({
  onViewportChanged
}: {
  onViewportChanged: MapViewProps["onViewportChanged"];
}) {
  const map = useMap();

  function emitViewport() {
    const center = map.getCenter();
    const bounds = map.getBounds();
    const east = bounds.getEast();
    const radiusKm = haversineKm(center.lat, center.lng, center.lat, east);

    onViewportChanged({
      center: { lat: center.lat, lng: center.lng },
      radiusKm: Math.max(1, Math.ceil(radiusKm))
    });
  }

  useEffect(() => {
    emitViewport();
  }, []);

  useMapEvents({
    moveend: emitViewport,
    zoomend: emitViewport
  });

  return null;
}

function CenterCrosshair() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-[700] -translate-x-1/2 -translate-y-1/2">
      <div className="relative h-10 w-10">
        <div className="absolute left-1/2 top-0 h-10 w-[2px] -translate-x-1/2 bg-blue-600/80" />
        <div className="absolute left-0 top-1/2 h-[2px] w-10 -translate-y-1/2 bg-blue-600/80" />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 shadow" />
      </div>
    </div>
  );
}

export default function MapView({
  initialCenter,
  stations,
  creating,
  onViewportChanged,
  onMarkerClick
}: MapViewProps) {
  const markers = useMemo(
    () =>
      stations.map((station, index) => ({
        key: `${station.id ?? station.name}-${index}`,
        station,
        icon: createPinIcon(
          getStationPinColor({
            isOpen: station.isOpen,
            availableFuels: station.availableFuels
          })
        )
      })),
    [stations]
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer center={initialCenter} zoom={12} className="h-full w-full" zoomControl>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewportListener onViewportChanged={onViewportChanged} />

        {markers.map(({ key, station, icon }) => (
          <Marker
            key={key}
            position={[station.latitude, station.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onMarkerClick(station)
            }}
          />
        ))}
      </MapContainer>

      {creating && <CenterCrosshair />}
    </div>
  );
}