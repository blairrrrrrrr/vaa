import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import {
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const [dropdownOpen, setDropdownOpen] =
    useState(false)

  const dropdownRef =
    useRef<HTMLDivElement>(null)

  const navigate = useNavigate()

  // close dropdown on outside click
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

    navigate('/auth/signin', {
      replace: true,
    })
  }

  const getDashboardPath = () => {
    if (!user) {
      return '/auth/signin'
    }

    if (user.role === 'ADMIN') {
      return '/admin/dashboard'
    }

    if (user.role === 'BRAND') {
      return '/brand/dashboard'
    }

    return '/shop'
  }

  return (
    <nav
      className="navbar navbar-expand-lg border-bottom sticky-top"
      style={{
        zIndex: 50,
        backgroundColor:
          'hsl(var(--background))',
        color:
          'hsl(var(--foreground))',
      }}
    >
      <div className="container">
        {/* logo */}

        <Link
          to="/"
          className="navbar-brand fw-bold"
          onClick={() => {
            setDropdownOpen(false)
            setMobileMenuOpen(false)
          }}
        >
          <img
            src="/vaa-01.png"
            alt="VAA Logo"
            style={{
              width: '75px',
              height: '75px',
              objectFit: 'contain',
            }}
          />
        </Link>

        {/* Desktop Navigation */}

        <div className="d-none d-md-flex align-items-center gap-3 ms-auto">
          {/* SHOP */}

          <Link
            to="/shop"
            className="text-decoration-none"
            style={{
              color:
                'hsl(var(--foreground))',
            }}
          >
            Shop
          </Link>

          {/* sell */}

          {(!user ||
            (user.role !== 'BRAND' &&
              user.role !== 'ADMIN')) && (
              <Link
                to="/auth/brand-signup"
                className="text-decoration-none"
                style={{
                  color:
                    'hsl(var(--foreground))',
                }}
              >
                Sell
              </Link>
            )}

          {/* Theme */}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon
                style={{
                  width: '20px',
                  height: '20px',
                }}
              />
            ) : (
              <Sun
                style={{
                  width: '20px',
                  height: '20px',
                }}
              />
            )}
          </Button>

          {/* User Auth */}

          {user ? (
            <div
              className="position-relative"
              ref={dropdownRef}
            >
              {/* dropdown */}

              <Button
                variant="ghost"
                onClick={() =>
                  setDropdownOpen(
                    (previous) =>
                      !previous
                  )
                }
                aria-expanded={
                  dropdownOpen
                }
                aria-haspopup="menu"
                className="d-flex align-items-center gap-2"
              >
                <User
                  style={{
                    width: '19px',
                    height: '19px',
                  }}
                />

                <span>
                  {user.name ||
                    user.email.split(
                      '@'
                    )[0]}
                </span>

                <ChevronDown
                  style={{
                    width: '16px',
                    height: '16px',
                    transform:
                      dropdownOpen
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                    transition:
                      'transform 0.2s ease',
                  }}
                />
              </Button>

              {/* dropdown */}

              {dropdownOpen && (
                <div
                  className="position-absolute end-0 mt-2 shadow rounded border"
                  role="menu"
                  style={{
                    minWidth: '220px',
                    backgroundColor:
                      'hsl(var(--background))',
                    color:
                      'hsl(var(--foreground))',
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}
                >
                  {/* user info */}

                  <div
                    className="px-3 py-3 border-bottom"
                  >
                    <div
                      className="fw-semibold"
                    >
                      {user.name ||
                        'VAA User'}
                    </div>

                    <div
                      className="small text-secondary text-truncate"
                    >
                      {user.email}
                    </div>

                    <div
                      className="small mt-1 text-uppercase"
                      style={{
                        letterSpacing:
                          '0.05em',
                      }}
                    >
                      {user.role}
                    </div>
                  </div>

                  {/* dashboard */}

                  <Link
                    to={getDashboardPath()}
                    className="text-decoration-none d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      color:
                        'hsl(var(--foreground))',
                    }}
                    role="menuitem"
                    onClick={() =>
                      setDropdownOpen(
                        false
                      )
                    }
                  >
                    <LayoutDashboard
                      style={{
                        width: '18px',
                        height: '18px',
                      }}
                    />

                    Dashboard
                  </Link>

                  {/* shop*/}

                  <Link
                    to="/shop"
                    className="text-decoration-none d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      color:
                        'hsl(var(--foreground))',
                    }}
                    role="menuitem"
                    onClick={() =>
                      setDropdownOpen(
                        false
                      )
                    }
                  >
                    Shop
                  </Link>

                  {/* sign out */}

                  <div className="border-top">
                    <button
                      type="button"
                      className="w-100 border-0 bg-transparent d-flex align-items-center gap-2 px-3 py-2 text-start"
                      style={{
                        color:
                          'hsl(var(--foreground))',
                      }}
                      role="menuitem"
                      onClick={
                        handleSignOut
                      }
                    >
                      <LogOut
                        style={{
                          width: '18px',
                          height: '18px',
                        }}
                      />

                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* sign in */}

              <Link
                to="/auth/signin"
                className="text-decoration-none"
              >
                <Button
                  variant="ghost"
                  style={{
                    background:
                      'linear-gradient(to right, #db8727, #ef6f0f)',
                    border: 'none',
                    color: 'white',
                  }}
                >
                  Sign In
                </Button>
              </Link>

              {/* sign up */}

              <Link
                to="/auth/signup"
                className="text-decoration-none"
              >
                <Button
                  style={{
                    background:
                      'linear-gradient(to right, #db8727, #ef6f0f)',
                    border: 'none',
                    color: 'white',
                  }}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

     {/* mobile */}

        <div className="d-md-none d-flex align-items-center gap-2 ms-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon
                style={{
                  width: '20px',
                  height: '20px',
                }}
              />
            ) : (
              <Sun
                style={{
                  width: '20px',
                  height: '20px',
                }}
              />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setMobileMenuOpen(
                (previous) =>
                  !previous
              )
            }
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X
                style={{
                  width: '24px',
                  height: '24px',
                }}
              />
            ) : (
              <Menu
                style={{
                  width: '24px',
                  height: '24px',
                }}
              />
            )}
          </Button>
        </div>
      </div>

      {/* mobile menu */}

      {mobileMenuOpen && (
        <div
          className="d-md-none border-top w-100 px-4 py-4"
          style={{
            backgroundColor:
              'hsl(var(--background))',
            color:
              'hsl(var(--foreground))',
          }}
        >
          <div className="d-flex flex-column gap-3">
            {/* shop */}

            <Link
              to="/shop"
              className="text-decoration-none"
              style={{
                color:
                  'hsl(var(--foreground))',
              }}
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              Shop
            </Link>

            {/* sell */}

            {(!user ||
              (user.role !== 'BRAND' &&
                user.role !== 'ADMIN')) && (
                <Link
                  to="/auth/brand-signup"
                  className="text-decoration-none"
                  style={{
                    color:
                      'hsl(var(--foreground))',
                  }}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  Sell
                </Link>
              )}

            {user ? (
              <>
                {/* account info */}

                <div className="border-top pt-3">
                  <div className="small text-secondary">
                    Signed in as
                  </div>

                  <div className="fw-semibold">
                    {user.name ||
                      user.email}
                  </div>

                  <div className="small text-secondary">
                    {user.role}
                  </div>
                </div>

                {/* dashboard */}

                <Link
                  to={getDashboardPath()}
                  className="text-decoration-none"
                  onClick={() =>
                    setMobileMenuOpen(
                      false
                    )
                  }
                >
                  <Button
                    variant="ghost"
                    className="w-100"
                  >
                    <LayoutDashboard
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight:
                          '6px',
                      }}
                    />

                    Dashboard
                  </Button>
                </Link>

                {/* sign out */}

                <Button
                  variant="ghost"
                  className="w-100"
                  onClick={
                    handleSignOut
                  }
                >
                  <LogOut
                    style={{
                      width: '18px',
                      height: '18px',
                      marginRight:
                        '6px',
                    }}
                  />

                  Sign Out
                </Button>
              </>
            ) : (
              <>
                {/* sign in */}

                <Link
                  to="/auth/signin"
                  className="text-decoration-none"
                  onClick={() =>
                    setMobileMenuOpen(
                      false
                    )
                  }
                >
                  <Button
                    variant="ghost"
                    className="w-100"
                    style={{
                      background:
                        'linear-gradient(to right, #db8727, #ef6f0f)',
                      border: 'none',
                      color: 'white',
                    }}
                  >
                    Sign In
                  </Button>
                </Link>

                {/* sign up */}

                <Link
                  to="/auth/signup"
                  className="text-decoration-none"
                  onClick={() =>
                    setMobileMenuOpen(
                      false
                    )
                  }
                >
                  <Button
                    className="w-100"
                    style={{
                      background:
                        'linear-gradient(to right, #db8727, #ef6f0f)',
                      border: 'none',
                      color: 'white',
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
