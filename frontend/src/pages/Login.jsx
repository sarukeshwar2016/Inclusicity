import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

const messages = [
  'Designed for accessibility and dignity',
  'Built to support inclusive communities',
  'Simple tools for everyday independence',
  'Technology that puts people first',
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const role = await login(email, password);
      if (role === 'user') navigate('/user/dashboard');
      else if (role === 'helper') navigate('/helper/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 flex items-center justify-center px-4">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white/70 backdrop-blur-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Vertical Divider */}
        <div className="hidden md:block absolute inset-y-0 left-1/2 w-[2px] bg-gradient-to-b from-transparent via-slate-400 to-transparent shadow-md" />

        {/* Left Panel */}
        <div className="flex flex-col justify-center px-10 py-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="text-emerald-700">Inclusi</span>
            <span className="text-slate-700">City</span>
          </h1>

          <p className="text-gray-700 text-lg mb-6 max-w-md">
            An inclusive digital space focused on accessibility, dignity, and everyday usability.
          </p>

          <div className="h-6 overflow-hidden">
            <p key={index} className="text-sm text-gray-600 animate-fade">
              {messages[index]}
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="px-6 sm:px-10 py-12 bg-white/60">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 text-center">Sign in</h2>
          <p className="text-gray-600 mb-6 text-center">Continue to your account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            >
              <LogIn size={18} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600 text-center">
            <p>Don’t have an account?</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/signup" className="text-emerald-700 hover:underline">User</Link>
              <Link to="/signup/helper" className="text-slate-700 hover:underline">Helper</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade {
          0% { opacity: 0; transform: translateY(6px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-6px); }
        }
        .animate-fade {
          animation: fade 2.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
