import { useState, useEffect } from 'react';
import { requestsAPI, ratingsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar'; 
import { Plus, Clock, CheckCircle, X } from 'lucide-react';

const UserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ city: '', need: '' });
  const [ratingData, setRatingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await requestsAPI.getMy();
      setRequests(response.data?.requests || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load requests');
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await requestsAPI.create(newRequest);
      setNewRequest({ city: '', need: '' });
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create request');
    }
  };

  const handleRatingChange = (requestId, field, value) => {
    setRatingData((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value,
      },
    }));
  };

  const handleSubmitRating = async (requestId) => {
    const rating = ratingData[requestId];
    if (!rating?.rating || !rating?.feedback) {
      alert('Please provide both rating and feedback');
      return;
    }

    try {
      await ratingsAPI.create({
        request_id: requestId,
        rating: Number(rating.rating),
        feedback: rating.feedback,
      });
      alert('Rating submitted successfully!');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit rating');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
      {/* Navbar */}
      <Navbar />

      <div className="flex pt-16"> {/* <-- Add padding-top equal to Navbar height */}
        {/* Sidebar */}
        <SideBar />

        {/* Main Content */}
        <div className="flex-1 px-6 py-8">
          {/* HEADER */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Requests</h2>
              <p className="text-gray-600 mt-1">Create and manage your help requests</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>New Request</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* REQUEST LIST */}
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No requests yet. Create your first request!</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.request_id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold">{req.city}</h3>
                      <p className="text-gray-600">{req.need}</p>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  {req.status === 'completed' && (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Rate this helper</h4>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Rating"
                        value={ratingData[req.request_id]?.rating || ''}
                        onChange={(e) =>
                          handleRatingChange(req.request_id, 'rating', e.target.value)
                        }
                        className="w-full mb-2 px-3 py-2 border rounded-lg"
                      />
                      <textarea
                        placeholder="Feedback"
                        value={ratingData[req.request_id]?.feedback || ''}
                        onChange={(e) =>
                          handleRatingChange(req.request_id, 'feedback', e.target.value)
                        }
                        rows="2"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <button
                        onClick={() => handleSubmitRating(req.request_id)}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg"
                      >
                        Submit Rating
                      </button>
                    </div>
                  )}

                  {req.status === 'rated' && (
                    <div className="mt-3 flex items-center text-green-600">
                      <CheckCircle size={18} className="mr-2" />
                      <span className="text-sm font-medium">Rated</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CREATE REQUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">Create New Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <input
                type="text"
                placeholder="City"
                value={newRequest.city}
                onChange={(e) => setNewRequest({ ...newRequest, city: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Describe your need"
                value={newRequest.need}
                onChange={(e) => setNewRequest({ ...newRequest, need: e.target.value })}
                required
                rows="3"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
