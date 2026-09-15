import { createContext, useContext, useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export type UserRole = 'CUSTOMER' | 'BRAND' | 'ADMIN'

export interface User {
  id: string
  email: string
  name?: string | null
  role: UserRole
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string, name?: string) => Promise<User>
  setSession: (token: string, user: User) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const setSession = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Session expired')
        }

        const userData = await response.json()
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('brand')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Invalid credentials')
    }

    setSession(data.token, data.user)

    if (data.brand) {
      localStorage.setItem('brand', JSON.stringify(data.brand))
    }

    return data.user
  }

  const signUp = async (
    email: string,
    password: string,
    name?: string
  ) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create account')
    }

    setSession(data.token, data.user)

    return data.user
  }

  const signOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('brand')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        setSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}