import { useState } from 'react';
import { Home, MapPin, User, Settings, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  // ✅ Paths fixed, behavior unchanged
  const links = [
    {
      name: 'Request',
      path: '/user/dashboard',   // ✅ FIXED
      icon: <Home size={20} />,
    },
    {
      name: 'Map',
      path: '/user/map',         // ✅ SAME AS BEFORE
      icon: <MapPin size={20} />,
    },
    {
      name: 'Profile',
      path: '/user/profile',     // ⚠️ placeholder (route not added yet)
      icon: <User size={20} />,
      disabled: true,
    },
    {
      name: 'Settings',
      path: '/user/settings',    // ⚠️ placeholder (route not added yet)
      icon: <Settings size={20} />,
      disabled: true,
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

          // 🔒 Disable non-existing routes visually
          if (link.disabled) {
            return (
              <div
                key={link.name}
                className="flex items-center gap-4 px-4 py-3 my-1 rounded-lg text-gray-400 cursor-not-allowed"
              >
                {link.icon}
                {isOpen && <span>{link.name}</span>}
              </div>
            );
          }

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-4 px-4 py-3 my-1 rounded-lg transition-colors
                hover:bg-indigo-50
                ${
                  isActive
                    ? 'bg-indigo-100 font-semibold text-indigo-700'
                    : 'text-gray-700'
                }
              `}
            >
              {link.icon}
              {isOpen && <span>{link.name}</span>}
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default SideBar;
