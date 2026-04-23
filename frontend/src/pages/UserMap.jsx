// src/pages/UserMap.jsx
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import AccessibilityMap from '../components/AccessibilityMap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, Search, X, Locate, Route,
  ChevronRight, Star, Loader2, AlertCircle, CheckCircle, AlertTriangle,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { mockAccessibleLocations, accessibilityFeatures, getAccessibilityColor } from '../lib/accessibility-data';

// ── Haversine distance (km) ───────────────────────
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Nominatim geocode (free) ──────────────────────
const geocode = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Chennai')}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name };
};

const typeLabels = {
  hospital: '🏥 Hospitals',
  cafe: '☕ Cafés',
  tourist: '📸 Tourist',
  transport: '🚇 Transport',
  mall: '🛍️ Malls',
  park: '🌳 Parks',
  busstand: '🚌 Bus Stand',
};

const scoreLabel = (s) =>
  s >= 4.5 ? 'Excellent' : s >= 3.5 ? 'Good' : s >= 2.5 ? 'Fair' : 'Limited';

const UserMap = () => {
  // ── Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(new Set());

  // ── Map controls
  const [flyToTarget, setFlyToTarget] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [nearMeLoading, setNearMeLoading] = useState(false);

  // ── Route planner
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromCoord, setFromCoord] = useState(null);
  const [toCoord, setToCoord] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeError, setRouteError] = useState('');
  const [routeLoading, setRouteLoading] = useState(false);

  // ── UI state
  const [listOpen, setListOpen] = useState(true);

  const locationTypes = [...new Set(mockAccessibleLocations.map((l) => l.type))];

  // ── Filtered locations
  const filteredLocations = mockAccessibleLocations
    .filter((loc) => {
      const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypes.size === 0 || selectedTypes.has(loc.type);
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (nearMeActive && userPos) {
        return (
          haversine(userPos.lat, userPos.lng, a.lat, a.lng) -
          haversine(userPos.lat, userPos.lng, b.lat, b.lng)
        );
      }
      return b.score - a.score;
    });

  const toggleType = (type) => {
    const s = new Set(selectedTypes);
    s.has(type) ? s.delete(type) : s.add(type);
    setSelectedTypes(s);
  };

  // ── Near Me
  const handleNearMe = useCallback(() => {
    if (nearMeActive) { setNearMeActive(false); return; }
    setNearMeLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        setUserPos(pos);
        setFlyToTarget(pos);
        setNearMeActive(true);
        setNearMeLoading(false);
      },
      () => {
        alert('Could not get your location. Please allow location access.');
        setNearMeLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, [nearMeActive]);

  // ── Select location from list
  const handleSelectLocation = (loc) => {
    setFlyToTarget({ lat: loc.lat, lng: loc.lng });
    setHighlightId(loc.id);
  };

  // ── Real route planning
  const handleFindRoute = async () => {
    if (!fromText.trim() || !toText.trim()) return;
    setRouteLoading(true);
    setRouteError('');
    setRouteInfo(null);
    setFromCoord(null);
    setToCoord(null);

    try {
      const [from, to] = await Promise.all([geocode(fromText), geocode(toText)]);

      if (!from) { setRouteError(`Could not find "${fromText}" on the map.`); setRouteLoading(false); return; }
      if (!to)   { setRouteError(`Could not find "${toText}" on the map.`); setRouteLoading(false); return; }

      setFromCoord(from);
      setToCoord(to);
      // routeInfo will be set by AccessibilityMap's onRouteFound callback
    } catch {
      setRouteError('Network error. Please check your connection.');
      setRouteLoading(false);
    }
  };

  const handleRouteFound = (info) => {
    setRouteInfo(info);
    setRouteLoading(false);
  };

  const handleRouteError = (msg) => {
    setRouteError(msg);
    setRouteLoading(false);
  };

  const clearRoute = () => {
    setFromCoord(null);
    setToCoord(null);
    setRouteInfo(null);
    setRouteError('');
    setFromText('');
    setToText('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex pt-16">
        <SideBar />

        <main className="flex-1 min-h-screen" style={{ marginLeft: '240px' }}>
          <div className="px-6 py-8">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-slate-900">Accessibility Map</h1>
              <p className="text-slate-500 mt-1">Find wheelchair-friendly places, plan real routes, and explore Chennai accessibly.</p>
            </div>

            {/* Search + Filters Bar */}
            <div className="mb-5 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none text-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Near Me */}
              <button
                onClick={handleNearMe}
                disabled={nearMeLoading}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all shadow-sm ${
                  nearMeActive
                    ? 'bg-indigo-600 text-white shadow-indigo-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-400'
                }`}
              >
                {nearMeLoading ? <Loader2 size={16} className="animate-spin" /> : <Locate size={16} />}
                {nearMeActive ? 'Near Me ✓' : 'Near Me'}
              </button>

              {/* Type filters */}
              {locationTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    selectedTypes.has(type)
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400'
                  }`}
                >
                  {typeLabels[type] || type}
                </button>
              ))}
              {selectedTypes.size > 0 && (
                <button onClick={() => setSelectedTypes(new Set())} className="text-sm text-slate-500 hover:text-slate-800 underline">
                  Clear
                </button>
              )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* ── MAP (2 cols) ── */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100" style={{ height: '620px' }}>
                  <AccessibilityMap
                    locations={filteredLocations}
                    flyToTarget={flyToTarget}
                    highlightId={highlightId}
                    fromCoord={fromCoord}
                    toCoord={toCoord}
                    onRouteFound={handleRouteFound}
                    onRouteError={handleRouteError}
                  />
                </div>

                {/* Route result */}
                <AnimatePresence>
                  {routeInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 flex items-center gap-6"
                    >
                      <CheckCircle size={28} className="text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-lg">Route Found!</p>
                        <p className="text-slate-500 text-sm">
                          {routeInfo.distance} km &nbsp;·&nbsp; ~{routeInfo.duration} min drive
                        </p>
                      </div>
                      <button onClick={clearRoute} className="ml-auto flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-semibold">
                        <X size={16} /> Clear Route
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {routeError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-sm">
                    <AlertTriangle size={20} className="flex-shrink-0" />
                    {routeError}
                    <button onClick={() => setRouteError('')} className="ml-auto">
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Legend */}
                <div className="bg-white rounded-2xl shadow border border-slate-100 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Accessibility Features</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(accessibilityFeatures).map(([key, { icon, label }]) => (
                      <div key={key} className="flex items-center gap-2 text-sm text-slate-700">
                        <span>{icon}</span> {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="lg:col-span-1 flex flex-col gap-4">

                {/* Route Planner */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-5">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Route size={20} className="text-indigo-600" /> Plan a Route
                  </h2>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">From</label>
                      <input
                        type="text"
                        value={fromText}
                        onChange={(e) => setFromText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFindRoute()}
                        placeholder="e.g. Marina Beach, Chennai"
                        className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">To</label>
                      <input
                        type="text"
                        value={toText}
                        onChange={(e) => setToText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFindRoute()}
                        placeholder="e.g. Apollo Hospital, Chennai"
                        className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                      />
                    </div>

                    <button
                      onClick={handleFindRoute}
                      disabled={routeLoading || !fromText.trim() || !toText.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
                    >
                      {routeLoading
                        ? <><Loader2 size={16} className="animate-spin" /> Finding Route...</>
                        : <><Navigation size={16} /> Find Route</>
                      }
                    </button>

                    {(fromCoord || toCoord) && (
                      <button onClick={clearRoute} className="w-full text-xs text-slate-500 hover:text-red-500 underline text-center">
                        Clear route
                      </button>
                    )}
                  </div>
                </div>

                {/* Location List */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden" style={{ maxHeight: '460px' }}>
                  <button
                    onClick={() => setListOpen((v) => !v)}
                    className="flex items-center justify-between px-5 py-4 border-b border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-indigo-600" />
                      <span className="font-bold text-slate-900">
                        Locations
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                          {filteredLocations.length}
                        </span>
                      </span>
                    </div>
                    <ChevronRight
                      size={18}
                      className={`text-slate-400 transition-transform ${listOpen ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {listOpen && (
                    <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                      {filteredLocations.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8">No locations match your filters.</p>
                      ) : (
                        filteredLocations.map((loc) => {
                          const distText = userPos
                            ? `${haversine(userPos.lat, userPos.lng, loc.lat, loc.lng).toFixed(1)} km`
                            : null;
                          const color = getAccessibilityColor(loc.score);
                          return (
                            <button
                              key={loc.id}
                              onClick={() => handleSelectLocation(loc)}
                              className={`w-full text-left px-5 py-3.5 hover:bg-indigo-50 transition-colors ${
                                highlightId === loc.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 truncate">{loc.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-400">{typeLabels[loc.type] || loc.type}</span>
                                    {distText && (
                                      <span className="text-xs text-indigo-500 font-medium">· {distText}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-1">
                                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                  <span
                                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: color }}
                                  >
                                    {loc.score}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                {filteredLocations.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4">
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Summary</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p className="text-2xl font-black text-indigo-600">{filteredLocations.length}</p>
                        <p className="text-xs text-slate-500">Locations</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p className="text-2xl font-black text-emerald-600">
                          {(filteredLocations.reduce((a, l) => a + l.score, 0) / filteredLocations.length).toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-500">Avg. Score</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserMap;