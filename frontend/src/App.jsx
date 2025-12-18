import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import HomePage from './pages/HomePage';       // ← NEW: Public landing page
import Login from './pages/Login';
import UserSignup from './pages/UserSignup';
import HelperSignup from './pages/HelperSignup';

// Protected Dashboards
import UserDashboard from './pages/UserDashboard';
import HelperDashboard from './pages/HelperDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />                    {/* ← Now shows InclusiCity homepage */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<UserSignup />} />            {/* User signup */}
          <Route path="/signup/helper" element={<HelperSignup />} />   {/* Helper signup */}

          {/* Protected Routes */}
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserDashboard />
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

          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Catch-all: redirect unknown paths to homepage or login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;