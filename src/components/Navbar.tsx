import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from './ui/button'
import { Moon, Sun, Menu, X, LogOut } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('brand')
    setMobileMenuOpen(false)
    navigate('/auth/signin')
  }

  return (
    <nav
      className="navbar navbar-expand-lg border-bottom sticky-top"
      style={{
        zIndex: 50,
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))'
      }}
    >
      <div className="container">
        <Link
          to="/"
          className="navbar-brand fw-bold"
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          <img src="../../public/vaa-01.png" alt="VAA Logo" style={{ width: '75px', height: '75px' }} />
        </Link>

        {/* Desktop Navigation */}
        <div className="d-none d-md-flex align-items-center gap-3">
          <Link
            to="/shop"
            className="text-decoration-none"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Shop
          </Link>

          <Link
            to="/auth/brand-signup"
            className="text-decoration-none"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Sell
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon style={{ width: '20px', height: '20px' }} />
            ) : (
              <Sun style={{ width: '20px', height: '20px' }} />
            )}
          </Button>

          <div className="d-flex gap-2">
            {user ? (
              <>
                {user.role === 'CUSTOMER' && (
                  <Link to="/shop">
                    <Button variant="ghost">
                      Shop
                    </Button>
                  </Link>
                )}

                {user.role === 'BRAND' && (
                  <Link to="/brand/dashboard">
                    <Button variant="ghost">
                      Dashboard
                    </Button>
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard">
                    <Button variant="ghost">
                      Dashboard
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                >
                  <LogOut
                    style={{
                      width: '18px',
                      height: '18px',
                      marginRight: '6px'
                    }}
                  />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/signin">
                  <Button variant="ghost"
                    className='text-decoration-none'
                    style={{
                      background:
                        'linear-gradient(to right, #db8727, #ef6f0f)',
                      border: 'none',
                      color: 'white'
                    }}>
                    Sign In
                  </Button>
                </Link>

                <Link to="/auth/signup" className='text-decoration-none'>
                  <Button
                    style={{
                      background:
                        'linear-gradient(to right, #db8727, #ef6f0f)',
                      border: 'none',
                      color: 'white'
                    }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="d-md-none d-flex align-items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon style={{ width: '20px', height: '20px' }} />
            ) : (
              <Sun style={{ width: '20px', height: '20px' }} />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X style={{ width: '24px', height: '24px' }} />
            ) : (
              <Menu style={{ width: '24px', height: '24px' }} />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="d-md-none border-top px-4 py-4"
          style={{
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))'
          }}
        >
          <Link
            to="/shop"
            className="d-block text-decoration-none mb-3"
            style={{ color: 'hsl(var(--foreground))' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Shop
          </Link>

          <Link
            to="/auth/brand-signup"
            className="d-block text-decoration-none mb-3"
            style={{ color: 'hsl(var(--foreground))' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Sell
          </Link>

          <div className="d-flex flex-column gap-2 pt-2">
            {user ? (
              <>
                {user.role === 'CUSTOMER' && (
                  <Link
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-100">
                      Shop
                    </Button>
                  </Link>
                )}

                {user.role === 'BRAND' && (
                  <Link
                    to="/brand/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-100">
                      Dashboard
                    </Button>
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-100">
                      Dashboard
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  className="w-100"
                  onClick={handleSignOut}
                >
                  <LogOut
                    style={{
                      width: '18px',
                      height: '18px',
                      marginRight: '6px'
                    }}
                  />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/signin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-100 text-decoration-none"
                    style={{
                      background:
                        'linear-gradient(to right, #db8727, #ef6f0f)',
                      border: 'none',
                      color: 'white'
                    }}>
                    Sign In
                  </Button>
                </Link>

                <Link
                  to="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    className="w-100 text-decoration-none"
                    style={{
                      background:
                        'linear-gradient(to right, #db8727, #ef6f0f)',
                      border: 'none',
                      color: 'white'
                    }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

