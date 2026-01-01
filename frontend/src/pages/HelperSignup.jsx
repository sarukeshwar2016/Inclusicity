import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';

const HelperSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    skills: '',
    age: '18',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // We use FormData because the backend is configured to parse multpart/form-data
      // for this route, even if we aren't sending files yet.
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('city', formData.city);
      payload.append('age', formData.age);
      payload.append('phone', formData.phone);
      payload.append('skills', formData.skills);

      // Call signup with the 'true' flag for helper signup
      await signup(payload, true);

      alert('Account created! Please login and complete your profile for verification.');
      navigate('/login');

    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 flex items-center justify-center px-4">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white/70 backdrop-blur-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT PANEL */}
        <div className="flex flex-col justify-center px-10 py-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-emerald-700">Inclusi</span>
            <span className="text-slate-700">City</span>
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            Join our community of helpers and make the city more accessible for everyone.
          </p>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 
              Quick registration with basic details
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 
              Upload documents in your dashboard later
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 
              Get verified and start helping
            </li>
          </ul>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="px-6 sm:px-10 py-12 bg-white/60">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Helper Sign Up
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1 234..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="helper@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">City</label>
                <input
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Age</label>
                <input
                  name="age"
                  type="number"
                  min="18"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Your Skills</label>
              <textarea
                name="skills"
                rows="2"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Sign Language, Mobility Support, Guiding"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Separate skills with commas.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-lg hover:shadow-emerald-200/50 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <Heart size={18} fill="currentColor" />
              {loading ? 'Processing...' : 'Create Helper Account'}
            </button>
          </form>

          <div className="mt-8 text-sm text-center text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-700 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperSignup;