import { useState, useEffect } from 'react';
import { requestsAPI, ratingsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import { Plus, Clock, CheckCircle, X, MapPin, Phone, Star, Loader2, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const UserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    city: '', pickup_address: '', destination_address: '',
    phone: '', need: '', needed_date: '', needed_time: '',
  });
  const [ratingData, setRatingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await requestsAPI.getMy();
      setRequests(res.data?.requests || []);
    } catch { setError('Failed to load requests'); }
    finally { setLoading(false); }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await requestsAPI.create(newRequest);
      setNewRequest({ city: '', pickup_address: '', destination_address: '', phone: '', need: '', needed_date: '', needed_time: '' });
      setShowModal(false);
      fetchRequests();
    } catch (err) { alert(err.response?.data?.error || 'Failed to create request'); }
  };

  const handleCancelRequest = async (requestId) => {
    try { await requestsAPI.cancelByUser(requestId); await fetchRequests(); }
    catch (err) { alert(err.response?.data?.error || 'Failed to cancel request'); }
  };

  const handleRatingChange = (requestId, field, value) => {
    setRatingData(prev => ({ ...prev, [requestId]: { ...prev[requestId], [field]: value } }));
  };

  const handleSubmitRating = async (requestId) => {
    const rating = ratingData[requestId];
    if (!rating?.rating || !rating?.feedback) { alert('Please provide both rating and feedback'); return; }
    try {
      await ratingsAPI.create({ request_id: requestId, rating: Number(rating.rating), feedback: rating.feedback });
      setRequests(prev => prev.map(r => r.request_id === requestId ? { ...r, is_rated: true } : r));
      alert('Rating submitted successfully!');
    } catch (err) { alert(err.response?.data?.error || 'Failed to submit rating'); }
  };

  const statusConfig = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
    accepted: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    expired: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  };

  const getStatusBadge = (status) => {
    const s = statusConfig[status] || statusConfig.expired;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Interactive star rating
  const StarRating = ({ requestId, current }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} onClick={() => handleRatingChange(requestId, 'rating', star)}
          className="transition-all duration-200 hover:scale-125"
        >
          <Star size={28}
            className={star <= (current || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 hover:text-yellow-300'}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-indigo-600" />
            <p className="text-lg text-slate-600 font-medium">Loading your requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-50">
      <Navbar />
      <div className="flex pt-16">
        <SideBar />

        <motion.div className="flex-1" animate={{ marginLeft: '240px' }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
          <div className="px-6 py-10">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h2 className="text-4xl font-extrabold text-slate-900">My Requests</h2>
                <p className="text-slate-600 mt-2 text-lg">Create and manage your help requests</p>
              </div>
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(true)}
                className="group relative flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus size={20} /> New Request
                </span>
              </motion.button>
            </motion.div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-medium">{error}</div>
            )}

            {/* Request Cards */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
              {requests.length === 0 ? (
                <motion.div variants={fadeUp}
                  className="bg-white/80 backdrop-blur-sm p-16 rounded-3xl text-center shadow-xl border border-slate-100"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock size={36} className="text-slate-400" />
                  </div>
                  <p className="text-xl text-slate-600 font-medium">No requests yet</p>
                  <p className="text-slate-400 mt-2">Click "New Request" to get started</p>
                </motion.div>
              ) : (
                requests.map(req => (
                  <motion.div key={req.request_id} variants={fadeUp}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-100 p-7 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="text-indigo-600" size={20} />
                          <h3 className="text-xl font-bold text-slate-900">{req.city}</h3>
                        </div>
                        <p className="text-slate-600 text-base italic ml-8">"{req.need}"</p>

                        {req.needed_date && req.needed_time && (
                          <div className="flex items-center gap-2 text-slate-500 text-sm mt-2 ml-8">
                            <Calendar size={14} />
                            <span className="font-medium">{req.needed_date} at {req.needed_time}</span>
                          </div>
                        )}

                        {req.helper_name && (
                          <p className="text-sm text-slate-500 mt-2 ml-8">
                            Helper: <span className="font-bold text-indigo-600">{req.helper_name}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {getStatusBadge(req.status)}
                        {(req.status === 'pending' || req.status === 'accepted') && req.status !== 'expired' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleCancelRequest(req.request_id || req._id)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-semibold border border-red-200"
                          >
                            <X size={14} /> Cancel
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Rating Section */}
                    {req.status === 'completed' && !req.is_rated && (
                      <div className="mt-5 bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200">
                        <h4 className="font-bold text-slate-800 mb-4 text-lg flex items-center gap-2">
                          <Star size={20} className="text-yellow-500" />
                          Rate {req.helper_name || 'this helper'}
                        </h4>

                        <StarRating requestId={req.request_id} current={ratingData[req.request_id]?.rating} />

                        <textarea
                          placeholder="Share your experience..."
                          rows="2"
                          className="w-full mt-4 px-5 py-3 bg-white border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all resize-none text-slate-800"
                          value={ratingData[req.request_id]?.feedback || ''}
                          onChange={(e) => handleRatingChange(req.request_id, 'feedback', e.target.value)}
                        />

                        <motion.button
                          whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                          onClick={() => handleSubmitRating(req.request_id)}
                          className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200/50 hover:shadow-xl transition-all"
                        >
                          Submit Rating
                        </motion.button>
                      </div>
                    )}

                    {req.is_rated && (
                      <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl w-fit">
                        <CheckCircle size={18} />
                        <span className="text-sm font-bold">Rating submitted</span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ==================== CREATE REQUEST MODAL ==================== */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-lg p-8 relative shadow-2xl border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Plus className="text-indigo-600" size={22} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">New Request</h3>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">City</label>
                  <input type="text" placeholder="Your city" required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                    value={newRequest.city}
                    onChange={(e) => setNewRequest({ ...newRequest, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Pickup Address</label>
                  <input type="text" placeholder="Where to pick you up" required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                    value={newRequest.pickup_address}
                    onChange={(e) => setNewRequest({ ...newRequest, pickup_address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Destination</label>
                  <input type="text" placeholder="Where you need to go" required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                    value={newRequest.destination_address}
                    onChange={(e) => setNewRequest({ ...newRequest, destination_address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Phone</label>
                  <input type="tel" placeholder="+91 98765 43210" required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                    value={newRequest.phone}
                    onChange={(e) => setNewRequest({ ...newRequest, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Reason / Need</label>
                  <textarea placeholder="e.g. Hospital visit, grocery shopping..." rows="2" required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none"
                    value={newRequest.need}
                    onChange={(e) => setNewRequest({ ...newRequest, need: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Date</label>
                    <input type="date" required
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                      value={newRequest.needed_date}
                      onChange={(e) => setNewRequest({ ...newRequest, needed_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Time</label>
                    <input type="time" required
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                      value={newRequest.needed_time}
                      onChange={(e) => setNewRequest({ ...newRequest, needed_time: e.target.value })}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full mt-2 px-6 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200/50 hover:shadow-xl transition-all"
                >
                  Submit Request
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;