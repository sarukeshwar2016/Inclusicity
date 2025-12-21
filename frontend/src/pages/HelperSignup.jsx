import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Upload } from 'lucide-react';

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

  const [idProof, setIdProof] = useState(null);
  const [ngoCertificate, setNgoCertificate] = useState(null);

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

    if (!idProof || !ngoCertificate) {
      setError('ID proof and NGO certificate are required');
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();

      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('city', formData.city);
      payload.append('age', formData.age); // 🔥 keep as string
      payload.append('phone', formData.phone);

      // 🔥 comma-separated string (backend splits it)
      payload.append('skills', formData.skills);

      // 🔥 hard-coded NGO id (matches backend)
      payload.append('ngo_id', 'ngo_12345');

      // files
      payload.append('id_proof', idProof);
      payload.append('ngo_certificate', ngoCertificate);

      await signup(payload, true);

      alert('Application submitted. Await admin verification.');
      navigate('/login');

    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 flex items-center justify-center px-4">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white/70 backdrop-blur-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT */}
        <div className="flex flex-col justify-center px-10 py-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-emerald-700">Inclusi</span>
            <span className="text-slate-700">City</span>
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            Apply as a helper and support people with accessibility needs.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Verified helpers only</li>
            <li>• Admin approval required</li>
            <li>• Safe & trusted platform</li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="px-6 sm:px-10 py-12 bg-white/60">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Helper Sign Up
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {[
              { label: 'Name', name: 'name', type: 'text' },
              { label: 'Email', name: 'email', type: 'email' },
              { label: 'Password', name: 'password', type: 'password' },
              { label: 'City', name: 'city', type: 'text' },
              { label: 'Phone', name: 'phone', type: 'tel' },
              { label: 'Age', name: 'age', type: 'number' },
            ].map(field => (
              <div key={field.name}>
                <label className="text-sm font-medium">{field.label}</label>
                <input
                  {...field}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border bg-white"
                />
              </div>
            ))}

            {/* SKILLS */}
            <div>
              <label className="text-sm font-medium">Skills</label>
              <textarea
                name="skills"
                rows="3"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Comma separated skills"
                required
                className="w-full px-4 py-3 rounded-xl border bg-white"
              />
            </div>

            {/* FILE UPLOADS */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Upload size={16} /> ID Proof
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setIdProof(e.target.files[0])}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Upload size={16} /> NGO Certificate
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setNgoCertificate(e.target.files[0])}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium"
            >
              <Heart size={18} className="inline mr-2" />
              {loading ? 'Submitting…' : 'Apply as Helper'}
            </button>
          </form>

          <div className="mt-6 text-sm text-center">
            Already approved?{' '}
            <Link to="/login" className="text-teal-700 underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperSignup;
