import { useState, useEffect } from 'react';
import { requestsAPI, ratingsAPI, authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Power, MapPin, CheckCircle, Star } from 'lucide-react';

const HelperDashboard = () => {
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, ratingsRes] = await Promise.all([
        requestsAPI.getAvailable(),
        ratingsAPI.getMy(),
      ]);

      // ✅ Available requests
      setAvailableRequests(requestsRes.data?.available_requests || []);

      // ✅ Ratings response shape:
      // { total_reviews, avg_rating, ratings: [] }
      setMyRatings(ratingsRes.data?.ratings || []);
      setAvgRating(ratingsRes.data?.avg_rating ?? null);
      setTotalReviews(ratingsRes.data?.total_reviews ?? 0);

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const res = await authAPI.toggleAvailability({
        available: !isAvailable,
      });
      setIsAvailable(res.data.available);
    } catch (err) {
      alert('Failed to toggle availability');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await requestsAPI.accept(requestId);
      alert('Request accepted successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleCompleteRequest = async (requestId) => {
    try {
      await requestsAPI.complete(requestId);
      alert('Request marked as completed!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete request');
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Helper Dashboard</h2>
              <p className="text-gray-600 mt-1">
                Manage requests and view your ratings
              </p>
            </div>

            <button
              onClick={handleToggleAvailability}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                isAvailable
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              <Power size={20} />
              <span>{isAvailable ? 'Available' : 'Offline'}</span>
            </button>
          </div>

          {/* PERFORMANCE CARD */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Performance
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {totalReviews} total reviews
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Star size={32} className="text-yellow-500" fill="currentColor" />
                <span className="text-3xl font-bold text-gray-900">
                  {avgRating ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'available'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Available Requests
            </button>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'ratings'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Ratings
            </button>
          </div>
        </div>

        {/* AVAILABLE REQUESTS */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            {availableRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  No available requests at the moment
                </p>
              </div>
            ) : (
              availableRequests.map((req) => (
                <div
                  key={req.request_id}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <MapPin size={20} className="text-blue-600" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {req.city}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-3">{req.need}</p>
                    </div>

                    <div>
                      <button
                        onClick={() => handleAcceptRequest(req.request_id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* RATINGS */}
        {activeTab === 'ratings' && (
          <div className="space-y-4">
            {myRatings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Star size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  No ratings yet. Complete requests to get rated!
                </p>
              </div>
            ) : (
              myRatings.map((rating, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < rating.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{rating.feedback}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelperDashboard;
