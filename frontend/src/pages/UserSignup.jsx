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

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // ── Validators ──────────────────────────────────────────
  const validators = {
    name: (v) => {
      if (!v.trim()) return 'Name is required.';
      if (/\d/.test(v)) return 'Name must not contain numbers.';
      if (!/^[a-zA-Z\s'-]+$/.test(v)) return 'Name can only contain letters, spaces, hyphens or apostrophes.';
      return '';
    },
    email: (v) => {
      if (!v.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address (e.g. you@gmail.com).';
      return '';
    },
    password: (v) => {
      if (!v) return 'Password is required.';
      if (v.length < 6) return 'Password must be at least 6 characters.';
      return '';
    },
    age: (v) => {
      if (!v) return 'Age is required.';
      if (!/^\d+$/.test(v)) return 'Age must be a number.';
      if (Number(v) < 1 || Number(v) > 120) return 'Please enter a valid age.';
      return '';
    },
    city: (v) => {
      if (!v.trim()) return 'City is required.';
      if (/\d/.test(v)) return 'City name must not contain numbers.';
      return '';
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Block numbers from name and city fields
    if ((name === 'name' || name === 'city') && /\d/.test(value)) return;

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: validators[name]?.(value) || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Run all validators
    const newErrors = {};
    Object.keys(validators).forEach((field) => {
      newErrors[field] = validators[field](formData[field]);
    });
    setErrors(newErrors);
    if (Object.values(newErrors).some((e) => e)) return;

    setLoading(true);
    try {
      const payload = { ...formData, age: Number(formData.age) };
      await signup(payload, false);
      navigate('/login', { state: { signupSuccess: true, email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white/70 focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-400 focus:ring-red-400'
        : 'border-gray-300 focus:ring-emerald-500'
    }`;

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
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 text-center">Create account</h2>
          <p className="text-gray-600 mb-6 text-center">Sign up as a user</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className={inputClass('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email (e.g. you@gmail.com)"
                className={inputClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min. 6 characters)"
                className={inputClass('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* AGE + CITY */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                  className={inputClass('age')}
                />
                {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={inputClass('city')}
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:opacity-90 disabled:opacity-60"
            >
              <UserPlus size={18} />
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600 text-center">
            <p>Already have an account?</p>
            <Link to="/login" className="text-emerald-700 hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
