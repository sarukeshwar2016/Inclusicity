import { useState } from 'react';
import { Home, HelpCircle, History, BellRing, User, Settings, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const HelperSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const links = [
    {
      name: 'Home',
      path: '/helper/home',
      icon: <Home size={20} />,
    },
    {
      name: 'Request',
      path: '/helper/dashboard',
      icon: <HelpCircle size={20} />,
    },
    {
      name: 'History',
      path: '/helper/history',
      icon: <History size={20} />,
    },
    {
      name: 'Alerts',
      path: '/helper/alerts',
      icon: <BellRing size={20} />,
    },
    {
      name: 'Profile',
      path: '/helper/profile',
      icon: <User size={20} />,
    },
    {
      name: 'Settings',
      path: '/helper/settings',
      icon: <Settings size={20} />,
    },
  ];

  return (
    <motion.div
      animate={{ width: isOpen ? 240 : 80 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="bg-white shadow-lg h-screen fixed left-0 top-0 bottom-0 flex flex-col overflow-hidden z-40"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 hover:bg-gray-100 focus:outline-none transition-colors"
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Navigation */}
      <nav className="mt-2 flex-1 px-3 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-4 px-4 py-3 my-1 rounded-lg transition-all duration-200
                hover:bg-green-50 hover:text-green-700
                ${isActive
                  ? 'bg-green-100 text-green-700 font-semibold'
                  : 'text-gray-700'
                }
              `}
            >
              <div className={isActive ? 'text-green-700' : 'text-gray-600'}>
                {link.icon}
              </div>
              {isOpen && <span className="font-medium">{link.name}</span>}
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default HelperSidebar;