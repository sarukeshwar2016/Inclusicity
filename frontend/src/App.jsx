import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import UserSignup from './pages/UserSignup';
import HelperSignup from './pages/HelperSignup';

// User Pages
import UserHome from './pages/UserHome';
import UserDashboard from './pages/UserDashboard';
import UserVoiceRooms from './pages/UserVoiceRooms';
import UserMap from './pages/UserMap';
import UserProfile from './pages/UserProfile';
import UserSettings from './pages/UserSettings'; // ← Added

// Helper Pages
import HelperHome from './pages/HelperHome';
import HelperDashboard from './pages/HelperDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/signup/helper" element={<HelperSignup />} />

          {/* ================= USER PROTECTED ROUTES ================= */}
          <Route
            path="/user/home"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserHome />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/voice"
            element={
              <PrivateRoute allowedRoles={['user', 'admin']}>
                <UserVoiceRooms />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/map"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserMap />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/profile"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserProfile />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/settings"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserSettings />
              </PrivateRoute>
            }
          />

          {/* Default redirect when accessing /user directly */}
          <Route
            path="/user"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <Navigate to="/user/home" replace />
              </PrivateRoute>
            }
          />

          {/* ================= HELPER PROTECTED ROUTES ================= */}
          <Route
            path="/helper/home"
            element={
              <PrivateRoute allowedRoles={['helper']}>
                <HelperHome />
              </PrivateRoute>
            }
          />

          <Route
            path="/helper/dashboard"
            element={
              <PrivateRoute allowedRoles={['helper']}>
                <HelperDashboard />
              </PrivateRoute>
            }
          />

          {/* Additional helper routes (placeholders for future pages) */}
          <Route
            path="/helper/request"
            element={
              <PrivateRoute allowedRoles={['helper']}>
                <HelperDashboard /> {/* Can be replaced with dedicated page later */}
              </PrivateRoute>
            }
          />

          <Route
            path="/helper/history"
            element={
              <PrivateRoute allowedRoles={['helper']}>
                <div className="p-10 text-center text-2xl text-gray-600">Helper History (Coming Soon)</div>
              </PrivateRoute>
            }
          />

          <Route
            path="/helper/alerts"
            element={
              <PrivateRoute allowedRoles={['helper']}>
                <div className="p-10 text-center text-2xl text-gray-600">Helper Alerts (Coming Soon)</div>
              </PrivateRoute>
            }
          />

          <Route
            path="/helper/profile"
            element={
              <PrivateRoute allowedRoles={['helper']}>
                <div className="p-10 text-center text-2xl text-gray-600">Helper Profile (Coming Soon)</div>
              </PrivateRoute>
            }
          />

          <Route
            path="/helper/settings"
            element={
              <PrivateRoute allowedRoles={['helper']}>
                <div className="p-10 text-center text-2xl text-gray-600">Helper Settings (Coming Soon)</div>
              </PrivateRoute>
            }
          />

          {/* Default redirect for helpers */}
          <Route
            path="/helper"
            element={
              <PrivateRoute allowedRoles={['helper']}>
                <Navigate to="/helper/home" replace />
              </PrivateRoute>
            }
          />

          {/* ================= ADMIN PROTECTED ROUTES ================= */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <Navigate to="/admin/dashboard" replace />
              </PrivateRoute>
            }
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;