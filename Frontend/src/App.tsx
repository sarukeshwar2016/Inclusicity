import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import UserSignup from './pages/UserSignup';
import HelperSignup from './pages/HelperSignup';
import UserDashboard from './pages/UserDashboard';
import HelperDashboard from './pages/HelperDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/signup/helper" element={<HelperSignup />} />

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

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
