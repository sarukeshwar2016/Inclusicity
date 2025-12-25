import { useState, useEffect } from 'react';
import { requestsAPI, ratingsAPI, authAPI } from '../services/api';
import HelperNavbar from '../components/HelperNavbar';
import HelperSidebar from '../components/HelperSidebar'; // ← Added HelperSidebar
import { Power, MapPin, Star, Clock } from 'lucide-react';

const HelperDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const meRes = await authAPI.getMe();
      if (meRes.data?.user?.role !== 'helper') return;

      const helperRes = await authAPI.getHelperMe();
      const available = helperRes.data.available === true;
      setIsAvailable(available);

      try {
        const ratingsRes = await ratingsAPI.getMy();
        setAvgRating(ratingsRes.data?.avg_rating ?? null);
        setTotalReviews(ratingsRes.data?.total_reviews ?? 0);
      } catch {
        setAvgRating(null);
        setTotalReviews(0);
      }

      let pending = [];
      if (available) {
        const res = await requestsAPI.getAvailable();
        pending = (res.data.available_requests || []).map(r => ({
          ...r,
          status: 'pending',
        }));
      }

      const myRes = await requestsAPI.getMy();
      const accepted = (myRes.data.requests || []).filter(
        r => r.status === 'accepted'
      );

      setRequests([...pending, ...accepted]);

    } catch (err) {
      console.error('Helper dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // TOGGLE AVAILABILITY
  // =========================================================
  const handleToggleAvailability = async () => {
    try {
      const next = !isAvailable;
      await authAPI.toggleAvailability({ available: next });
      setIsAvailable(next);
      await loadDashboard();
    } catch {
      alert('Failed to toggle availability');
    }
  };

  // =========================================================
  // ACTIONS
  // =========================================================
  const handleAcceptRequest = async (id) => {
    try {
      await requestsAPI.accept(id);
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleCancelRequest = async (id) => {
    try {
      await requestsAPI.cancelByHelper(id);
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel request');
    }
  };

  const handleCompleteRequest = async (id) => {
    try {
      await requestsAPI.complete(id);
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete request');
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <HelperSidebar />
        <div className="flex-1">
          <HelperNavbar />
          <div className="flex justify-center items-center h-screen text-xl text-gray-600">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50 flex">
      {/* Sidebar */}
      <HelperSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-20 lg:ml-60 transition-all duration-300">
        <HelperNavbar />

        <div className="max-w-5xl mx-auto px-4 py-12 pt-28">
          {/* HEADER */}
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Helper Dashboard</h1>
              <p className="text-lg text-gray-600 mt-2">Ready to make a difference today?</p>
            </div>

            <button
              onClick={handleToggleAvailability}
              className={`px-8 py-4 rounded-xl flex items-center gap-3 text-lg font-semibold shadow-lg transition ${
                isAvailable
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              <Power size={24} />
              {isAvailable ? 'Available for Requests' : 'Go Online'}
            </button>
          </div>

          {/* PERFORMANCE CARD */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl mb-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800">Your Impact</h3>
              <p className="text-gray-600 mt-1">{totalReviews} people helped & reviewed</p>
            </div>
            <div className="flex items-center gap-3">
              <Star className="text-yellow-500 w-12 h-12" fill="currentColor" />
              <span className="text-5xl font-bold text-gray-900">
                {avgRating ? avgRating.toFixed(1) : '—'}
              </span>
            </div>
          </div>

          {/* REQUEST LIST */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {requests.length > 0 ? 'Current Requests' : 'No Active Requests'}
          </h2>

          <div className="space-y-6">
            {requests.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm p-16 text-center rounded-2xl shadow-lg border border-gray-200">
                <p className="text-xl text-gray-600">
                  {isAvailable
                    ? 'No requests right now — relax, they’ll come!'
                    : 'Go online to start receiving requests'}
                </p>
              </div>
            ) : (
              requests.map(req => (
                <div
                  key={req.request_id}
                  className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="text-indigo-600 w-6 h-6" />
                        <h3 className="text-2xl font-bold text-gray-900">{req.city}</h3>
                      </div>

                      {req.user_name && (
                        <p className="text-lg text-gray-700 mb-2">
                          Requested by <span className="font-semibold">{req.user_name}</span>
                        </p>
                      )}

                      {req.needed_date && req.needed_time && (
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <Clock size={18} />
                          <span className="font-medium">{req.needed_date} at {req.needed_time}</span>
                        </div>
                      )}

                      <div className="space-y-1 text-gray-700">
                        <p><span className="font-medium">Pickup:</span> {req.pickup_address}</p>
                        <p><span className="font-medium">Destination:</span> {req.destination_address}</p>
                      </div>

                      <p className="mt-4 text-gray-800 italic">"{req.need}"</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleAcceptRequest(req.request_id)}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                        >
                          Accept Request
                        </button>
                      )}

                      {req.status === 'accepted' && (
                        <>
                          <button
                            onClick={() => handleCompleteRequest(req.request_id)}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                          >
                            Mark as Complete
                          </button>

                          <button
                            onClick={() => handleCancelRequest(req.request_id)}
                            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperDashboard;