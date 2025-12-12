import { Link } from 'react-router-dom'
import { UserPlus, HandHelping } from 'lucide-react'

export default function Navbar() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '1.2rem 0',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          style={{ 
            fontSize: '2.4rem', 
            fontWeight: '900', 
            fontFamily: "'Playfair Display', serif",
            background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px',
            textDecoration: 'none',           /* No underline */
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            background: '#ec4899',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></span>
          Inclusicity
        </Link>

        {/* Buttons — 100% clean, no underline ever */}
        <div style={{ display: 'flex', gap: '1.2rem' }}>
          <Link 
            to="/signup/user" 
            className="btn btn-primary"
            style={{ 
              padding: '0.9rem 2rem',
              fontSize: '1.05rem',
              fontWeight: '600',
              textDecoration: 'none',           /* No underline */
              outline: 'none'                   /* Removes focus ring underline too */
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            <UserPlus size={22} style={{ marginRight: '8px' }} />
            Need Help
          </Link>
          
          <Link 
            to="/signup/helper" 
            className="btn"
            style={{
              padding: '0.9rem 2rem',
              fontSize: '1.05rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              color: 'white',
              textDecoration: 'none',           /* No underline */
              outline: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            <HandHelping size={22} style={{ marginRight: '8px' }} />
            Become a Helper
          </Link>
        </div>
      </div>
    </nav>
  )
}