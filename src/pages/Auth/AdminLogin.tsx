import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
const API_URL = 'http://localhost:3001'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setSession } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/admin-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSession(data.token, data.user)

      navigate('/admin/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-light p-4">
      <Navbar />
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <Card className="w-100" style={{ maxWidth: '400px' }}>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@marketplace.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-danger small">{error}</p>}
              <Button type="submit" className="w-100" disabled={loading}>
                {loading ? 'Signing in...' : 'Admin Login'}
              </Button>
            </form>
            <div className="mt-4 text-center small">
              <Link to="/" className="text-primary text-decoration-none">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
