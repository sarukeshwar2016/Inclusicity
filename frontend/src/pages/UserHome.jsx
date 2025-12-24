import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { voiceSocket } from '../services/api';
import { AlertCircle } from 'lucide-react';

const UserHome = () => {
  const [sosSent, setSosSent] = useState(false);

  const sendSOS = () => {
    if (sosSent) return;

    voiceSocket.emit("sos_alert", {
      message: "Emergency SOS triggered by user!",
      timestamp: new Date().toISOString(),
      username: localStorage.getItem("username"),
      role: localStorage.getItem("role"),

    });

    setSosSent(true);
    alert("🚨 Emergency alert sent to admin!");

    setTimeout(() => setSosSent(false), 30000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50 relative">
      <Navbar />

      <div className="flex pt-16">
        <SideBar />

        {/* Main content area */}
        <motion.div
          className="flex-1"
          animate={{ marginLeft: '240px' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <div className="px-6 py-12">
            <div className="max-w-7xl mx-auto">
              {/* Branded Hero Section – Top Middle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center py-16"
              >
                {/* Main Headline with subtle animation */}
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6">
                  Welcome to{" "}
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [1, 1.00, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-green-600"
                  >
                    Inclusi
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600"
                  >
                    City
                  </motion.span>{" "}
                  🌍
                </h1>

                {/* Subheadline */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto"
                >
                  Your inclusive community for accessibility support, real-time help, and meaningful connections.
                </motion.p>

                {/* Inclusive Illustrations Carousel (subtle fade) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="mt-12 flex justify-center gap-8 flex-wrap"
                >
                  
<grok-card data-id="ac62dd" data-type="image_card"  data-arg-size="LARGE" ></grok-card>



<grok-card data-id="e1c6d5" data-type="image_card"  data-arg-size="LARGE" ></grok-card>



<grok-card data-id="2ef7ee" data-type="image_card"  data-arg-size="LARGE" ></grok-card>



<grok-card data-id="9d0f0f" data-type="image_card"  data-arg-size="LARGE" ></grok-card>

                </motion.div>
              </motion.div>

              {/* Your original placeholder content */}
              <div className="text-center py-20">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                  Explore the Platform
                </h2>
                <p className="text-xl text-gray-600">
                  This is your home page. More features and content coming soon!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SOS Emergency Button */}
      <button
        onClick={sendSOS}
        disabled={sosSent}
        className={`fixed bottom-8 right-8 z-50 flex items-center gap-4 rounded-full px-8 py-6 text-2xl font-bold text-white shadow-2xl transition-all focus:outline-none focus:ring-4 focus:ring-red-300 ${
          sosSent
            ? "bg-gray-500 cursor-not-allowed animate-pulse"
            : "bg-red-600 hover:bg-red-700"
        }`}
        aria-label="Emergency SOS – Click to send immediate alert to admin"
      >
        <AlertCircle size={40} />
        SOS
        {sosSent && <span className="text-lg ml-2">Sent!</span>}
      </button>
    </div>
  );
};

export default UserHome;