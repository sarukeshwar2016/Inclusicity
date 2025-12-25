import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const HelperNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ================= LOGO + HELPER TAG ================= */}
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">
              <span className="text-indigo-600">Inclusi</span>
              <span className="text-green-600">City</span>
            </h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold tracking-wide">
              HELPER
            </span>
          </div>

          {/* ================= LOGOUT ONLY ================= */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HelperNavbar;