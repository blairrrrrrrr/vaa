import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import Navbar from '../../components/Navbar'
import { Users, Store, ShoppingBag, TrendingUp, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle, Shield, Settings, Activity } from 'lucide-react'

const API_URL = 'http://localhost:3001'

export default function AdminDashboard() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`${API_URL}/api/brands`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setBrands(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const pendingBrands = brands.filter((b: any) => b.status === 'pending')
  const approvedBrands = brands.filter((b: any) => b.status === 'approved')

  const stats = {
    totalUsers: brands.length * 30, // Estimated
    totalBrands: brands.length,
    totalProducts: approvedBrands.reduce((sum: number, b: any) => sum + (b.products?.length || 0), 0),
    totalRevenue: approvedBrands.reduce((sum: number, b: any) => sum + (b.products?.reduce((s: number, p: any) => s + (p.price || 0), 0) || 0), 0),
    pendingVerifications: pendingBrands.length,
    activeIssues: 0,
    monthlyGrowth: '+23%'
  }

  const topBrands = approvedBrands
    .map((b: any) => ({
      name: b.name,
      revenue: b.products?.reduce((s: number, p: any) => s + (p.price || 0), 0) || 0,
      products: b.products?.length || 0,
      growth: '+15%'
    }))
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 4)

  const handleApprove = async (brandId: string) => {
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/api/brands/${brandId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'approved' })
    })
    // Refresh brands
    const res = await fetch(`${API_URL}/api/brands`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setBrands(data)
  }

  const handleReject = async (brandId: string) => {
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/api/brands/${brandId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'rejected' })
    })
    // Refresh brands
    const res = await fetch(`${API_URL}/api/brands`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setBrands(data)
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-4">
        {/* Welcome Section */}
        <div className="mb-4">
          <h1 className="display-6 fw-bold mb-2">Admin Dashboard</h1>
          <p className="text-secondary">Overview of platform performance and pending actions</p>
        </div>

        {/* Stats Grid */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
          <div className="col">
            <Card className="border-2">
              <CardHeader className="d-flex flex-row align-items-center justify-content-between pb-2">
                <CardTitle className="small text-secondary">Total Users</CardTitle>
                <Users style={{ width: '16px', height: '16px', color: '#0d6efd' }} />
              </CardHeader>
              <CardContent>
                <div className="fs-4 fw-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="small text-success d-flex align-items-center gap-1 mt-1">
                  <TrendingUp style={{ width: '12px', height: '12px' }} />
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="col">
            <Card className="border-2">
              <CardHeader className="d-flex flex-row align-items-center justify-content-between pb-2">
                <CardTitle className="small text-secondary">Total Brands</CardTitle>
                <Store style={{ width: '16px', height: '16px', color: '#6f42c1' }} />
              </CardHeader>
              <CardContent>
                <div className="fs-4 fw-bold">{stats.totalBrands}</div>
                <p className="small text-success d-flex align-items-center gap-1 mt-1">
                  <TrendingUp style={{ width: '12px', height: '12px' }} />
                  +8% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="col">
            <Card className="border-2">
              <CardHeader className="d-flex flex-row align-items-center justify-content-between pb-2">
                <CardTitle className="small text-secondary">Total Products</CardTitle>
                <ShoppingBag style={{ width: '16px', height: '16px', color: '#d63384' }} />
              </CardHeader>
              <CardContent>
                <div className="fs-4 fw-bold">{stats.totalProducts}</div>
                <p className="small text-success d-flex align-items-center gap-1 mt-1">
                  <TrendingUp style={{ width: '12px', height: '12px' }} />
                  +15% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="col">
            <Card className="border-2">
              <CardHeader className="d-flex flex-row align-items-center justify-content-between pb-2">
                <CardTitle className="small text-secondary">Total Revenue</CardTitle>
                <DollarSign style={{ width: '16px', height: '16px', color: '#198754' }} />
              </CardHeader>
              <CardContent>
                <div className="fs-4 fw-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="small text-success d-flex align-items-center gap-1 mt-1">
                  <TrendingUp style={{ width: '12px', height: '12px' }} />
                  {stats.monthlyGrowth} from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="row row-cols-md-2 g-4 mb-4">
          <div className="col">
            <Card className="border-2 border-warning bg-warning-subtle">
              <CardHeader className="d-flex flex-row align-items-center justify-content-between pb-2">
                <CardTitle className="small text-warning-emphasis">Pending Verifications</CardTitle>
                <Clock style={{ width: '16px', height: '16px', color: '#fd7e14' }} />
              </CardHeader>
              <CardContent>
                <div className="fs-4 fw-bold text-warning-emphasis">{stats.pendingVerifications}</div>
                <p className="small text-warning mt-1">Brands awaiting approval</p>
              </CardContent>
            </Card>
          </div>

          <div className="col">
            <Card className="border-2 border-danger bg-danger-subtle">
              <CardHeader className="d-flex flex-row align-items-center justify-content-between pb-2">
                <CardTitle className="small text-danger-emphasis">Active Issues</CardTitle>
                <AlertTriangle style={{ width: '16px', height: '16px', color: '#dc3545' }} />
              </CardHeader>
              <CardContent>
                <div className="fs-4 fw-bold text-danger-emphasis">{stats.activeIssues}</div>
                <p className="small text-danger mt-1">Requires immediate attention</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="row row-cols-lg-3 g-4">
          {/* Pending Brand Verifications */}
          <div className="col-lg-8">
            <Card>
              <CardHeader>
                <CardTitle className="d-flex align-items-center gap-2">
                  <Shield style={{ width: '20px', height: '20px' }} />
                  Pending Brand Verifications
                </CardTitle>
                <CardDescription>Review and approve brand registration requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-column gap-3">
                  {pendingBrands.map(brand => (
                    <div key={brand.id} className="d-flex align-items-center justify-content-between p-3 border rounded hover:bg-light transition-colors">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-purple-100 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                          <Store style={{ width: '24px', height: '24px', color: '#6f42c1' }} />
                        </div>
                        <div>
                          <h3 className="fw-semibold">{brand.name}</h3>
                          <p className="small text-secondary">{brand.user?.email}</p>
                          <div className="d-flex gap-2 mt-1">
                            <span className="badge bg-primary">{brand.category}</span>
                            <span className="small text-muted">{new Date(brand.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button size="sm" className="gap-2 btn-success" onClick={() => handleApprove(brand.id)}>
                          <CheckCircle style={{ width: '16px', height: '16px' }} />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-2" onClick={() => handleReject(brand.id)}>
                          <XCircle style={{ width: '16px', height: '16px' }} />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingBrands.length === 0 && (
                    <p className="text-center text-muted py-4">No pending brand verifications</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Brands */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="d-flex align-items-center gap-2">
                  <TrendingUp style={{ width: '20px', height: '20px' }} />
                  Top Performing Brands
                </CardTitle>
                <CardDescription>Brands with highest revenue this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-column gap-3">
                  {topBrands.map((brand, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between p-3 border rounded">
                      <div className="d-flex align-items-center gap-3">
                        <span className={`rounded-circle d-flex align-items-center justify-content-center small fw-bold ${
                          index === 0 ? 'bg-warning text-warning-emphasis' :
                          index === 1 ? 'bg-secondary text-white' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-primary text-white'
                        }`} style={{ width: '32px', height: '32px' }}>
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="fw-semibold">{brand.name}</h3>
                          <p className="small text-secondary">{brand.products} products</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="fw-semibold">${brand.revenue.toLocaleString()}</p>
                        <p className="small text-success">{brand.growth}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col d-flex flex-column gap-4">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="d-flex align-items-center gap-2">
                  <Activity style={{ width: '20px', height: '20px' }} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted small">Activity tracking coming soon</p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="d-flex align-items-center gap-2">
                  <Settings style={{ width: '20px', height: '20px' }} />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="d-flex flex-column gap-2">
                <Button variant="outline" className="w-100 justify-content-start gap-2">
                  <Users style={{ width: '16px', height: '16px' }} />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-100 justify-content-start gap-2">
                  <Store style={{ width: '16px', height: '16px' }} />
                  Manage Brands
                </Button>
                <Button variant="outline" className="w-100 justify-content-start gap-2">
                  <ShoppingBag style={{ width: '16px', height: '16px' }} />
                  Manage Products
                </Button>
                <Button variant="outline" className="w-100 justify-content-start gap-2">
                  <Shield style={{ width: '16px', height: '16px' }} />
                  Review Reports
                </Button>
                <Button variant="outline" className="w-100 justify-content-start gap-2">
                  <Settings style={{ width: '16px', height: '16px' }} />
                  Platform Settings
                </Button>
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card>
              <CardHeader>
                <CardTitle className="d-flex align-items-center gap-2">
                  <Activity style={{ width: '20px', height: '20px' }} />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-secondary">Server Status</span>
                      <span className="fw-medium text-success">Healthy</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-success w-100" />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-secondary">Database</span>
                      <span className="fw-medium text-success">Optimal</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-success" style={{ width: '95%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-secondary">API Response</span>
                      <span className="fw-medium text-success">Fast</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-success" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
