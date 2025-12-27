// src/components/AccessibilityMap.jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAccessibilityColor, accessibilityFeatures } from '../lib/accessibility-data';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
});

// High-quality professional SVG icons from Icons8 (crisp, modern, consistent)
const ICON_URLS = {
  busstand: 'https://img.icons8.com/color/96/bus.png', // Bus
  transport: 'https://img.icons8.com/color/96/subway.png', // Metro/train
  hospital: 'https://img.icons8.com/color/96/hospital.png', // Hospital
  cafe: 'https://img.icons8.com/color/96/coffee.png', // Cafe
  mall: 'https://img.icons8.com/color/96/shopping-mall.png', // Mall
  park: 'https://img.icons8.com/color/96/tree.png', // Park
  tourist: 'https://img.icons8.com/color/96/camera.png', // Tourist (camera)
};

// Create icons
const makeIcon = (url) =>
  L.divIcon({
    html: `<img src="${url}" style="width:40px; height:40px;" />`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'custom-marker-icon',
  });

const ICONS = {
  busstand: makeIcon(ICON_URLS.busstand),
  transport: makeIcon(ICON_URLS.transport),
  hospital: makeIcon(ICON_URLS.hospital),
  cafe: makeIcon(ICON_URLS.cafe),
  mall: makeIcon(ICON_URLS.mall),
  park: makeIcon(ICON_URLS.park),
  tourist: makeIcon(ICON_URLS.tourist),
};

// User location (person icon)
const userIcon = makeIcon('https://img.icons8.com/color/96/person-male.png');

const LocateUser = ({ pos }) => {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView([pos.lat, pos.lng], 14);
  }, [pos, map]);
  return null;
};

const MapResizeFix = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
};

const AccessibilityMap = ({ locations }) => {
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  const getIconForLocation = (loc) => ICONS[loc.type] || ICONS.tourist;

  return (
    <MapContainer
      center={[13.0827, 80.2707]}
      zoom={12}
      className="w-full h-full"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />

      <MapResizeFix />
      <LocateUser pos={userPos} />

      {userPos && (
        <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
          <Popup><strong>You are here</strong></Popup>
        </Marker>
      )}

      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={getIconForLocation(loc)}
        >
          <Popup maxWidth={320}>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{loc.name}</h3>

              <div className="flex items-center gap-3 mb-4">
                {[1,2,3,4,5].map(i => (
                  <span
                    key={i}
                    className={`text-lg ${i <= Math.round(loc.score) ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="font-bold text-gray-700">{loc.score}/5</span>
                <span
                  className="px-3 py-1 text-xs font-medium text-white rounded-full"
                  style={{ backgroundColor: getAccessibilityColor(loc.score) }}
                >
                  {loc.score >= 4.5 ? 'Excellent' : loc.score >= 3.5 ? 'Good' : loc.score >= 2.5 ? 'Fair' : 'Limited'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{loc.description}</p>

              {loc.features?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {loc.features.map((feat) => {
                      const f = accessibilityFeatures[feat];
                      return f ? (
                        <span
                          key={feat}
                          className="flex items-center gap-1 text-sm bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full"
                        >
                          <span>{f.icon}</span> {f.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default AccessibilityMap;