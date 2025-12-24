import { useAuth } from '../contexts/AuthContext';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import {
  LogOut,
  User,
  Radio,
  LayoutDashboard
} from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ================= ACTIVE CHECK FOR DASHBOARD =================
  // Dashboard is active on: /user/home, /user/dashboard, /user/map
  const isDashboardActive = [
    '/user/home',
    '/user/dashboard',
    '/user/map'
  ].includes(location.pathname);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ================= LOGO ================= */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <h1 className="text-2xl font-bold">
              <span className="text-indigo-600">Inclusi</span>
              <span className="text-green-600">City</span>
            </h1>

            {role && (
              <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                {role.toUpperCase()}
              </span>
            )}
          </div>

          {/* ================= NAV LINKS ================= */}
          {role && (
            <div className="hidden md:flex items-center space-x-2">

              {/* Dashboard - Active on Home, Dashboard & Map */}
              <NavLink
                to="/user/home"  // Clicking goes to Home, but active state covers multiple paths
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isDashboardActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </NavLink>

              {/* Voice Rooms (User + Admin) */}
              {(role === 'user' || role === 'admin') && (
                <NavLink
                  to="/user/voice"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Radio size={18} />
                  Voice Rooms
                </NavLink>
              )}
            </div>
          )}

          {/* ================= USER INFO & LOGOUT ================= */}
          <div className="flex items-center space-x-4">

            {user && (
              <div className="hidden sm:flex items-center space-x-2 text-gray-700">
                <User size={18} />
                <span className="text-sm font-medium truncate max-w-xs">
                  {user.name || user.email}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;