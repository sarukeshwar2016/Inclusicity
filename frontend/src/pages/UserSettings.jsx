import { useState } from 'react';
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import SOSButton from "../components/SOSButton";
import { motion } from "framer-motion";
import { 
  Moon, 
  Sun, 
  Eye, 
  Volume2, 
  Bell, 
  Shield, 
  Globe,
  Type
} from "lucide-react";

const UserSettings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [voiceRoomAlerts, setVoiceRoomAlerts] = useState(true);
  const [shareLocationForHelp, setShareLocationForHelp] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState('friends'); // 'everyone' | 'friends' | 'no-one'
  const [language, setLanguage] = useState('English');

  const handleSave = () => {
    // TODO: Save settings to backend or localStorage
    alert('Settings saved successfully! 🌟');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50 relative">
      <Navbar />
      <div className="flex pt-16">
        <SideBar />

        <motion.div
          className="flex-1"
          animate={{ marginLeft: "240px" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="px-6 py-12 max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-14"
            >
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
                Settings
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Make InclusiCity feel perfect for you. All changes are saved automatically.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* Accessibility Settings */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <Eye className="w-12 h-12 text-indigo-600" />
                  <h2 className="text-3xl font-bold text-gray-900">Accessibility</h2>
                </div>

                <div className="space-y-8 text-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Eye className="w-8 h-8 text-indigo-500" />
                      <span className="font-medium">High Contrast Mode</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(e) => setHighContrast(e.target.checked)}
                      className="w-7 h-7 text-indigo-600 rounded-lg focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Type className="w-8 h-8 text-indigo-500" />
                      <span className="font-medium">Larger Text Size</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={largeText}
                      onChange={(e) => setLargeText(e.target.checked)}
                      className="w-7 h-7 text-indigo-600 rounded-lg focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <motion.div className="w-8 h-8 text-indigo-500">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/>
                        </svg>
                      </motion.div>
                      <span className="font-medium">Reduced Motion</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={reducedMotion}
                      onChange={(e) => setReducedMotion(e.target.checked)}
                      className="w-7 h-7 text-indigo-600 rounded-lg focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      {darkMode ? <Moon className="w-8 h-8 text-indigo-500" /> : <Sun className="w-8 h-8 text-indigo-500" />}
                      <span className="font-medium">Dark Mode</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      className="w-7 h-7 text-indigo-600 rounded-lg focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </section>

              {/* Notifications & Sound */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <Bell className="w-12 h-12 text-green-600" />
                  <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
                </div>

                <div className="space-y-8 text-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Bell className="w-8 h-8 text-green-500" />
                      <span className="font-medium">App Notifications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="w-7 h-7 text-green-600 rounded-lg focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Volume2 className="w-8 h-8 text-green-500" />
                      <span className="font-medium">Sound Alerts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundAlerts}
                      onChange={(e) => setSoundAlerts(e.target.checked)}
                      className="w-7 h-7 text-green-600 rounded-lg focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Volume2 className="w-8 h-8 text-green-500" />
                      <span className="font-medium">Voice Room Join Alerts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={voiceRoomAlerts}
                      onChange={(e) => setVoiceRoomAlerts(e.target.checked)}
                      className="w-7 h-7 text-green-600 rounded-lg focus:ring-green-500"
                    />
                  </label>
                </div>
              </section>

              {/* Privacy & Safety */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <Shield className="w-12 h-12 text-red-600" />
                  <h2 className="text-3xl font-bold text-gray-900">Privacy & Safety</h2>
                </div>

                <div className="space-y-8 text-lg">
                  <div>
                    <p className="font-medium mb-4">Share location when requesting help</p>
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareLocationForHelp}
                        onChange={(e) => setShareLocationForHelp(e.target.checked)}
                        className="w-7 h-7 text-red-600 rounded-lg focus:ring-red-500"
                      />
                      <span>Yes, share my location only during active requests</span>
                    </label>
                  </div>

                  <div>
                    <p className="font-medium mb-4">Direct Messages</p>
                    <select
                      value={allowDirectMessages}
                      onChange={(e) => setAllowDirectMessages(e.target.value)}
                      className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    >
                      <option value="everyone">From anyone</option>
                      <option value="friends">From friends only</option>
                      <option value="no-one">No one</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Language */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <Globe className="w-12 h-12 text-teal-600" />
                  <h2 className="text-3xl font-bold text-gray-900">Language</h2>
                </div>

                <div className="text-lg">
                  <label className="block font-medium mb-4">Preferred Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>Tamil</option>
                    <option>Bengali</option>
                    {/* Add more as supported */}
                  </select>
                  <p className="mt-4 text-gray-600">We’re working on more languages!</p>
                </div>
              </section>
            </div>

            {/* Save Button */}
            <div className="text-center mt-16">
              <button
                onClick={handleSave}
                className="px-16 py-6 bg-gradient-to-r from-indigo-600 to-green-600 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-indigo-500/50 transition transform hover:scale-105"
              >
                Save All Settings
              </button>
              <p className="mt-6 text-lg text-gray-600">
                Your comfort and privacy matter most to us. ❤️
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <SOSButton />
    </div>
  );
};

export default UserSettings;