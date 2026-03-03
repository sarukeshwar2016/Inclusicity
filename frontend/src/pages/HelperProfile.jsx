import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { helperAPI } from '../services/api';
import HelperNavbar from '../components/HelperNavbar';
import HelperSidebar from '../components/HelperSidebar';
import { motion } from 'framer-motion';
import {
  User, Calendar, Phone, MapPin, FileText,
  Upload, Shield, CheckCircle, Loader2,
  CreditCard, Car, Home, Award, Briefcase
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const HelperProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const hasAnyFile = Object.values(files).some((f) => f !== null);

  // =========================================================
  // SAVE PROFILE
  // =========================================================
  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
      Object.entries(files).forEach(([k, v]) => { if (v) data.append(k, v); });
      await helperAPI.updateProfile(data);
      setSuccess('Profile saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUBMIT FOR VERIFICATION (auto-saves first)
  // =========================================================
  const handleSubmit = async () => {
    if (!hasAnyFile) {
      setError('Please upload at least one document before submitting.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
      Object.entries(files).forEach(([k, v]) => { if (v) data.append(k, v); });
      await helperAPI.updateProfile(data);
      await helperAPI.submitVerification();
      setSuccess('Profile submitted for verification!');
      setTimeout(() => navigate('/helper/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const fileFields = [
    { key: 'aadhaar', label: 'Aadhaar Card', icon: CreditCard, color: 'indigo' },
    { key: 'driving_license', label: 'Driving License', icon: Car, color: 'blue' },
    { key: 'address_proof', label: 'Address Proof', icon: Home, color: 'emerald' },
    { key: 'ngo_certificate', label: 'NGO Certificate', icon: Award, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-50 relative">
      <HelperSidebar />
      <div className="flex-1 ml-0 md:ml-20 lg:ml-60 transition-all">
        <HelperNavbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200/50 text-indigo-700 text-xs font-bold mb-6 uppercase tracking-widest">
              <Shield size={14} />
              Verification Required
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Complete Your Profile
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Upload your documents and fill in your details to get verified and start helping the community.
            </p>
          </motion.div>

          {/* Alerts */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 font-medium"
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">!</div>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 font-medium"
            >
              <CheckCircle size={20} />
              {success}
            </motion.div>
          )}

          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">

            {/* ==================== BASIC INFO ==================== */}
            <motion.section variants={fadeUp} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <User className="text-indigo-600" size={22} />
                </span>
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <User size={14} className="text-slate-400" /> Full Name
                  </label>
                  <input
                    name="full_name" placeholder="Your full name" onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" /> Date of Birth
                  </label>
                  <input
                    name="date_of_birth" type="date" onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" /> Phone Number
                  </label>
                  <input
                    name="phone_number" placeholder="+91 98765 43210" onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" /> City
                  </label>
                  <input
                    name="city" placeholder="Your city" onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText size={14} className="text-slate-400" /> Short Bio
                </label>
                <textarea
                  name="short_bio" placeholder="Tell us about yourself and why you want to help..."
                  rows="3" onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Languages Spoken</label>
                  <input
                    name="languages_spoken" placeholder="English, Hindi, Tamil" onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 font-medium"
                  />
                  <p className="text-xs text-slate-400 mt-1 ml-1">Separate with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Types of Help Offered</label>
                  <input
                    name="types_of_help_offered" placeholder="Mobility, Navigation, Reading" onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 font-medium"
                  />
                  <p className="text-xs text-slate-400 mt-1 ml-1">Separate with commas</p>
                </div>
              </div>
            </motion.section>

            {/* ==================== DOCUMENT UPLOADS ==================== */}
            <motion.section variants={fadeUp} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                <span className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Upload className="text-emerald-600" size={22} />
                </span>
                Upload Documents
              </h2>
              <p className="text-slate-500 mb-8 text-sm">Upload at least one document to submit for verification.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {fileFields.map(({ key, label, icon: Icon, color }) => (
                  <motion.div
                    key={key}
                    whileHover={{ y: -2 }}
                    className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${files[key]
                        ? `border-${color}-400 bg-${color}-50/50`
                        : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30'
                      }`}
                  >
                    <label className="flex flex-col items-center justify-center p-6 cursor-pointer text-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all ${files[key]
                          ? `bg-${color}-100 text-${color}-600`
                          : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                        }`}>
                        {files[key] ? <CheckCircle size={24} /> : <Icon size={24} />}
                      </div>
                      <span className={`font-semibold text-sm mb-1 ${files[key] ? `text-${color}-700` : 'text-slate-700'}`}>
                        {label}
                      </span>
                      {files[key] ? (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          ✅ {files[key].name.length > 25 ? files[key].name.slice(0, 22) + '...' : files[key].name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Click to upload</span>
                      )}
                      <input
                        type="file" name={key} onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </label>
                  </motion.div>
                ))}
              </div>

              {!hasAnyFile && (
                <div className="mt-6 flex items-center gap-2 text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <Shield size={16} />
                  Upload at least one document to enable verification submission.
                </div>
              )}
            </motion.section>

            {/* ==================== ACTION BUTTONS ==================== */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                {loading ? 'Saving...' : 'Save Profile'}
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || !hasAnyFile}
                className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 ${hasAnyFile
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 text-white hover:-translate-y-0.5'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HelperProfile;
