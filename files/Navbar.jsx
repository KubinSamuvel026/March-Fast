import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { useWishlist } from './WishlistContext.jsx'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const { count: cartCount, clearCart } = useCart()
  const { items: wishlistItems, clearWishlist } = useWishlist()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Keep login state synced on navigation (handles post-login redirect)
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [location.pathname])

  // Track login status (token stored in localStorage)
  useEffect(() => {
    const checkToken = () => setIsLoggedIn(!!localStorage.getItem('token'))
    checkToken()

    const handleStorage = () => checkToken()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    clearCart()
    clearWishlist()
    setIsLoggedIn(false)
    navigate('/')
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">M</span>
          <span className="navbar__logo-text">
            March<strong>Fast</strong>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar__links" style={{ display: isMobile ? 'none' : 'flex' }}>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
              Products
            </NavLink>
          </li>
        </ul>

        {/* Action Icons */}
        <div className="navbar__actions">
          {/* Wishlist - hide on mobile */}
          {!isMobile && (
            <Link to="/wishlist" className="navbar__icon-btn" aria-label="Wishlist">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistItems.length > 0 && (
                <span className="navbar__badge">{wishlistItems.length}</span>
              )}
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="navbar__icon-btn" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span className="navbar__badge">{cartCount}</span>
            )}
          </Link>

          {/* Vendor Dashboard Button - hide on mobile */}
          {!isMobile && (
            <a
              href="https://march-fast-git-main-kubinsamuel00326-7526s-projects.vercel.app/"
              className="navbar__vendor-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Vendor
            </a>
          )}

          {/* Login / Logout - hide on mobile */}
          {!isMobile && (
            <>
              {isLoggedIn ? (
                <button
                  className="navbar__logout-btn"
                  onClick={handleLogout}
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #FF8C61)',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginLeft: '12px',
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="navbar__link">
                    Login
                  </Link>
                  <Link to="/register" className="navbar__link navbar__link--primary">
                    Register
                  </Link>
                </>
              )}
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/wishlist">
            Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
          </NavLink>
          <NavLink to="/cart">
            Cart {cartCount > 0 && `(${cartCount})`}
          </NavLink>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #FF6B35, #FF8C61)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                marginTop: '12px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
          <a href="https://march-fast.vercel.app" target="_blank" rel="noopener noreferrer">
            Vendor Dashboard ↗
          </a>
        </div>
      )}
    </nav>
  )
}
