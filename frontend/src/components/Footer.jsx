export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: '4rem 0 2rem',
      marginTop: '6rem'
    }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{
          fontSize: '3rem',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          InclusiCity
        </h2>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem' }}>
          Bridging compassion with action — one helping hand at a time.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          margin: '3rem 0',
          flexWrap: 'wrap',
          fontSize: '1.1rem'
        }}>
          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.3s' }}
             onMouseEnter={(e) => e.target.style.color = '#e2e8f0'}
             onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
            Home
          </a>
          <a href="/signup/user" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.3s' }}
             onMouseEnter={(e) => e.target.style.color = '#e2e8f0'}
             onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
            Need Help
          </a>
          <a href="/signup/helper" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.3s' }}
             onMouseEnter={(e) => e.target.style.color = '#e2e8f0'}
             onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
            Become a Helper
          </a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.3s' }}
             onMouseEnter={(e) => e.target.style.color = '#e2e8f0'}
             onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
            Contact
          </a>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '2rem',
          color: '#64748b',
          fontSize: '0.95rem'
        }}>
          © 2025 CareConnect. Built with love for humanity.
        </div>
      </div>
    </footer>
  )
}