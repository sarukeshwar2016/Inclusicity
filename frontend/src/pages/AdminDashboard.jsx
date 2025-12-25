import { useState, useEffect } from 'react';
import { adminAPI, voiceSocket } from '../services/api';
import Navbar from '../components/Navbar';
import { 
  Users, 
  ClipboardList, 
  CheckCircle, 
  BarChart, 
  AlertCircle, 
  ShieldAlert,
  Clock
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingHelpers, setPendingHelpers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    // 🚨 Real-time SOS Listener
    voiceSocket.on("admin_sos_alert", (data) => {
      // Add only if it's an active alert (prevent duplicates if already resolved)
      if (data.status === "active") {
        setSosAlerts((prev) => [data, ...prev]);
      }
    });

    return () => {
      voiceSocket.off("admin_sos_alert");
    };
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, helpersRes, sosRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingHelpers(),
        adminAPI.getSOS(), 
      ]);

      setStats(statsRes.data);
      
      // ✅ FIX A: Filter only ACTIVE SOS alerts from history
      const activeSOS = (sosRes.data.sos || []).filter(s => s.status === "active");
      setSosAlerts(activeSOS);

      const helpersRaw = Array.isArray(helpersRes.data)
        ? helpersRes.data
        : helpersRes.data.helpers || [];

      const normalizedHelpers = helpersRaw.map((h) => ({
        ...h,
        _id: h._id || h.id,
      }));

      setPendingHelpers(normalizedHelpers);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
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

  const handleResolveSOS = async (sosId) => {
    try {
      await adminAPI.resolveSOS(sosId);
      fetchData(); // re-fetch from DB to sync status
      alert("Emergency resolved.");
    } catch (err) {
      alert("Failed to resolve SOS");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
             <div className="text-xl text-gray-600 font-medium">Loading Dashboard...</div>
          </div>
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
          <p className="text-gray-600 mt-1">Monitor platform health and safety</p>
        </div>

        {/* 📊 STATS CARDS */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Users" value={stats.total_users} icon={<Users size={28} />} />
            <StatCard label="Total Helpers" value={stats.total_helpers} icon={<Users size={28} />} />
            <StatCard label="Total Requests" value={stats.total_requests} icon={<ClipboardList size={28} />} />
            <StatCard label="Completed" value={stats.completed_requests} icon={<CheckCircle size={28} />} />
          </div>
        )}

        {/* 🚨 ACTIVE SOS SECTION */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={24} className="text-red-600" />
            <h3 className="text-xl font-bold text-gray-900">Active SOS Alerts</h3>
          </div>

          {sosAlerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
               <CheckCircle size={40} className="mx-auto text-green-500 mb-2" />
               <p className="text-gray-500">All systems clear. No active emergencies.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sosAlerts.map((sos) => (
                <div 
                  key={sos._id} 
                  className="bg-white border-l-8 border-red-600 rounded-xl shadow-md p-6 animate-in fade-in slide-in-from-top-4"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {/* ✅ FIX B: MATCH DB SCHEMA (Using Email & Role) */}
                        <span className="font-bold text-lg text-gray-900">
                          {sos.email || "Unknown User"}
                        </span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase">Emergency</span>
                      </div>
                      <p className="text-gray-700 text-base mb-2 italic">
                        "{sos.message}"
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={14} />
                          {new Date(sos.created_at || sos.triggered_at).toLocaleString()}
                        </span>
                        <span className="font-medium px-2 py-0.5 bg-gray-100 rounded">
                          Role: {sos.role}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleResolveSOS(sos._id)}
                      className="w-full md:w-auto px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <AlertCircle size={18} />
                      Resolve Alert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📋 HELPER VERIFICATIONS */}
        <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart size={24} className="text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-900">Pending Helper Verifications</h3>
          </div>

          {pendingHelpers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No helpers waiting for approval.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingHelpers.map((helper) => (
                <div key={helper._id} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-gray-900">{helper.name}</h4>
                      <p className="text-sm text-gray-600 font-medium">{helper.email}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mt-3">
                        <p className="text-sm text-gray-500"><span className="font-semibold">City:</span> {helper.city}</p>
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Skills:</span> {Array.isArray(helper.skills) ? helper.skills.join(', ') : helper.skills}
                        </p>
                      </div>

                      {helper.documents && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {helper.documents.id_proof?.path && (
                            <a
                              href={`${API_BASE}/uploads/${helper.documents.id_proof.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition"
                            >
                              📄 ID PROOF
                            </a>
                          )}
                          {helper.documents.ngo_certificate?.path && (
                            <a
                              href={`${API_BASE}/uploads/${helper.documents.ngo_certificate.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition"
                            >
                              📄 NGO CERTIFICATE
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleVerifyHelper(helper._id)}
                      className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CheckCircle size={18} />
                      Verify Member
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

/* Reusable Stat Card */
const StatCard = ({ label, value = 0, icon }) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-50">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value || 0}</p>
      </div>
      <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
        {icon}
      </div>
    </div>
  </div>
);

export default AdminDashboard;