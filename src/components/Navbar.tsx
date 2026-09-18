import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ShoppingCart,
  Sun,
  User,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { itemCount } = useCart()

  const navigate = useNavigate()

  const [dropdownOpen, setDropdownOpen] =
    useState(false)

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const dropdownRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  const handleSignOut = () => {
    signOut()
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    navigate('/')
  }

  const handleMobileNavigation = () => {
    setMobileMenuOpen(false)
    setDropdownOpen(false)
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container">
        {/* Logo */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center"
          onClick={handleMobileNavigation}
        >
          <img
            src="/vaa-01.png"
            alt="VAA"
            style={{
              height: '42px',
              width: 'auto',
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="d-none d-lg-flex align-items-center ms-auto gap-2">
          <Link
            to="/shop"
            className="btn btn-link text-decoration-none text-dark"
          >
            Shop
          </Link>

          {user?.role !== 'BRAND' && (
            <Link
              to="/auth/brand-signup"
              className="btn btn-link text-decoration-none text-dark"
            >
              Sell
            </Link>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            className="btn btn-link text-dark position-relative p-2 d-flex align-items-center justify-content-center"
            aria-label={`Shopping cart with ${itemCount} ${
              itemCount === 1 ? 'item' : 'items'
            }`}
          >
            <ShoppingCart size={21} />

            {itemCount > 0 && (
              <span
                className="position-absolute badge rounded-pill bg-danger"
                style={{
                  top: '0px',
                  right: '-2px',
                  fontSize: '10px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Theme */}
          <button
            type="button"
            className="btn btn-link text-dark p-2"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {/* User Dropdown */}
          {user ? (
            <div
              className="position-relative"
              ref={dropdownRef}
            >
              <button
                type="button"
                className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2"
                onClick={() =>
                  setDropdownOpen(
                    current => !current
                  )
                }
              >
                <User size={19} />

                <span className="fw-medium">
                  {user.name ||
                    user.email.split('@')[0]}
                </span>

                <ChevronDown
                  size={16}
                  style={{
                    transform: dropdownOpen
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                    transition:
                      'transform 0.2s ease',
                  }}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow-lg overflow-hidden"
                  style={{
                    minWidth: '220px',
                    zIndex: 1050,
                  }}
                >
                  <div className="px-3 py-3 border-bottom">
                    <p className="fw-semibold mb-1">
                      {user.name ||
                        user.email.split('@')[0]}
                    </p>

                    <p
                      className="small text-secondary mb-0 text-truncate"
                      style={{
                        maxWidth: '190px',
                      }}
                    >
                      {user.email}
                    </p>
                  </div>

                  {user.role === 'BRAND' ? (
                    <Link
                      to="/brand/dashboard"
                      className="dropdown-item d-flex align-items-center gap-2 py-2"
                      onClick={() =>
                        setDropdownOpen(false)
                      }
                    >
                      <LayoutDashboard size={17} />
                      Brand Dashboard
                    </Link>
                  ) : user.role === 'ADMIN' ? (
                    <Link
                      to="/admin/dashboard"
                      className="dropdown-item d-flex align-items-center gap-2 py-2"
                      onClick={() =>
                        setDropdownOpen(false)
                      }
                    >
                      <LayoutDashboard size={17} />
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/shop"
                      className="dropdown-item d-flex align-items-center gap-2 py-2"
                      onClick={() =>
                        setDropdownOpen(false)
                      }
                    >
                      <ShoppingCart size={17} />
                      Shop
                    </Link>
                  )}

                  <button
                    type="button"
                    className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                    onClick={handleSignOut}
                  >
                    <LogOut size={17} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth/signin"
                className="btn btn-outline-dark"
              >
                Sign In
              </Link>

              <Link
                to="/auth/signup"
                className="btn text-white"
                style={{
                  background:
                    'linear-gradient(to right, #db8727, #ef6f0f)',
                  border: 'none',
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="d-flex d-lg-none align-items-center gap-1 ms-auto">
          {/* Mobile Cart */}
          <Link
            to="/cart"
            className="btn btn-link text-dark position-relative p-2"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={21} />

            {itemCount > 0 && (
              <span
                className="position-absolute badge rounded-pill bg-danger"
                style={{
                  top: '0px',
                  right: '-1px',
                  fontSize: '9px',
                  minWidth: '17px',
                  height: '17px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                }}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="btn btn-link text-dark p-2"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>

          <button
            type="button"
            className="btn btn-link text-dark p-2"
            onClick={() =>
              setMobileMenuOpen(
                current => !current
              )
            }
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="d-lg-none border-top bg-white">
          <div className="container py-3">
            <div className="d-flex flex-column gap-2">
              <Link
                to="/shop"
                className="btn btn-light text-start"
                onClick={handleMobileNavigation}
              >
                Shop
              </Link>

              {user?.role !== 'BRAND' && (
                <Link
                  to="/auth/brand-signup"
                  className="btn btn-light text-start"
                  onClick={handleMobileNavigation}
                >
                  Sell on VAA
                </Link>
              )}

              <Link
                to="/cart"
                className="btn btn-light text-start d-flex align-items-center justify-content-between"
                onClick={handleMobileNavigation}
              >
                <span className="d-flex align-items-center gap-2">
                  <ShoppingCart size={18} />
                  Cart
                </span>

                {itemCount > 0 && (
                  <span className="badge bg-danger rounded-pill">
                    {itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <hr className="my-2" />

                  <div className="px-2">
                    <p className="fw-semibold mb-1">
                      {user.name ||
                        user.email.split('@')[0]}
                    </p>

                    <p className="small text-secondary mb-2">
                      {user.email}
                    </p>
                  </div>

                  {user.role === 'BRAND' ? (
                    <Link
                      to="/brand/dashboard"
                      className="btn btn-light text-start d-flex align-items-center gap-2"
                      onClick={handleMobileNavigation}
                    >
                      <LayoutDashboard size={18} />
                      Brand Dashboard
                    </Link>
                  ) : user.role === 'ADMIN' ? (
                    <Link
                      to="/admin/dashboard"
                      className="btn btn-light text-start d-flex align-items-center gap-2"
                      onClick={handleMobileNavigation}
                    >
                      <LayoutDashboard size={18} />
                      Admin Dashboard
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    className="btn btn-light text-danger text-start d-flex align-items-center gap-2"
                    onClick={handleSignOut}
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/signin"
                    className="btn btn-outline-primary"
                    onClick={handleMobileNavigation}
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/auth/signup"
                    className="btn text-white"
                    style={{
                      background:
                        'linear-gradient(to right, #db8727, #ef6f0f)',
                      border: 'none',
                    }}
                    onClick={handleMobileNavigation}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}