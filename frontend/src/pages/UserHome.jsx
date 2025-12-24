import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import { motion } from 'framer-motion';

const UserHome = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex pt-16">
        <SideBar />

        {/* Main content area - pushed right to avoid sidebar overlap */}
        <motion.div
          className="flex-1"
          animate={{ marginLeft: '240px' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <div className="px-6 py-12">
            {/* Blank space - you can add content later */}
            <div className="max-w-7xl mx-auto">
              {/* Optional placeholder */}
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Welcome to InclusiCity
                </h1>
                <p className="text-xl text-gray-600">
                  This is your home page. Content coming soon!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserHome;