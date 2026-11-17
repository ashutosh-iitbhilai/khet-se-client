'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Circle, MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { farmPinIcon, homePinIcon } from './pin';

interface FarmMapProps {
  farm: { lat: number; lng: number; name: string };
  deliveryRadiusKm?: number;
  customer?: { lat: number; lng: number } | null;
}

/** Read-only map: the farm, its delivery area, and (optionally) the customer. */
export default function FarmMap({ farm, deliveryRadiusKm, customer }: FarmMapProps) {
  const bounds = customer
    ? L.latLngBounds([farm.lat, farm.lng], [customer.lat, customer.lng]).pad(0.3)
    : undefined;

  return (
    <MapContainer
      center={[farm.lat, farm.lng]}
      zoom={12}
      bounds={bounds}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {deliveryRadiusKm ? (
        <Circle
          center={[farm.lat, farm.lng]}
          radius={deliveryRadiusKm * 1000}
          pathOptions={{ color: '#2F6B3B', weight: 1, fillColor: '#2F6B3B', fillOpacity: 0.05 }}
        />
      ) : null}
      <Marker position={[farm.lat, farm.lng]} icon={farmPinIcon}>
        <Tooltip direction="top" offset={[0, -40]}>
          {farm.name}
        </Tooltip>
      </Marker>
      {customer && (
        <Marker position={[customer.lat, customer.lng]} icon={homePinIcon}>
          <Tooltip direction="top" offset={[0, -8]}>
            You
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}
