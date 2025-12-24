// src/lib/accessibility-data.js

// ------------------------------------
// Accessibility Features Legend
// ------------------------------------
export const accessibilityFeatures = {
  ramps: { icon: '♿', label: 'Wheelchair Ramp' },
  elevators: { icon: '🛗', label: 'Elevator Access' },
  smoothSurface: { icon: '🛣️', label: 'Smooth Surface' },
  handrails: { icon: '🤲', label: 'Handrails' },
  wideDoors: { icon: '🚪', label: 'Wide Doors' },
};

// ------------------------------------
// Mock Accessible Locations – Chennai (120+)
// ------------------------------------
export const mockAccessibleLocations = [
  // ================== HOSPITALS ==================
  {
    id: 1,
    type: 'hospital',
    name: 'Apollo Hospital',
    lat: 13.0604,
    lng: 80.2496,
    score: 4.6,
    description: 'Fully wheelchair accessible multi-specialty hospital',
    features: ['ramps', 'elevators', 'smoothSurface', 'wideDoors'],
  },
  {
    id: 2,
    type: 'hospital',
    name: 'MIOT International',
    lat: 13.0213,
    lng: 80.1848,
    score: 4.5,
    description: 'Modern hospital with global accessibility standards',
    features: ['ramps', 'elevators', 'smoothSurface', 'wideDoors'],
  },
  {
    id: 3,
    type: 'hospital',
    name: 'Fortis Malar Hospital',
    lat: 13.0335,
    lng: 80.2677,
    score: 4.3,
    description: 'Good wheelchair access and lift facilities',
    features: ['ramps', 'elevators', 'wideDoors'],
  },
  {
    id: 4,
    type: 'hospital',
    name: 'Global Hospital',
    lat: 13.0618,
    lng: 80.2574,
    score: 4.4,
    description: 'Advanced accessibility support and assistance',
    features: ['ramps', 'elevators', 'smoothSurface'],
  },

  // ================== CAFES ==================
  {
    id: 10,
    type: 'cafe',
    name: 'Amethyst Cafe',
    lat: 13.0629,
    lng: 80.2400,
    score: 4.2,
    description: 'Garden cafe with step-free entry',
    features: ['ramps', 'smoothSurface'],
  },
  {
    id: 11,
    type: 'cafe',
    name: 'Writer’s Cafe',
    lat: 13.0601,
    lng: 80.2643,
    score: 4.0,
    description: 'Wide seating spaces and easy access',
    features: ['ramps', 'wideDoors'],
  },
  {
    id: 12,
    type: 'cafe',
    name: 'Cafe Mercara Express',
    lat: 13.0207,
    lng: 80.2499,
    score: 4.1,
    description: 'Smooth flooring and ground-level entry',
    features: ['smoothSurface', 'wideDoors'],
  },

  // ================== TOURIST PLACES ==================
  {
    id: 20,
    type: 'tourist',
    name: 'Marina Beach Entrance',
    lat: 13.0500,
    lng: 80.2824,
    score: 3.2,
    description: 'Partial accessibility near promenade',
    features: ['ramps'],
  },
  {
    id: 21,
    type: 'tourist',
    name: 'Kapaleeshwarar Temple',
    lat: 13.0412,
    lng: 80.2498,
    score: 3.5,
    description: 'Limited access during peak hours',
    features: ['ramps', 'handrails'],
  },
  {
    id: 22,
    type: 'tourist',
    name: 'Fort St. George',
    lat: 13.0892,
    lng: 80.2809,
    score: 3.1,
    description: 'Historic site with uneven paths',
    features: ['handrails'],
  },

  // ================== METRO & TRANSPORT ==================
  {
    id: 30,
    type: 'transport',
    name: 'Guindy Metro Station',
    lat: 13.0096,
    lng: 80.2137,
    score: 4.2,
    description: 'Fully accessible metro station',
    features: ['ramps', 'elevators', 'handrails'],
  },
  {
    id: 31,
    type: 'transport',
    name: 'Alandur Metro Station',
    lat: 13.0047,
    lng: 80.2015,
    score: 4.1,
    description: 'Interchange station with elevators',
    features: ['ramps', 'elevators'],
  },
  {
    id: 32,
    type: 'transport',
    name: 'Chennai Airport (Domestic)',
    lat: 12.9941,
    lng: 80.1709,
    score: 4.6,
    description: 'Excellent wheelchair and staff assistance',
    features: ['ramps', 'elevators', 'smoothSurface', 'wideDoors'],
  },

  // ================== MALLS ==================
  {
    id: 40,
    type: 'mall',
    name: 'Phoenix Marketcity',
    lat: 12.9965,
    lng: 80.2170,
    score: 4.7,
    description: 'Highly accessible mall with elevators',
    features: ['ramps', 'elevators', 'smoothSurface', 'wideDoors'],
  },
  {
    id: 41,
    type: 'mall',
    name: 'Express Avenue Mall',
    lat: 13.0600,
    lng: 80.2644,
    score: 4.4,
    description: 'Wheelchair-friendly shopping complex',
    features: ['ramps', 'elevators', 'wideDoors'],
  },

  // ================== PARKS ==================
  {
    id: 50,
    type: 'park',
    name: 'Semmozhi Poonga',
    lat: 13.0486,
    lng: 80.2506,
    score: 3.9,
    description: 'Paved walkways and seating areas',
    features: ['smoothSurface', 'handrails'],
  },
  {
    id: 51,
    type: 'park',
    name: 'Guindy National Park',
    lat: 13.0129,
    lng: 80.2172,
    score: 3.7,
    description: 'Natural terrain with limited accessibility',
    features: ['smoothSurface'],
  },

  // ================== BULK GENERATED LOCATIONS (Realistic Spread) ==================
  ...Array.from({ length: 70 }, (_, i) => ({
    id: 60 + i,
    type:
      i % 6 === 0
        ? 'cafe'
        : i % 6 === 1
        ? 'tourist'
        : i % 6 === 2
        ? 'mall'
        : i % 6 === 3
        ? 'park'
        : i % 6 === 4
        ? 'hospital'
        : 'transport',
    name: `Chennai Location ${60 + i}`,
    lat: 12.95 + Math.random() * 0.25,
    lng: 80.15 + Math.random() * 0.25,
    score: Math.round((Math.random() * 2 + 3) * 10) / 10,
    description: 'Community-reported accessibility information',
    features:
      i % 2 === 0
        ? ['ramps', 'handrails']
        : ['smoothSurface', 'wideDoors'],
  })),
];

// ------------------------------------
// Accessibility Color Mapper
// ------------------------------------
export function getAccessibilityColor(score) {
  if (score >= 4.5) return '#22c55e';
  if (score >= 3.5) return '#3b82f6';
  if (score >= 2.5) return '#facc15';
  return '#ef4444';
}

// ------------------------------------
// Route Accessibility Calculator (Mock)
// ------------------------------------
export function calculateRouteAccessibility([from, to]) {
  const score = Math.round((Math.random() * 2 + 3) * 10) / 10;

  return {
    score,
    description:
      score > 4
        ? 'Highly accessible route with ramps and smooth paths'
        : 'Route has some accessibility challenges',
    hasRamps: score > 3.5,
    hasSmoothSurface: score > 3,
    hasElevators: score > 4,
    hasSlopeWarnings: score < 3.5,
  };
}
