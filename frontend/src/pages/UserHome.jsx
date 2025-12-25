import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import SOSButton from "../components/SOSButton";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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
              {/* Hero Section with empowering subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center py-8"
              >
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
                  Welcome to{" "}
                  <motion.span
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-green-600"
                  >
                    Inclusi
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600"
                  >
                    City
                  </motion.span>{" "}
                  🌍
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto"
                >
                  Your space. Your pace. Your voice.
                </motion.p>
              </motion.div>

              {/* Introduction - Short & empowering */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16 px-4"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  A community built for you — by people who understand
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Connect, get help, explore safely, and feel supported — on your terms.
                </p>
              </motion.div>

              {/* 4 Large Feature Cards with Inclusive Illustrations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24 max-w-5xl mx-auto">
                {/* Card 1: Instant SOS Alert */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center"
                >
                  <img
                    src="https://thumbs.dreamstime.com/b/group-diverse-disabled-people-guide-dog-happy-smiling-assortment-different-handicaps-pink-background-colored-186546218.jpg"
                    alt="Diverse group of happy people with disabilities connecting and smiling"
                    className="w-full md:w-1/2 h-64 md:h-full object-cover"
                  />
                  <div className="p-10 text-center md:text-left flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Instant SOS Alert
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      One tap connects you to help — feel safer every day.
                    </p>
                    <p className="text-indigo-600 font-medium">
                      Always available with the floating red button
                    </p>
                  </div>
                </motion.div>

                {/* Card 2: Voice Chat Rooms → /user/voice */}
                <Link to="/user/voice" className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src="https://thumbs.dreamstime.com/b/happy-active-lifestyle-disabled-people-concept-group-young-playing-communicating-feeling-positive-confident-vector-420585668.jpg"
                      alt="Happy diverse people with disabilities chatting and connecting joyfully"
                      className="w-full md:w-1/2 h-64 md:h-full object-cover"
                    />
                    <div className="p-10 text-center md:text-left flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Voice Chat Rooms
                      </h3>
                      <p className="text-lg text-gray-600 mb-6">
                        Join live conversations — talk about anything, with people who get it.
                      </p>
                      <p className="text-indigo-600 font-medium">
                        Tap to join a room now →
                      </p>
                    </div>
                  </motion.div>
                </Link>

                {/* Card 3: Request Volunteer Help → /user/dashboard */}
                <Link to="/user/dashboard" className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row-reverse items-center hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src="https://www.shutterstock.com/image-vector/diverse-group-people-disabilities-showing-260nw-2577246915.jpg"
                      alt="Empowered diverse group with disabilities supporting each other"
                      className="w-full md:w-1/2 h-64 md:h-full object-cover"
                    />
                    <div className="p-10 text-center md:text-right flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Request Volunteer Help
                      </h3>
                      <p className="text-lg text-gray-600 mb-6">
                        Get real-time assistance for navigation, reading, or anything you need.
                      </p>
                      <p className="text-indigo-600 font-medium">
                        Tap to get help now →
                      </p>
                    </div>
                  </motion.div>
                </Link>

                {/* Card 4: Accessibility Map → /user/map */}
                <Link to="/user/map" className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src="https://thumbs.dreamstime.com/b/inclusion-support-people-disabilities-vector-illustration-modern-flat-depicting-diverse-group-scene-features-412350792.jpg"
                      alt="Inclusive community supporting each other with confidence"
                      className="w-full md:w-1/2 h-64 md:h-full object-cover"
                    />
                    <div className="p-10 text-center md:text-left flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Accessibility Map
                      </h3>
                      <p className="text-lg text-gray-600 mb-6">
                        Discover safe, accessible places and routes around you.
                      </p>
                      <p className="text-indigo-600 font-medium">
                        Tap to explore nearby →
                      </p>
                    </div>
                  </motion.div>
                </Link>
              </div>

              {/* Why We Built This - Warm closing note */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="text-center text-gray-600 text-lg max-w-3xl mx-auto italic mb-16"
              >
                InclusiCity exists because you deserve a space where you’re understood, 
                supported, and free to live life your way.
              </motion.p>

              {/* Final CTA */}
              <div className="text-center py-12">
                <p className="text-2xl md:text-3xl font-medium text-gray-800">
                  You belong here. Start exploring. 🌟
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <SOSButton />
    </div>
  );
};

export default UserHome;