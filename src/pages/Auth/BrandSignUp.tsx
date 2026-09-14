import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import Navbar from '../../components/Navbar'

const API_URL = 'http://localhost:3001'

export default function BrandSignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [brandName, setBrandName] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!brandName.trim()) {
      setError('Brand name is required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/brand-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: brandName, brandName, category })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('brand', JSON.stringify(data.brand))
      navigate('/brand/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create brand account')
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
          <CardTitle>Register Your Brand</CardTitle>
          <CardDescription>Start selling your fashion products</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                type="text"
                placeholder="Your Brand Name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                type="text"
                placeholder="e.g., Luxury, Streetwear, Minimal"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="brand@email.com"
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
            <div className="mb-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-danger small">{error}</p>}
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? 'Creating account...' : 'Register Brand'}
            </Button>
          </form>
          <div className="mt-4 text-center small">
            <Link to="/auth/signin" className="text-primary text-decoration-none">
              Already have a brand account? Sign in
            </Link>
          </div>
          <div className="mt-2 text-center small">
            <Link to="/auth/signup" className="text-primary text-decoration-none">
              Shopping as customer? Sign up here
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
