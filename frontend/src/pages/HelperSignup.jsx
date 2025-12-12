import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, Award, Briefcase, HeartHandshake } from 'lucide-react'

const API_URL = 'http://localhost:5000'

export default function HelperSignup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', age: '', city: '', phone: '',
    ngo_id: '', skills: '', training_certificate_url: '', experience: '', gender: ''
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    if (skills.length === 0) {
      toast.error("Please enter at least one skill")
      return
    }

    try {
      const payload = { ...formData, skills }
      await axios.post(`${API_URL}/auth/signup/helper`, payload)
      toast.success("Application submitted! Awaiting NGO verification")
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed")
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '2rem' }}>
      <div className="container">
        <Link to="/" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--primary)', 
          marginBottom: '2rem',
          fontWeight: '600'
        }}>
          <ArrowLeft /> Back to Home
        </Link>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem',
              boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
            }}>
              <HeartHandshake color="white" size={56} />
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '800', background: 'linear-gradient(135deg, #7209b7, #4361ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Become a Verified Helper
            </h1>
            <p style={{ color: 'var(--gray-600)', marginTop: '1rem', fontSize: '1.2rem' }}>
              You must be trained and registered through a partner NGO
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <User />
                <input required name="name" type="text" placeholder="Full Name" onChange={handleChange} />
              </div>
              <div className="input-group">
                <Mail />
                <input required name="email" type="email" placeholder="Email Address" onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <Lock />
              <input required name="password" type="password" placeholder="Create Strong Password" onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <input required name="age" type="number" placeholder="Age (min 18)" min="18" onChange={handleChange} style={{ paddingLeft: '1rem' }} />
              <div className="input-group">
                <MapPin />
                <input required name="city" type="text" placeholder="City" onChange={handleChange} />
              </div>
              <div className="input-group">
                <Phone />
                <input required name="phone" type="text" placeholder="Phone Number" onChange={handleChange} />
              </div>
            </div>

            <div className="input-group" style={{ background: '#fff8c5', border: '2px solid #ffd60a' }}>
              <Award />
              <input required name="ngo_id" type="text" placeholder="Your NGO ID (provided by your NGO)" onChange={handleChange} />
            </div>

            <textarea
              required
              name="skills"
              placeholder="Your Skills (comma separated) — e.g. First Aid, Sign Language, Wheelchair Assistance, Elderly Care"
              rows="4"
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '1rem 1rem 1rem 3.5rem', 
                borderRadius: '1rem', 
                border: '2px solid var(--gray-200)', 
                marginTop: '1rem',
                fontSize: '1rem',
                background: 'var(--gray-50)'
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div className="input-group">
                <Briefcase />
                <input name="experience" type="text" placeholder="Years of Experience (optional)" onChange={handleChange} />
              </div>
              <div className="input-group">
                <Award />
                <input name="training_certificate_url" type="url" placeholder="Training Certificate URL (optional)" onChange={handleChange} />
              </div>
            </div>

            <select name="gender" onChange={handleChange} style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3.5rem',
              borderRadius: '1rem',
              border: '2px solid var(--gray-200)',
              background: 'var(--gray-50)',
              marginTop: '1rem',
              fontSize: '1rem'
            }}>
              <option value="">Prefer not to say</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <button type="submit" className="btn btn-secondary" style={{
              width: '100%',
              marginTop: '2.5rem',
              padding: '1.5rem',
              fontSize: '1.3rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #7209b7, #4361ee)'
            }}>
              Submit Helper Application
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--gray-600)' }}>
            Need assistance instead? <Link to="/signup/user" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register as User</Link>
          </p>
        </div>
      </div>
    </div>
  )
}