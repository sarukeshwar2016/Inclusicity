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

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // ── Validators ──────────────────────────────────────────
  const validators = {
    name: (v) => {
      if (!v.trim()) return 'Full Name is required.';
      if (/\d/.test(v)) return 'Name must not contain numbers.';
      if (!/^[a-zA-Z\s'-]+$/.test(v)) return 'Name can only contain letters, spaces, hyphens or apostrophes.';
      return '';
    },
    phone: (v) => {
      if (!v.trim()) return 'Phone number is required.';
      if (!/^\+?[\d\s\-()]{7,15}$/.test(v)) return 'Please enter a valid phone number.';
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
    city: (v) => {
      if (!v.trim()) return 'City is required.';
      if (/\d/.test(v)) return 'City name must not contain numbers.';
      return '';
    },
    age: (v) => {
      if (!v) return 'Age is required.';
      if (!/^\d+$/.test(v)) return 'Age must be a number.';
      if (Number(v) < 18) return 'Helper must be at least 18 years old.';
      if (Number(v) > 100) return 'Please enter a valid age.';
      return '';
    },
    skills: (v) => {
      if (!v.trim()) return 'Please list at least one skill.';
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
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('city', formData.city);
      payload.append('age', formData.age);
      payload.append('phone', formData.phone);
      payload.append('skills', formData.skills);

      await signup(payload, true);
      alert('Account created! Please login and complete your profile for verification.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border outline-none transition-all bg-white focus:ring-2 ${
      errors[field]
        ? 'border-red-400 focus:ring-red-400'
        : 'border-gray-200 focus:ring-emerald-500'
    }`;

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

        {/* RIGHT PANEL */}
        <div className="px-6 sm:px-10 py-12 bg-white/60">
          <h2 className="text-2xl font-semibold text-center mb-6">Helper Sign Up</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME + PHONE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={inputClass('name')}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className={inputClass('phone')}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Email Address</label>
              <input
                name="email"
                type="text"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
                className={inputClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className={inputClass('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* CITY + AGE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">City</label>
                <input
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Chennai"
                  className={inputClass('city')}
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Age (min. 18)</label>
                <input
                  name="age"
                  type="text"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="18"
                  className={inputClass('age')}
                />
                {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
              </div>
            </div>

            {/* SKILLS */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Your Skills</label>
              <textarea
                name="skills"
                rows="2"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Sign Language, Mobility Support, Guiding"
                className={`${inputClass('skills')} resize-none`}
              />
              {errors.skills
                ? <p className="mt-1 text-xs text-red-600">{errors.skills}</p>
                : <p className="text-[10px] text-gray-400 mt-1 ml-1">Separate skills with commas.</p>
              }
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
            <Link to="/login" className="text-teal-700 font-semibold hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperSignup;