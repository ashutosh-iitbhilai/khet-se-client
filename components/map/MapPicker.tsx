'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { farmPinIcon as pinIcon } from './pin';

export interface LatLng {
  lat: number;
  lng: number;
}

function ClickToPlace({ onChange }: { onChange: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/** Re-centres the map when the value changes from outside (search / GPS). */
function FlyTo({ value }: { value: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.flyTo([value.lat, value.lng], Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

interface MapPickerProps {
  value: LatLng | null;
  onChange: (p: LatLng) => void;
  /** Draws the delivery radius around the pin. */
  radiusKm?: number;
  /** Map centre before a pin is placed. Defaults to Raipur, Chhattisgarh. */
  fallbackCenter?: LatLng;
}

export default function MapPicker({ value, onChange, radiusKm, fallbackCenter = { lat: 21.2514, lng: 81.6296 } }: MapPickerProps) {
  const center = value ?? fallbackCenter;

  const markerHandlers = useMemo(
    () => ({
      dragend: (e: L.DragEndEvent) => {
        const p = (e.target as L.Marker).getLatLng();
        onChange({ lat: p.lat, lng: p.lng });
      },
    }),
    [onChange],
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={value ? 14 : 11}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onChange={onChange} />
      <FlyTo value={value} />
      {value && (
        <>
          <Marker position={[value.lat, value.lng]} icon={pinIcon} draggable eventHandlers={markerHandlers} />
          {radiusKm ? (
            <Circle
              center={[value.lat, value.lng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: '#2F6B3B', weight: 1, fillColor: '#2F6B3B', fillOpacity: 0.06 }}
            />
          ) : null}
        </>
      )}
    </MapContainer>
  );
}
