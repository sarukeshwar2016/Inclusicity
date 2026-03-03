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
  // Check if any file is selected
  // =========================================================
  const hasAnyFile = Object.values(files).some((f) => f !== null);

  // =========================================================
  // SUBMIT FOR VERIFICATION (auto-saves first)
  // =========================================================
  const handleSubmit = async () => {
    if (!hasAnyFile) {
      setError('Please upload at least one document before submitting.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Step 1: Save profile + files first
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) data.append(k, v);
      });
      Object.entries(files).forEach(([k, v]) => {
        if (v) data.append(k, v);
      });
      await helperAPI.updateProfile(data);

      // Step 2: Submit for verification
      await helperAPI.submitVerification();
      alert('Profile submitted for verification!');
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
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Upload Documents</h2>
          <div className="space-y-4 mb-6 bg-white p-5 rounded-xl border border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Aadhaar Card</label>
              <input type="file" name="aadhaar" onChange={handleFileChange} className="w-full text-sm" />
              {files.aadhaar && <p className="text-xs text-green-600 mt-1">✅ {files.aadhaar.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Driving License</label>
              <input type="file" name="driving_license" onChange={handleFileChange} className="w-full text-sm" />
              {files.driving_license && <p className="text-xs text-green-600 mt-1">✅ {files.driving_license.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Address Proof</label>
              <input type="file" name="address_proof" onChange={handleFileChange} className="w-full text-sm" />
              {files.address_proof && <p className="text-xs text-green-600 mt-1">✅ {files.address_proof.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">NGO Certificate</label>
              <input type="file" name="ngo_certificate" onChange={handleFileChange} className="w-full text-sm" />
              {files.ngo_certificate && <p className="text-xs text-green-600 mt-1">✅ {files.ngo_certificate.name}</p>}
            </div>
          </div>

          {!hasAnyFile && (
            <p className="text-sm text-amber-600 mb-4 font-medium">
              ⚠️ Please upload at least one document to submit for verification.
            </p>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || !hasAnyFile}
              className={`px-6 py-3 text-white rounded transition ${hasAnyFile
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperProfile;
