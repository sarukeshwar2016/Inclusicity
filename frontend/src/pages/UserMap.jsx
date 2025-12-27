// src/pages/UserMap.jsx
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import AccessibilityMap from '../components/AccessibilityMap';
import { motion } from 'framer-motion';
import { AlertCircle, X, Menu, Search, Navigation, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { mockAccessibleLocations, accessibilityFeatures, calculateRouteAccessibility } from '../lib/accessibility-data';

const UserMap = () => {
  const [isTipDismissed, setIsTipDismissed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);

  const locationTypes = [...new Set(mockAccessibleLocations.map(loc => loc.type))];

  const typeLabels = {
    hospital: 'Hospitals',
    cafe: 'Cafés & Restaurants',
    tourist: 'Tourist Spots',
    transport: 'Transport Hubs',
    mall: 'Malls',
    park: 'Parks',
  };

  const toggleTypeFilter = (type) => {
    const newTypes = new Set(selectedTypes);
    newTypes.has(type) ? newTypes.delete(type) : newTypes.add(type);
    setSelectedTypes(newTypes);
  };

  const filteredLocations = mockAccessibleLocations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypes.size === 0 || selectedTypes.has(loc.type);
    return matchesSearch && matchesType;
  });

  const handleFindRoute = () => {
    if (!fromLocation || !toLocation) return;
    const mockRoute = calculateRouteAccessibility([fromLocation, toLocation]);
    setRouteInfo(mockRoute);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Skip link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-indigo-600 focus:text-white focus:px-6 focus:py-3 focus:rounded-lg">
        Skip to main content
      </a>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-20 left-4 z-50 md:hidden bg-white rounded-full p-3 shadow-lg border"
      >
        <Menu size={24} />
      </button>

      <div className="flex">
        <SideBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main id="main-content" className="flex-1 pt-16 min-h-screen">
          <motion.div className="md:ml-60">
            <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-full">
              {/* Hero */}
              <header className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">Accessibility Map</h1>
                <p className="text-lg sm:text-xl text-gray-700 max-w-4xl mx-auto">
                  Explore wheelchair-friendly locations across Chennai. Search, filter, and plan inclusive journeys.
                </p>
              </header>

              {/* Search & Filters */}
              <div className="max-w-5xl mx-auto mb-10 space-y-8">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                  <input
                    type="text"
                    placeholder="Search for a place (e.g., Apollo Hospital, Marina Beach...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 text-lg bg-white border border-gray-200 rounded-2xl shadow-lg focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  {locationTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleTypeFilter(type)}
                      className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                        selectedTypes.has(type)
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-800 border border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                  {selectedTypes.size > 0 && (
                    <button onClick={() => setSelectedTypes(new Set())} className="px-6 py-3 rounded-2xl text-gray-600">
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Map + Route Planner Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Map (2 columns on large screens) */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                  <div className="h-[600px] md:h-[700px] lg:h-[800px]">
                    <AccessibilityMap locations={filteredLocations} />
                  </div>

                  {/* Legend below map */}
                  <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-t">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Accessibility Features</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                      {Object.entries(accessibilityFeatures).map(([key, { icon, label }]) => (
                        <div key={key} className="flex items-center gap-4 bg-white/70 rounded-xl p-4 hover:shadow-md transition">
                          <span className="text-3xl">{icon}</span>
                          <span className="font-medium text-gray-800">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Route Planner Sidebar (1 column) */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl shadow-2xl p-6 space-y-6 sticky top-24">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <Navigation size={28} className="text-indigo-600" />
                      Plan Accessible Route
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                        <input
                          type="text"
                          placeholder="Your location or place name"
                          value={fromLocation}
                          onChange={(e) => setFromLocation(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input
                          type="text"
                          placeholder="Destination"
                          value={toLocation}
                          onChange={(e) => setToLocation(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <button
                        onClick={handleFindRoute}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3"
                      >
                        <MapPin size={20} />
                        Find Accessible Route
                      </button>
                    </div>

                    {routeInfo && (
                      <div className={`p-5 rounded-xl border-2 ${routeInfo.score >= 3.5 ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          {routeInfo.score >= 3.5 ? <CheckCircle size={28} className="text-green-600" /> : <AlertTriangle size={28} className="text-yellow-600" />}
                          <div>
                            <p className="font-bold text-lg">Route Accessibility</p>
                            <p className="text-2xl font-extrabold">{routeInfo.score}/5</p>
                          </div>
                        </div>
                        <p className="text-gray-700">{routeInfo.description}</p>
                        <div className="mt-3 space-y-1 text-sm">
                          {routeInfo.hasRamps && <p>✓ Ramps available</p>}
                          {routeInfo.hasSmoothSurface && <p>✓ Smooth pathways</p>}
                          {routeInfo.hasElevators && <p>✓ Elevators present</p>}
                          {routeInfo.hasSlopeWarnings && <p>⚠ Some steep slopes</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tip */}
              {!isTipDismissed && (
                <div className="text-center mt-12">
                  <div className="inline-block relative bg-gradient-to-r from-indigo-100 to-purple-100 text-gray-800 px-12 py-8 rounded-3xl shadow-2xl border border-indigo-200 max-w-4xl">
                    <p className="text-xl font-semibold flex items-center justify-center gap-4">
                      <span className="text-3xl">💡</span>
                      Click any marker to see detailed accessibility information!
                    </p>
                    <button
                      onClick={() => setIsTipDismissed(true)}
                      className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-white/50"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              )}

              {/* Report Button */}
              <button className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-full shadow-2xl flex items-center gap-5 text-xl font-bold hover:scale-110 transition">
                <AlertCircle size={32} />
                Report Issue
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserMap;