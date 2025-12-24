import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import AccessibilityMap from '../components/AccessibilityMap';
import { motion } from 'framer-motion';

const UserMap = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex pt-16">
        <SideBar />

        {/* Main content with dynamic margin to prevent sidebar overlap */}
        <motion.div
          className="flex-1"
          animate={{ marginLeft: '240px' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <div className="px-6 py-12 max-w-7xl mx-auto">
            {/* Hero Heading & Subtext */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                Accessibility Map
              </h1>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Explore wheelchair-friendly routes, ramps, accessible public transport, and inclusive locations across the city. 
                Plan your journey with confidence and discover a more inclusive urban experience.
              </p>
            </div>

            {/* Larger Map Frame with Legend */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Map Container - Bigger & Responsive */}
              <div className="relative w-full h-[700px] lg:h-[800px]">
                <AccessibilityMap />
              </div>

              {/* Legend Panel */}
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Map Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded"></div>
                    <span className="text-gray-700">Wheelchair Accessible Route</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Ramp Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-purple-500 rounded"></div>
                    <span className="text-gray-700">Accessible Public Transport</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-orange-500 rounded"></div>
                    <span className="text-gray-700">Inclusive Facility (Restroom, Elevator)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="text-center mt-10">
              <p className="text-gray-600 bg-white/80 backdrop-blur px-8 py-4 rounded-full inline-block shadow-lg text-lg">
                💡 Tip: Use the search panel on the map to find accessible routes between locations!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserMap;