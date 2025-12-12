import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ArrowLeft, User, Mail, Lock, Phone, MapPin } from 'lucide-react'

const API_URL = 'http://localhost:5000'

export default function UserSignup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', age: '', city: '', phone: '', mobility_needs: ''
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/auth/signup`, formData)
      toast.success("Account created successfully!")
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed")
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '2rem' }}>
      <div className="container">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '2rem' }}>
          <ArrowLeft /> Back to Home
        </Link>

        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ width: '90px', height: '90px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <User color="#3b82f6" size={48} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Create Your Account</h1>
            <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Let us help you when you need it most</p>
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
              <input required name="password" type="password" placeholder="Create Password" onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <input required name="age" type="number" placeholder="Age" onChange={handleChange} style={{ paddingLeft: '1rem' }} />
              <div className="input-group">
                <MapPin />
                <input name="city" type="text" placeholder="City" onChange={handleChange} />
              </div>
              <div className="input-group">
                <Phone />
                <input name="phone" type="text" placeholder="Phone (Optional)" onChange={handleChange} />
              </div>
            </div>

            <textarea name="mobility_needs" placeholder="Describe your mobility needs (optional)" rows="4"
              onChange={handleChange} style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '2px solid var(--gray-200)', marginTop: '1rem' }} />

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1.25rem', fontSize: '1.25rem' }}>
              Create My Account
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--gray-600)' }}>
            Want to help others? <Link to="/signup/helper" style={{ color: 'var(--primary)', fontWeight: '600' }}>Become a Helper →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}