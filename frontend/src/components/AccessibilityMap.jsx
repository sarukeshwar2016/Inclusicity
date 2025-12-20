import { useEffect, useState, useRef } from 'react';
import { Navigation, Search, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

// 👉 TEMP: keep your mock data import same way
import {
  mockAccessibleLocations,
  calculateRouteAccessibility,
  getAccessibilityColor,
  accessibilityFeatures
} from '../lib/accessibility-data';

const AccessibilityMap = () => {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [showFeatures, setShowFeatures] = useState(true);

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    loadLeaflet();
    return () => map && map.remove();
  }, []);

  const loadLeaflet = async () => {
    const L = (await import('leaflet')).default;

    const mapInstance = L.map(mapRef.current).setView([13.0827, 80.2707], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    setMap(mapInstance);

    navigator.geolocation?.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      L.marker([latitude, longitude])
        .addTo(mapInstance)
        .bindPopup('You are here')
        .openPopup();

      mapInstance.setView([latitude, longitude], 14);
    });

    addAccessibilityMarkers(mapInstance, L);
  };

  const addAccessibilityMarkers = (mapInstance, L) => {
    mockAccessibleLocations.forEach(loc => {
      const color = getAccessibilityColor(loc.score);

      const icon = L.divIcon({
        html: `<div style="background:${color};width:30px;height:30px;border-radius:50%;color:white;
               display:flex;align-items:center;justify-content:center;">${loc.score}</div>`
      });

      L.marker([loc.lat, loc.lng], { icon })
        .addTo(mapInstance)
        .bindPopup(`<b>${loc.name}</b><br/>Score: ${loc.score}/5`);
    });
  };

  const handleFindRoute = async () => {
    if (!searchFrom || !searchTo) return;

    const accessibility = calculateRouteAccessibility([searchFrom, searchTo]);
    setRouteInfo(accessibility);
  };

  return (
    <div className="flex gap-4 h-full">
      {/* MAP */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="h-full w-full rounded-xl shadow" />
      </div>

      {/* SEARCH PANEL */}
      <div className="w-96 bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-bold mb-4">Find Accessible Route</h2>

        <input
          className="w-full border p-2 mb-2"
          placeholder="From"
          value={searchFrom}
          onChange={e => setSearchFrom(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-2"
          placeholder="To"
          value={searchTo}
          onChange={e => setSearchTo(e.target.value)}
        />

        <button
          onClick={handleFindRoute}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Find Route
        </button>

        {routeInfo && (
          <div className="mt-4 p-3 bg-green-50 rounded">
            <p className="font-semibold">
              Accessibility Score: {routeInfo.score}/5
            </p>
            <p className="text-sm">{routeInfo.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityMap;
