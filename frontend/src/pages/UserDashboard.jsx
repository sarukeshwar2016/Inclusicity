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

  // =========================================================
  // FETCH REQUESTS
  // =========================================================
  const fetchRequests = async () => {
    try {
      const res = await requestsAPI.getMy();
      setRequests(res.data?.requests || []);
    } catch {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CREATE REQUEST
  // =========================================================
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
  const handleCancelRequest = async (requestId) => {
  try {
    await requestsAPI.cancelByUser(requestId);
    await fetchRequests();
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to cancel request');
  }
};


  // =========================================================
  // RATING HANDLERS
  // =========================================================
  const handleRatingChange = (requestId, field, value) => {
    setRatingData(prev => ({
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

    // 🔥 Optimistic UI update
    setRequests(prev =>
      prev.map(r =>
        r.request_id === requestId
          ? { ...r, is_rated: true }
          : r
      )
    );

    alert('Rating submitted successfully!');
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to submit rating');
  }
};


  // =========================================================
  // STATUS BADGE
  // =========================================================
  const getStatusBadge = (status) => {
    const styles = {
   pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================
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

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex pt-16">
        <SideBar />

        <div className="flex-1 px-6 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">My Requests</h2>
              <p className="text-gray-600 mt-1">Create and manage your help requests</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              <Plus size={20} />
              New Request
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white p-12 rounded-xl text-center">
                <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No requests yet</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.request_id} className="bg-white rounded-xl shadow p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold">{req.city}</h3>
                      <p className="text-gray-600">{req.need}</p>

                      {req.helper_name && (
                        <p className="text-sm text-gray-500 mt-1">
                          Helper: <b>{req.helper_name}</b>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
  {getStatusBadge(req.status)}

  {(req.status === 'pending' || req.status === 'accepted') && (
    <button
      onClick={() => handleCancelRequest(req.request_id || req._id)}
      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
    >
      <X size={14} />
      Cancel
    </button>
  )}
</div>

                  </div>

                  {/* ⭐ RATE HELPER */}
                  {req.status === 'completed' && !req.is_rated && (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Rate {req.helper_name || 'this helper'}
                      </h4>

                      <input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Rating (1–5)"
                        className="w-full mb-2 px-3 py-2 border rounded-lg"
                        value={ratingData[req.request_id]?.rating || ''}
                        onChange={(e) =>
                          handleRatingChange(req.request_id, 'rating', e.target.value)
                        }
                      />

                      <textarea
                        placeholder="Feedback"
                        rows="2"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={ratingData[req.request_id]?.feedback || ''}
                        onChange={(e) =>
                          handleRatingChange(req.request_id, 'feedback', e.target.value)
                        }
                      />

                      <button
                        onClick={() => handleSubmitRating(req.request_id)}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg"
                      >
                        Submit Rating
                      </button>
                    </div>
                  )}

                  {/* 🔒 RATED */}
                  {req.is_rated && (
                    <div className="mt-3 flex items-center text-green-600">
                      <CheckCircle size={18} className="mr-2" />
                      <span className="text-sm font-medium">
                        Rating submitted
                      </span>
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
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>

      <h3 className="text-xl font-semibold mb-4">Create New Request</h3>

      <form onSubmit={handleCreateRequest} className="space-y-4">

        {/* CITY */}
        <input
          type="text"
          placeholder="City"
          className="w-full px-4 py-2 border rounded-lg"
          value={newRequest.city}
          onChange={(e) =>
            setNewRequest({ ...newRequest, city: e.target.value })
          }
          required
        />

        {/* PICKUP ADDRESS */}
        <input
          type="text"
          placeholder="Pickup Address"
          className="w-full px-4 py-2 border rounded-lg"
          value={newRequest.pickup_address}
          onChange={(e) =>
            setNewRequest({
              ...newRequest,
              pickup_address: e.target.value,
            })
          }
          required
        />

        {/* DESTINATION ADDRESS */}
        <input
          type="text"
          placeholder="Destination Address"
          className="w-full px-4 py-2 border rounded-lg"
          value={newRequest.destination_address}
          onChange={(e) =>
            setNewRequest({
              ...newRequest,
              destination_address: e.target.value,
            })
          }
          required
        />

        {/* PHONE */}
        <input
          type="tel"
          placeholder="Phone Number"
          className="w-full px-4 py-2 border rounded-lg"
          value={newRequest.phone}
          onChange={(e) =>
            setNewRequest({ ...newRequest, phone: e.target.value })
          }
          required
        />

        {/* NEED */}
        <textarea
          placeholder="Reason / Need (e.g. Hospital visit)"
          rows="3"
          className="w-full px-4 py-2 border rounded-lg"
          value={newRequest.need}
          onChange={(e) =>
            setNewRequest({ ...newRequest, need: e.target.value })
          }
          required
        />

        {/* DATE & TIME */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg"
            value={newRequest.needed_date}
            onChange={(e) =>
              setNewRequest({
                ...newRequest,
                needed_date: e.target.value,
              })
            }
            required
          />

          <input
            type="time"
            className="w-full px-4 py-2 border rounded-lg"
            value={newRequest.needed_time}
            onChange={(e) =>
              setNewRequest({
                ...newRequest,
                needed_time: e.target.value,
              })
            }
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
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
