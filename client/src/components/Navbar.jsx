import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Navbar({ variant = 'app' }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF9C, #7C3AED)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#050510" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">Triggerly</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <button onClick={handleSignOut} className="nav-link">Logout</button>
              </>
            ) : (
              <>
                {variant === 'landing' && (
                  <>
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#how-it-works" className="nav-link">How It Works</a>
                  </>
                )}
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="btn-primary text-sm !px-6 !py-2.5">Get Started</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <div
            className={`hamburger ${mobileOpen ? 'active' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {user ? (
          <>
            <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <button onClick={() => { handleSignOut(); setMobileOpen(false) }} className="text-xl text-gray-300 hover:text-white transition-colors">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Login</Link>
            <Link to="/signup" className="btn-primary text-lg !px-8 !py-3" onClick={() => setMobileOpen(false)}>Get Started</Link>
          </>
        )}
      </div>
    </>
  )
}
