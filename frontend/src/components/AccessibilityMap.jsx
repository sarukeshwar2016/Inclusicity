// src/components/AccessibilityMap.jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAccessibilityColor, accessibilityFeatures } from '../lib/accessibility-data';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

const ICON_URLS = {
  busstand: 'https://img.icons8.com/color/96/bus.png',
  transport: 'https://img.icons8.com/color/96/subway.png',
  hospital: 'https://img.icons8.com/color/96/hospital.png',
  cafe: 'https://img.icons8.com/color/96/coffee.png',
  mall: 'https://img.icons8.com/color/96/shopping-mall.png',
  park: 'https://img.icons8.com/color/96/tree.png',
  tourist: 'https://img.icons8.com/color/96/camera.png',
};

const makeIcon = (url, size = 40) =>
  L.divIcon({
    html: `<img src="${url}" style="width:${size}px; height:${size}px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" />`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    className: 'custom-marker-icon',
  });

const makeHighlightIcon = (url) =>
  L.divIcon({
    html: `<div style="position:relative"><img src="${url}" style="width:52px; height:52px; filter: drop-shadow(0 0 8px #4F46E5);" /><div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;background:#4F46E5;border-radius:50%;border:2px solid white;"></div></div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 52],
    popupAnchor: [0, -52],
    className: 'custom-marker-icon',
  });

const ICONS = Object.fromEntries(
  Object.entries(ICON_URLS).map(([k, v]) => [k, makeIcon(v)])
);
const HIGHLIGHT_ICONS = Object.fromEntries(
  Object.entries(ICON_URLS).map(([k, v]) => [k, makeHighlightIcon(v)])
);
const userIcon = makeIcon('https://img.icons8.com/color/96/person-male.png', 44);
const pinIcon = (color) =>
  L.divIcon({
    html: `<div style="width:18px;height:18px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: '',
  });

// ── Fly-to control ─────────────────────────────────────────
const FlyToLocation = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16, { duration: 1.2 });
  }, [target, map]);
  return null;
};

// ── Fit-bounds control ─────────────────────────────────────
const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [60, 60], maxZoom: 15 });
    }
  }, [bounds, map]);
  return null;
};

// ── Map resize fix ─────────────────────────────────────────
const MapResizeFix = () => {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 100); }, [map]);
  return null;
};

// ── Real OSRM route layer ──────────────────────────────────
const RouteLayer = ({ fromCoord, toCoord, onRouteFound, onError }) => {
  const [routePoints, setRoutePoints] = useState([]);

  useEffect(() => {
    if (!fromCoord || !toCoord) { setRoutePoints([]); return; }

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${fromCoord.lng},${fromCoord.lat};${toCoord.lng},${toCoord.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code !== 'Ok' || !data.routes?.[0]) {
          onError?.('Could not find a route between these locations.');
          return;
        }

        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setRoutePoints(coords);

        onRouteFound?.({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60),
          points: coords,
        });
      } catch {
        onError?.('Network error. Could not fetch route.');
      }
    };

    fetchRoute();
  }, [fromCoord, toCoord]);

  if (!routePoints.length) return null;

  return (
    <>
      {/* Route shadow */}
      <Polyline positions={routePoints} color="#1e1b4b" weight={8} opacity={0.25} />
      {/* Route line */}
      <Polyline positions={routePoints} color="#4F46E5" weight={5} opacity={0.9} dashArray={null} />
    </>
  );
};

// ── Main component ────────────────────────────────────────
const AccessibilityMap = ({
  locations = [],
  flyToTarget = null,
  highlightId = null,
  fromCoord = null,
  toCoord = null,
  onRouteFound,
  onRouteError,
}) => {
  const [userPos, setUserPos] = useState(null);
  const [routeBounds, setRouteBounds] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  const handleRouteFound = (info) => {
    setRouteBounds(info.points);
    onRouteFound?.(info);
  };

  return (
    <MapContainer
      center={[13.0827, 80.2707]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
      />

      <MapResizeFix />
      <FlyToLocation target={flyToTarget} />
      {routeBounds && <FitBounds bounds={routeBounds} />}

      {/* User position */}
      {userPos && (
        <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
          <Popup><strong>📍 You are here</strong></Popup>
        </Marker>
      )}

      {/* Route start/end pins */}
      {fromCoord && (
        <Marker position={[fromCoord.lat, fromCoord.lng]} icon={pinIcon('#10b981')}>
          <Popup><strong>🟢 Start</strong></Popup>
        </Marker>
      )}
      {toCoord && (
        <Marker position={[toCoord.lat, toCoord.lng]} icon={pinIcon('#ef4444')}>
          <Popup><strong>🔴 Destination</strong></Popup>
        </Marker>
      )}

      {/* Real route */}
      <RouteLayer
        fromCoord={fromCoord}
        toCoord={toCoord}
        onRouteFound={handleRouteFound}
        onError={onRouteError}
      />

      {/* Location markers */}
      {locations.map((loc) => {
        const isHighlighted = loc.id === highlightId;
        const iconSet = isHighlighted ? HIGHLIGHT_ICONS : ICONS;
        const icon = iconSet[loc.type] || iconSet.tourist;

        return (
          <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={icon}>
            <Popup maxWidth={320}>
              <div className="p-3">
                <h3 className="text-base font-bold text-gray-900 mb-2">{loc.name}</h3>

                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={`text-base ${i <= Math.round(loc.score) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                  ))}
                  <span className="font-bold text-sm text-gray-700">{loc.score}/5</span>
                  <span
                    className="px-2 py-0.5 text-xs font-semibold text-white rounded-full"
                    style={{ backgroundColor: getAccessibilityColor(loc.score) }}
                  >
                    {loc.score >= 4.5 ? 'Excellent' : loc.score >= 3.5 ? 'Good' : loc.score >= 2.5 ? 'Fair' : 'Limited'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{loc.description}</p>

                {loc.features?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {loc.features.map((feat) => {
                      const f = accessibilityFeatures[feat];
                      return f ? (
                        <span key={feat} className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                          {f.icon} {f.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default AccessibilityMap;