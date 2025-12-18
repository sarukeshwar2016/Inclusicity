import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">
              <span className="text-indigo-600">Inclusi</span>
              <span className="text-green-600">City</span>
            </h1>
            {role && (
              <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            )}
          </div>

          {/* User info + Logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2 text-gray-700">
                <User size={20} />
                <span className="text-sm font-medium truncate max-w-xs">{user.name || user.email}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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
