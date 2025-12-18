import { useState, useEffect } from 'react';
import { requestsAPI, ratingsAPI, authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Power, MapPin, Star } from 'lucide-react';

const HelperDashboard = () => {
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const helperRes = await authAPI.getHelperMe();
      const helperAvailable = helperRes.data.available;
      setIsAvailable(helperAvailable);

      const ratingsRes = await ratingsAPI.getMy();
      setMyRatings(ratingsRes.data?.ratings || []);
      setAvgRating(ratingsRes.data?.avg_rating ?? null);
      setTotalReviews(ratingsRes.data?.total_reviews ?? 0);

      if (helperAvailable) {
        const reqRes = await requestsAPI.getAvailable();
        setAvailableRequests(reqRes.data?.available_requests || []);
      } else {
        setAvailableRequests([]);
      }
    } catch (err) {
      console.error('Helper dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const newState = !isAvailable;
      setIsAvailable(newState);
      await authAPI.toggleAvailability({ available: newState });
      await loadDashboard();
    } catch (err) {
      setIsAvailable((prev) => !prev);
      alert(err.response?.data?.error || 'Failed to toggle availability');
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      await requestsAPI.accept(id);
      alert('Request accepted');
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <Navbar />
        <div className="flex justify-center items-center h-96 text-gray-600 text-xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Helper Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Manage requests and view your ratings
            </p>
          </div>

          <button
            onClick={handleToggleAvailability}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg whitespace-nowrap ${
              isAvailable
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
            }`}
          >
            <Power size={20} />
            <span>{isAvailable ? 'Available' : 'Offline'}</span>
          </button>
        </div>

        {/* PERFORMANCE */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Your Performance</h3>
              <p className="text-gray-600 text-sm">
                {totalReviews} total reviews
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Star size={32} className="text-yellow-500" fill="currentColor" />
              <span className="text-3xl font-bold">{avgRating ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* REQUESTS */}
        <div className="space-y-4">
          {!isAvailable ? (
            <div className="bg-white p-12 text-center rounded-xl shadow">
              You are currently offline
            </div>
          ) : availableRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl shadow">
              No available requests
            </div>
          ) : (
            availableRequests.map((req) => (
              <div
                key={req.request_id}
                className="bg-white p-6 rounded-xl shadow"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin size={20} className="text-blue-600" />
                  <h3 className="text-xl font-semibold">{req.city}</h3>
                </div>
                <p className="text-gray-600 mb-3">{req.need}</p>
                <button
                  onClick={() => handleAcceptRequest(req.request_id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Accept
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HelperDashboard;
