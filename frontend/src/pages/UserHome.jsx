import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import SOSButton from "../components/SOSButton";
import { motion } from "framer-motion";

const UserHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50 relative">
      <Navbar />

      <div className="flex pt-16">
        <SideBar />

        {/* Main content area */}
        <motion.div
          className="flex-1"
          animate={{ marginLeft: "240px" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="px-6 py-12">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center py-16"
              >
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6">
                  Welcome to{" "}
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-green-600"
                  >
                    Inclusi
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: 0.5,
                      ease: "easeInOut",
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600"
                  >
                    City
                  </motion.span>{" "}
                  🌍
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto"
                >
                  Your inclusive community for accessibility support, real-time
                  help, and meaningful connections.
                </motion.p>
              </motion.div>

              {/* Placeholder Content */}
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

      {/* ✅ REST-BASED SOS BUTTON (GLOBAL FLOATING) */}
      <SOSButton />
    </div>
  );
};

export default UserHome;
