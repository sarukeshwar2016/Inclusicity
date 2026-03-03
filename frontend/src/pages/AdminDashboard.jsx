import { useState, useEffect } from 'react';
import { adminAPI, voiceSocket } from '../services/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import {
  Users, ClipboardList, CheckCircle, BarChart, AlertCircle,
  ShieldAlert, Clock, Loader2, Shield, FileText, XCircle
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingHelpers, setPendingHelpers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    voiceSocket.on("admin_sos_alert", (data) => {
      if (data.status === "active") {
        setSosAlerts((prev) => [data, ...prev]);
      }
    });
    return () => { voiceSocket.off("admin_sos_alert"); };
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, helpersRes, sosRes] = await Promise.all([
        adminAPI.getStats(), adminAPI.getPendingHelpers(), adminAPI.getSOS(),
      ]);
      setStats(statsRes.data);
      const activeSOS = (sosRes.data.sos || []).filter(s => s.status === "active");
      setSosAlerts(activeSOS);
      const helpersRaw = Array.isArray(helpersRes.data) ? helpersRes.data : helpersRes.data.helpers || [];
      setPendingHelpers(helpersRaw.map((h) => ({ ...h, _id: h._id || h.id })));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setLoading(false);
    }
  };

  const handleVerifyHelper = async (helperId) => {
    try { await adminAPI.verifyHelper(helperId); alert('Helper verified successfully!'); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to verify helper'); }
  };

  const handleRejectHelper = async (helperId) => {
    const reason = prompt("Reason for rejection (optional):");
    try { await adminAPI.rejectHelper(helperId, reason || undefined); alert('Helper rejected.'); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to reject helper'); }
  };

  const handleResolveSOS = async (sosId) => {
    try { await adminAPI.resolveSOS(sosId); fetchData(); alert("Emergency resolved."); }
    catch { alert("Failed to resolve SOS"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-indigo-600" />
            <p className="text-lg text-slate-600 font-medium">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users, icon: <Users size={24} />, gradient: 'from-indigo-500 to-indigo-600', lightBg: 'bg-indigo-50' },
    { label: 'Total Helpers', value: stats?.total_helpers, icon: <Shield size={24} />, gradient: 'from-emerald-500 to-emerald-600', lightBg: 'bg-emerald-50' },
    { label: 'Total Requests', value: stats?.total_requests, icon: <ClipboardList size={24} />, gradient: 'from-blue-500 to-blue-600', lightBg: 'bg-blue-50' },
    { label: 'Completed', value: stats?.completed_requests, icon: <CheckCircle size={24} />, gradient: 'from-purple-500 to-purple-600', lightBg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900">Admin Dashboard</h2>
          <p className="text-lg text-slate-600 mt-2">Monitor platform health and safety</p>
        </motion.div>

        {/* 📊 STATS CARDS */}
        {stats && (
          <motion.div initial="hidden" animate="visible" variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
          >
            {statCards.map((card, i) => (
              <motion.div key={i} variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
                    <p className="text-4xl font-extrabold text-slate-900">{card.value || 0}</p>
                  </div>
                  <div className={`w-14 h-14 ${card.lightBg} rounded-2xl flex items-center justify-center`}>
                    <div className={`bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 🚨 ACTIVE SOS SECTION */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="mb-10">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <ShieldAlert size={22} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Active SOS Alerts</h3>
          </motion.div>

          {sosAlerts.length === 0 ? (
            <motion.div variants={fadeUp}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 p-10 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <p className="text-slate-600 font-medium text-lg">All systems clear. No active emergencies.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {sosAlerts.map((sos) => (
                <motion.div key={sos._id} variants={fadeUp}
                  className="bg-white/90 backdrop-blur-sm border-l-4 border-red-500 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-slate-900">{sos.email || "Unknown User"}</span>
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">Emergency</span>
                      </div>
                      <p className="text-slate-700 text-base italic mb-3">"{sos.message}"</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {new Date(sos.created_at || sos.triggered_at).toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-lg font-bold">Role: {sos.role}</span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleResolveSOS(sos._id)}
                      className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200/50 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <AlertCircle size={18} /> Resolve Alert
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 📋 HELPER VERIFICATIONS */}
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-100 p-8 overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BarChart size={22} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Pending Helper Verifications</h3>
            </div>

            {pendingHelpers.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium text-lg">No helpers waiting for approval.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingHelpers.map((helper) => (
                  <motion.div key={helper._id} variants={fadeUp}
                    className="py-7 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                            <span className="text-indigo-600 font-bold text-lg">
                              {helper.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">{helper.name}</h4>
                            <p className="text-sm text-slate-500 font-medium">{helper.email}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-1 ml-15 text-sm text-slate-600">
                          <p><span className="font-semibold text-slate-700">City:</span> {helper.city}</p>
                          <p><span className="font-semibold text-slate-700">Skills:</span> {Array.isArray(helper.skills) ? helper.skills.join(', ') : helper.skills}</p>
                        </div>

                        {/* Documents */}
                        {helper.documents && (
                          <div className="flex flex-wrap gap-2 ml-15">
                            {helper.documents.government_ids && Object.entries(helper.documents.government_ids).map(([key, doc]) => (
                              doc?.file_url && (
                                <a key={key}
                                  href={`${API_BASE}/uploads/${doc.file_url}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl hover:bg-indigo-100 transition border border-indigo-200/50"
                                >
                                  <FileText size={12} /> {key.replace(/_/g, ' ').toUpperCase()}
                                </a>
                              )
                            ))}
                            {helper.documents.address_proof?.file_url && (
                              <a href={`${API_BASE}/uploads/${helper.documents.address_proof.file_url}`}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition border border-emerald-200/50"
                              >
                                <FileText size={12} /> ADDRESS PROOF
                              </a>
                            )}
                            {helper.documents.ngo_certificate?.file_url && (
                              <a href={`${API_BASE}/uploads/${helper.documents.ngo_certificate.file_url}`}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-2 rounded-xl hover:bg-purple-100 transition border border-purple-200/50"
                              >
                                <FileText size={12} /> NGO CERTIFICATE
                              </a>
                            )}
                            {Array.isArray(helper.documents.past_experience) && helper.documents.past_experience.map((exp, idx) => (
                              exp?.file_url && (
                                <a key={idx}
                                  href={`${API_BASE}/uploads/${exp.file_url}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-xl hover:bg-amber-100 transition border border-amber-200/50"
                                >
                                  <FileText size={12} /> EXPERIENCE #{idx + 1}
                                </a>
                              )
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <motion.button
                          whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                          onClick={() => handleVerifyHelper(helper._id)}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200/50 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} /> Verify
                        </motion.button>
                        <motion.button
                          whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                          onClick={() => handleRejectHelper(helper._id)}
                          className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl border-2 border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle size={18} /> Reject
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;