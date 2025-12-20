import { useState } from 'react';
import { Home, MapPin, User, Settings, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const links = [
    {
      name: 'Request',
      path: '/dashboard',
      icon: <Home size={20} />,
    },
    {
      name: 'Map',
      path: '/user/map',          // ✅ CORRECT MAP ROUTE
      icon: <MapPin size={20} />,
    },
    {
      name: 'Profile',
      path: '/dashboard/profile',
      icon: <User size={20} />,
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: <Settings size={20} />,
    },
  ];

  return (
    <motion.div
      animate={{ width: isOpen ? 240 : 64 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-md h-screen flex flex-col"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Navigation */}
      <nav className="mt-4 flex-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-4 px-4 py-3 my-1 rounded-lg transition-colors
                hover:bg-indigo-50
                ${isActive ? 'bg-indigo-100 font-semibold text-indigo-700' : 'text-gray-700'}
              `}
            >
              {link.icon}
              {isOpen && (
                <span className="whitespace-nowrap">{link.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default SideBar;
