import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Users, ClipboardList, CheckCircle, BarChart } from 'lucide-react';

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

      // ✅ Normalize helpers response (array safety)
      const helpersArray = Array.isArray(helpersRes.data)
        ? helpersRes.data
        : helpersRes.data.helpers || [];

      setPendingHelpers(helpersArray);
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
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total_users || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users size={32} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Helpers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total_helpers || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users size={32} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total_requests || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ClipboardList size={32} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.completed_requests || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CheckCircle size={32} className="text-purple-600" />
                </div>
              </div>
            </div>
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
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{helper.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{helper.email}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>City: {helper.city}</span>
                      <span>
                        Skills:{' '}
                        {Array.isArray(helper.skills)
                          ? helper.skills.join(', ')
                          : helper.skills}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleVerifyHelper(helper._id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle size={18} />
                    <span>Verify</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {stats && stats.requests_by_status && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Requests by Status
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900 mt-2">
                  {stats.requests_by_status.pending || 0}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800">Accepted</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {stats.requests_by_status.accepted || 0}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800">Completed</p>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {stats.requests_by_status.completed || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
