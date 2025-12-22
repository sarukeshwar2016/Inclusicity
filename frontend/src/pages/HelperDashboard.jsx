import { useState, useEffect } from 'react';
import { requestsAPI, ratingsAPI, authAPI } from '../services/api';
import Navbar from '../components/Navbar';
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

      // Role check
      const meRes = await authAPI.getMe();
      if (meRes.data?.user?.role !== 'helper') return;

      // Availability
      const helperRes = await authAPI.getHelperMe();
      const available = helperRes.data.available === true;
      setIsAvailable(available);

      // Ratings
      try {
        const ratingsRes = await ratingsAPI.getMy();
        setAvgRating(ratingsRes.data?.avg_rating ?? null);
        setTotalReviews(ratingsRes.data?.total_reviews ?? 0);
      } catch {
        setAvgRating(null);
        setTotalReviews(0);
      }

      // Available requests
      let pending = [];
      if (available) {
        const res = await requestsAPI.getAvailable();
        pending = (res.data.available_requests || []).map(r => ({
          ...r,
          status: 'pending',
        }));
      }

      // Accepted requests
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
      alert(err.response?.data?.error || 'Failed to complete ride');
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <Navbar />
        <div className="flex justify-center items-center h-96 text-xl text-gray-600">
          Loading...
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Helper Dashboard</h2>
            <p className="text-gray-600">Manage requests</p>
          </div>

          <button
            onClick={handleToggleAvailability}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
              isAvailable
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            <Power size={20} />
            {isAvailable ? 'Available' : 'Offline'}
          </button>
        </div>

        {/* PERFORMANCE */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Your Performance</h3>
            <p className="text-gray-600">{totalReviews} reviews</p>
          </div>
          <div className="flex items-center gap-2">
            <Star className="text-yellow-500" fill="currentColor" />
            <span className="text-3xl font-bold">{avgRating ?? '—'}</span>
          </div>
        </div>

        {/* REQUEST LIST */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl shadow">
              No requests available
            </div>
          ) : (
            requests.map(req => (
              <div key={req.request_id} className="bg-white p-6 rounded-xl shadow">

                <div className="flex items-center gap-3 mb-1">
                  <MapPin className="text-blue-600" />
                  <h3 className="text-xl font-semibold">{req.city}</h3>
                </div>

                {req.user_name && (
                  <p className="text-sm text-gray-500">
                    Requested by <b>{req.user_name}</b>
                  </p>
                )}

                {req.needed_date && req.needed_time && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 my-2">
                    <Clock size={16} />
                    {req.needed_date} at {req.needed_time}
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  Pickup: {req.pickup_address}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Destination: {req.destination_address}
                </p>

                <p className="text-gray-700 mb-3">{req.need}</p>

                {req.status === 'pending' && (
                  <button
                    onClick={() => handleAcceptRequest(req.request_id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Accept
                  </button>
                )}

  {req.status === 'accepted' && (
  <div className="flex gap-3">
    <button
      onClick={() => handleCompleteRequest(req.request_id)}
      className="bg-green-600 text-white px-4 py-2 rounded-lg"
    >
      Complete
    </button>

    <button
      onClick={() => handleCancelRequest(req.request_id)}
      className="bg-red-600 text-white px-4 py-2 rounded-lg"
    >
      Cancel
    </button>
  </div>
)}

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default HelperDashboard;
