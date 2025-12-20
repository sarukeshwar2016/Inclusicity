import { useState, useEffect } from 'react';
import { requestsAPI, ratingsAPI, authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Power, MapPin, Star } from 'lucide-react';

const HelperDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD DASHBOARD (FIXED)
  // =========================================================
  const loadDashboard = async () => {
    try {
      setLoading(true);

      // 1️⃣ Auth check
      const meRes = await authAPI.getMe();
      if (meRes.data?.user?.role !== 'helper') return;

      // 2️⃣ Helper availability
      const helperRes = await authAPI.getHelperMe();
      const available = helperRes.data.available;
      setIsAvailable(available);

      // 3️⃣ Ratings
      try {
        const ratingsRes = await ratingsAPI.getMy();
        setAvgRating(ratingsRes.data?.avg_rating ?? null);
        setTotalReviews(ratingsRes.data?.total_reviews ?? 0);
      } catch {
        setAvgRating(null);
        setTotalReviews(0);
      }

      // 4️⃣ Pending requests (AVAILABLE)
      let pendingRequests = [];
      if (available) {
        const res = await requestsAPI.getAvailable();
        pendingRequests = (res.data.available_requests || []).map(r => ({
          ...r,
          status: 'pending', // 🔥 IMPORTANT FIX
        }));
      }

      // 5️⃣ Accepted requests (MY)
      const myRes = await requestsAPI.getMy();
      const acceptedRequests = (myRes.data.requests || [])
        .filter(r => r.status === 'accepted');

      // 6️⃣ Merge
      setRequests([...pendingRequests, ...acceptedRequests]);

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
    const next = !isAvailable;
    setIsAvailable(next);
    try {
      await authAPI.toggleAvailability({ available: next });
      await loadDashboard();
    } catch {
      setIsAvailable(!next);
      alert('Failed to toggle availability');
    }
  };

  // =========================================================
  // ACCEPT REQUEST
  // =========================================================
  const handleAcceptRequest = async (id) => {
    try {
      await requestsAPI.accept(id);
      alert('Request accepted');
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept request');
    }
  };

  // =========================================================
  // COMPLETE REQUEST
  // =========================================================
  const handleCompleteRequest = async (id) => {
    try {
      await requestsAPI.complete(id);
      alert('Ride completed');
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
            <p className="text-gray-600">Manage requests and view ratings</p>
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
        <div className="bg-white p-6 rounded-xl shadow mb-6 flex justify-between">
          <div>
            <h3 className="font-semibold">Your Performance</h3>
            <p className="text-gray-600">{totalReviews} total reviews</p>
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
      No requests
    </div>
  ) : (
    requests.map((req) => (
      <div
        key={req.request_id}
        className="bg-white p-6 rounded-xl shadow"
      >
        {/* CITY */}
        <div className="flex items-center gap-3 mb-1">
          <MapPin className="text-blue-600" />
          <h3 className="text-xl font-semibold">{req.city}</h3>
        </div>

        {/* USER NAME (only for available requests) */}
        {req.user_name && (
          <p className="text-sm text-gray-500 mb-1">
            Requested by: <b>{req.user_name}</b>
          </p>
        )}

        {/* PICKUP ADDRESS */}
        {req.pickup_address && (
          <p className="text-sm text-gray-500">
            Pickup: {req.pickup_address}
          </p>
        )}

        {/* DESTINATION ADDRESS */}
        {req.destination_address && (
          <p className="text-sm text-gray-500 mb-2">
            Destination: {req.destination_address}
          </p>
        )}

        {/* NEED */}
        <p className="text-gray-700 mb-4">{req.need}</p>

        {/* ACTION BUTTONS */}
        {req.status === 'pending' && (
          <button
            onClick={() => handleAcceptRequest(req.request_id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Accept
          </button>
        )}

        {req.status === 'accepted' && (
          <button
            onClick={() => handleCompleteRequest(req.request_id)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Complete Ride
          </button>
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
