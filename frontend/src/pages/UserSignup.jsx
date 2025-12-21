import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

const UserSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    city: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // =========================================================
  // SUBMIT SIGNUP (OPTION A)
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        age: Number(formData.age), // backend expects number
      };

      // 🔹 Signup only (NO auto-login)
      await signup(payload, false);

      // 🔹 Redirect to login page
      navigate('/login', {
        state: {
          signupSuccess: true,
          email: formData.email,
        },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 flex items-center justify-center px-4">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white/70 backdrop-blur-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Panel */}
        <div className="flex flex-col justify-center px-10 py-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="text-emerald-700">Inclusi</span>
            <span className="text-slate-700">City</span>
          </h1>

          <p className="text-gray-700 text-lg max-w-md">
            Join an inclusive digital city built around accessibility, dignity, and everyday usability.
          </p>
        </div>

        {/* Right Panel */}
        <div className="px-6 sm:px-10 py-12 bg-white/60">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 text-center">
            Create account
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Sign up as a user
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Name"
              className="w-full px-4 py-3 rounded-xl border"
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl border"
            />

            {/* PASSWORD */}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border"
            />

            {/* AGE + CITY */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                placeholder="Age"
                className="w-full px-4 py-3 rounded-xl border"
              />

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="City"
                className="w-full px-4 py-3 rounded-xl border"
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white disabled:opacity-60"
            >
              <UserPlus size={18} />
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600 text-center">
            <p>Already have an account?</p>
            <Link to="/login" className="text-emerald-700 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
