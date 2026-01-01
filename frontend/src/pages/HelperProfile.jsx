import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { helperAPI } from '../services/api';
import HelperNavbar from '../components/HelperNavbar';
import HelperSidebar from '../components/HelperSidebar';

const HelperProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    phone_number: '',
    city: '',
    short_bio: '',
    languages_spoken: '',
    types_of_help_offered: '',
  });

  const [files, setFiles] = useState({
    aadhaar: null,
    driving_license: null,
    address_proof: null,
    ngo_certificate: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  // =========================================================
  // UPDATE PROFILE
  // =========================================================
  const handleSave = async () => {
    setError('');
    setLoading(true);

    try {
      const data = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (v) data.append(k, v);
      });

      Object.entries(files).forEach(([k, v]) => {
        if (v) data.append(k, v);
      });

      await helperAPI.updateProfile(data);
      alert('Profile saved successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUBMIT FOR VERIFICATION
  // =========================================================
  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await helperAPI.submitVerification();
      alert('Profile submitted for verification');
      navigate('/helper/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <HelperSidebar />
      <div className="flex-1 ml-0 md:ml-20 lg:ml-60">
        <HelperNavbar />

        <div className="max-w-3xl mx-auto px-4 py-24">
          <h1 className="text-3xl font-bold mb-6">Complete Helper Profile</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* BASIC INFO */}
          <div className="space-y-4 mb-6">
            <input name="full_name" placeholder="Full Name" onChange={handleChange} className="w-full p-3 border rounded" />
            <input name="date_of_birth" type="date" onChange={handleChange} className="w-full p-3 border rounded" />
            <input name="phone_number" placeholder="Phone Number" onChange={handleChange} className="w-full p-3 border rounded" />
            <input name="city" placeholder="City" onChange={handleChange} className="w-full p-3 border rounded" />
            <textarea name="short_bio" placeholder="Short Bio" onChange={handleChange} className="w-full p-3 border rounded" />
          </div>

          {/* FILE UPLOADS */}
          <div className="space-y-4 mb-6">
            <input type="file" name="aadhaar" onChange={handleFileChange} />
            <input type="file" name="driving_license" onChange={handleFileChange} />
            <input type="file" name="address_proof" onChange={handleFileChange} />
            <input type="file" name="ngo_certificate" onChange={handleFileChange} />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 bg-gray-700 text-white rounded"
            >
              Save
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded"
            >
              Submit for Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperProfile;
