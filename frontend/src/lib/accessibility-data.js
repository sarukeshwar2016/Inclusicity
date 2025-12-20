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
// Mock Accessible Locations
// ------------------------------------
export const mockAccessibleLocations = [
  {
    id: 1,
    name: 'Apollo Hospital',
    lat: 13.0604,
    lng: 80.2496,
    score: 4.5,
    description: 'Fully wheelchair accessible hospital',
    features: ['ramps', 'elevators', 'smoothSurface', 'wideDoors'],
  },
  {
    id: 2,
    name: 'Chennai Central Station',
    lat: 13.0836,
    lng: 80.2750,
    score: 3.8,
    description: 'Moderate accessibility with some limitations',
    features: ['ramps', 'handrails'],
  },
  {
    id: 3,
    name: 'Government Office',
    lat: 13.0878,
    lng: 80.2785,
    score: 2.9,
    description: 'Limited accessibility',
    features: ['handrails'],
  },
];

// ------------------------------------
// Accessibility Color Mapper
// ------------------------------------
export function getAccessibilityColor(score) {
  if (score >= 4.5) return '#22c55e'; // green
  if (score >= 3.5) return '#3b82f6'; // blue
  if (score >= 2.5) return '#facc15'; // yellow
  return '#ef4444'; // red
}

// ------------------------------------
// Route Accessibility Calculator (Mock)
// ------------------------------------
export function calculateRouteAccessibility([from, to]) {
  // Mock logic – later you can connect real APIs
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
