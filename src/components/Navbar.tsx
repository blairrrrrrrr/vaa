import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from './ui/button'
import { Moon, Sun, Menu, X, LogOut } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
 

  const handleSignOut = async () => {
    await signOut()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('brand')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top" style={{ zIndex: 50 }}>
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold" style={{ background: 'linear-gradient(to right, #db2777, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          FashionHub
        </Link>
        
        {/* Desktop Navigation */}
        <div className="d-none d-md-flex align-items-center gap-3">
          <Link to="/shop" className="text-secondary text-decoration-none">Shop</Link>
          <Link to="/auth/brand-signup" className="text-secondary text-decoration-none">Sell</Link>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <Moon style={{ width: '20px', height: '20px' }} /> : <Sun style={{ width: '20px', height: '20px' }} />}
          </Button>
          <div className="d-flex gap-2">
            <Link to="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth/signup">
              <Button style={{ background: 'linear-gradient(to right, #db2777, #9333ea)', border: 'none', color: 'white' }}>
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="d-md-none d-flex align-items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <Moon style={{ width: '20px', height: '20px' }} /> : <Sun style={{ width: '20px', height: '20px' }} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="d-md-none border-top bg-white px-4 py-4">
          <Link to="/shop" className="d-block text-secondary text-decoration-none mb-3" onClick={() => setMobileMenuOpen(false)}>
            Shop
          </Link>
          <Link to="/auth/brand-signup" className="d-block text-secondary text-decoration-none mb-3" onClick={() => setMobileMenuOpen(false)}>
            Sell
          </Link>
          <div className="d-flex flex-column gap-2 pt-2">
            <Link to="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-100">Sign In</Button>
            </Link>
            <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-100" style={{ background: 'linear-gradient(to right, #db2777, #9333ea)', border: 'none', color: 'white' }}>
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
