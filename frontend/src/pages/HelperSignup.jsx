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
      await signup(formData, true);
      navigate('/helper/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 flex items-center justify-center px-4">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white/70 backdrop-blur-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Divider */}
        <div className="hidden md:block absolute inset-y-0 left-1/2 w-[2px] bg-gradient-to-b from-transparent via-slate-400 to-transparent shadow-md" />

        {/* Left Panel */}
        <div className="flex flex-col justify-center px-10 py-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="text-emerald-700">Inclusi</span>
            <span className="text-slate-700">City</span>
          </h1>

          <p className="text-gray-700 text-lg mb-6 max-w-md">
            Become a helper and support inclusive, dignity-first communities.
          </p>

          <ul className="space-y-3 text-sm text-gray-600">
            <li>• Assist people with everyday accessibility needs</li>
            <li>• Share skills that make cities more inclusive</li>
            <li>• Be part of a trusted local support network</li>
          </ul>
        </div>

        {/* Right Panel */}
        <div className="px-6 sm:px-10 py-12 bg-white/60">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              Helper Sign Up
            </h2>
            <p className="text-gray-600">Create your helper account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Name', name: 'name', type: 'text', placeholder: 'Your name' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'City', name: 'city', type: 'text', placeholder: 'Your city' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  {...field}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <textarea
                name="skills"
                rows="3"
                value={formData.skills}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="How can you help?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
            >
              <Heart size={18} />
              {loading ? 'Creating account…' : 'Sign Up as Helper'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-700 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperSignup;
