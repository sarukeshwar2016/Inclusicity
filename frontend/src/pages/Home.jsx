import { Link } from 'react-router-dom'
import { ArrowRight, HeartHandshake, ShieldCheck, Users, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 20}s`
          }} />
        ))}
      </div>

      <Navbar />
      
      <div style={{ paddingTop: '120px', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          {/* Hero */}
          <div style={{ marginBottom: '6rem' }}>
            <div style={{ marginBottom: '2rem', display: 'inline-flex', gap: '1rem' }}>
              <Sparkles size={48} color="#ec4899" style={{ animation: 'float 6s ease-in-out infinite' }} />
              <Sparkles size={36} color="#7c3aed" style={{ animation: 'float 8s ease-in-out infinite reverse' }} />
              <Sparkles size={48} color="#3b82f6" style={{ animation: 'float 7s ease-in-out infinite' }} />
            </div>
            
            <h1 className="glow-text" style={{ lineHeight: '1.1', margin: '2rem 0' }}>
              Help is<br />One Tap Away
            </h1>
            
            <p style={{
              fontSize: '1.5rem',
              maxWidth: '800px',
              margin: '0 auto 4rem',
              color: '#475569',
              fontWeight: '500'
            }}>
              We connect elderly citizens and people with disabilities to verified, compassionate helpers — instantly and safely.
            </p>
          </div>

          {/* 3D Feature Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            margin: '6rem 0'
          }}>
            <div className="card-3d" style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '100px', height: '100px', 
                background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', 
                borderRadius: '50%', margin: '0 auto 2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Users size={50} color="white" />
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '700' }}>Need Help?</h3>
              <p style={{ color: '#64748b' }}>Get matched with a caring helper in your city within minutes</p>
            </div>

            <div className="card-3d" style={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              transform: 'translateY(-30px) scale(1.05)'
            }}>
              <div style={{ 
                width: '120px', height: '120px', 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', margin: '0 auto 2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <HeartHandshake size={60} color="white" />
              </div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '800' }}>Want to Help?</h3>
              <p>Join our network of verified volunteers and change lives</p>
            </div>

            <div className="card-3d" style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '100px', height: '100px', 
                background: 'linear-gradient(135deg, #86efac, #22d3ee)', 
                borderRadius: '50%', margin: '0 auto 2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShieldCheck size={50} color="white" />
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '700' }}>100% Safe</h3>
              <p style={{ color: '#64748b' }}>Every helper is NGO-trained, background-checked & verified</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup/user" className="btn btn-primary" style={{ fontSize: '1.3rem', padding: '1.5rem 3rem' }}>
              I Need Help <ArrowRight style={{ marginLeft: '0.5rem' }} />
            </Link>
            <Link to="/signup/helper" className="btn" style={{ 
              fontSize: '1.3rem', padding: '1.5rem 3rem',
              background: 'var(--gradient-2)', color: 'white'
            }}>
              Become a Helper <HeartHandshake style={{ marginLeft: '0.5rem' }} />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}