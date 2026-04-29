import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Loader2, Map as MapIcon } from "lucide-react";

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  destination: string;
}

export default function MapView({ destination }: MapViewProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocation() {
      try {
        setLoading(true);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`, {
          headers: { "User-Agent": "SanYushAI/1.0 (travel-planner-demo)" }
        });
        const data = await res.json();
        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (e) {
        console.error("Failed to geocode", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLocation();
  }, [destination]);

  if (loading) {
    return <div className="animate-pulse bg-muted rounded-xl p-4 mt-2 h-48 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  if (!position) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mt-2 shadow-sm animate-fade-in-up">
      <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
        <MapIcon className="w-4 h-4 text-travel-green" />
        Map: {destination}
      </h3>
      <div className="h-48 rounded-lg overflow-hidden border border-border z-0 relative">
        <MapContainer center={position} zoom={10} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>{destination}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
