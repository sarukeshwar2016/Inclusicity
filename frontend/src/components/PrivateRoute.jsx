import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  // ⏳ Wait for auth resolution
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // 🔒 Not logged in → Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Logged in but wrong role → Home
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'user') return <Navigate to="/user/home" replace />;
    if (role === 'helper') return <Navigate to="/helper/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
}


  // ✅ Authorized
  return children;
};

export default PrivateRoute;
