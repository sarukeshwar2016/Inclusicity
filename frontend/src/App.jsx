import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import UserVoiceRooms from './pages/UserVoiceRooms';

// Public Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import UserSignup from './pages/UserSignup';
import HelperSignup from './pages/HelperSignup';

// Dashboards
import UserDashboard from './pages/UserDashboard';
import HelperDashboard from './pages/HelperDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Map Page
import UserMap from './pages/UserMap';

// NEW: Home Page for users
import UserHome from './pages/UserHome';  // ← Add this import
import HelperHome from './pages/HelperHome';

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

          {/* ================= USER ROUTES ================= */}
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          {/* NEW: User Home Route */}
          <Route
            path="/user/home"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserHome />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/voice"
            element={
              <PrivateRoute allowedRoles={["user", "admin"]}>
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

          {/* ================= HELPER ROUTES ================= */}
{/* ================= HELPER ROUTES ================= */}
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

          {/* ================= ADMIN ROUTES ================= */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
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