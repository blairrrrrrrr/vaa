import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import Navbar from '../../components/Navbar'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      if (email === 'admin@marketplace.com') {
        navigate('/admin')
      } else {
        navigate('/shop')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
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
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center small">
            <Link to="/auth/signup" className="text-primary text-decoration-none">
              Don't have an account? Sign up
            </Link>
          </div>
          <div className="mt-2 text-center small">
            <Link to="/auth/brand-signup" className="text-primary text-decoration-none">
              Are you a brand? Register here
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
