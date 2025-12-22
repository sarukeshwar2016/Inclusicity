import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Users, ClipboardList, CheckCircle, BarChart } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingHelpers, setPendingHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, helpersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingHelpers(),
      ]);

      setStats(statsRes.data);

      // ✅ Normalize helpers + FIX id vs _id
      const helpersRaw = Array.isArray(helpersRes.data)
        ? helpersRes.data
        : helpersRes.data.helpers || [];

      const normalizedHelpers = helpersRaw.map((h) => ({
        ...h,
        _id: h._id || h.id, // 🔥 CRITICAL FIX
      }));

      setPendingHelpers(normalizedHelpers);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setPendingHelpers([]);
      setLoading(false);
    }
  };

  const handleVerifyHelper = async (helperId) => {
    try {
      await adminAPI.verifyHelper(helperId);
      alert('Helper verified successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify helper');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600 mt-1">Monitor and manage the platform</p>

        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Users" value={stats.total_users} icon={<Users size={32} />} />
            <StatCard label="Total Helpers" value={stats.total_helpers} icon={<Users size={32} />} />
            <StatCard label="Total Requests" value={stats.total_requests} icon={<ClipboardList size={32} />} />
            <StatCard label="Completed" value={stats.completed_requests} icon={<CheckCircle size={32} />} />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart size={24} className="text-gray-700" />
            <h3 className="text-xl font-semibold text-gray-900">
              Pending Helper Verifications
            </h3>
          </div>

          {pendingHelpers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No pending helper verifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingHelpers.map((helper) => (
                <div
                  key={helper._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{helper.name}</h4>
                      <p className="text-sm text-gray-600">{helper.email}</p>

                      <div className="text-sm text-gray-500 mt-2 space-y-1">
                        <div>City: {helper.city}</div>
                        <div>
                          Skills:{' '}
                          {Array.isArray(helper.skills)
                            ? helper.skills.join(', ')
                            : helper.skills}
                        </div>
                      </div>

                      {/* 📎 DOCUMENT LINKS */}
                      {helper.documents && (
                        <div className="mt-3 space-y-1 text-sm">
                          {helper.documents.id_proof?.path && (
                            <a
                              href={`${API_BASE}/uploads/${helper.documents.id_proof.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block"
                            >
                              📄 View ID Proof
                            </a>
                          )}

                          {helper.documents.ngo_certificate?.path && (
                            <a
                              href={`${API_BASE}/uploads/${helper.documents.ngo_certificate.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block"
                            >
                              📄 View NGO Certificate
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleVerifyHelper(helper._id)}
                      className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Small reusable component ---------- */
const StatCard = ({ label, value = 0, icon }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value || 0}</p>
      </div>
      <div className="p-3 bg-gray-100 rounded-lg text-gray-700">{icon}</div>
    </div>
  </div>
);

export default AdminDashboard;
