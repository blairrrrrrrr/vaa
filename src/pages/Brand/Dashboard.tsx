import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import Navbar from '../../components/Navbar'
import { Plus, TrendingUp, DollarSign, Eye, Edit, Trash2, BarChart3, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const API_URL = 'http://localhost:3001'

export default function BrandDashboard() {
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const brandData = localStorage.getItem('brand')
    if (brandData) {
      setBrand(JSON.parse(brandData))
    }

    const token = localStorage.getItem('token')
    if (brandData) {
      const parsedBrand = JSON.parse(brandData)
      fetch(`${API_URL}/api/products/brand/${parsedBrand.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setProducts(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const stats = {
    totalProducts: products.length,
    totalSales: products.reduce((sum, p) => sum + (p.stock || 0), 0),
    totalRevenue: products.reduce((sum, p) => sum + (p.price || 0), 0),
    totalViews: products.length * 100,
    customers: 0,
    conversionRate: 8.5
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price') as string),
        stock: parseInt(formData.get('stock') as string),
        category: formData.get('category'),
        imageUrl: formData.get('imageUrl')
      })
    })
    if (res.ok) {
      setShowAddProduct(false)
      // Refresh products
      if (brand) {
        const productsRes = await fetch(`${API_URL}/api/products/brand/${brand.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await productsRes.json()
        setProducts(data)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <p className="text-secondary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-4">
        {/* Welcome Section */}
        <div className="mb-4">
          <h1 className="display-6 fw-bold mb-2">Brand Dashboard</h1>
          <p className="text-secondary">Welcome back! Here's an overview of your store performance.</p>
        </div>

        {/* Stats Grid */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
          <div className="col">
            <Card className="border-2">
              <CardHeader className="d-flex flex-row align-items-center justify-content-between pb-2">
                <CardTitle className="small text-secondary">Total Revenue</CardTitle>
                <DollarSign style={{ width: '16px', height: '16px', color: '#6f42c1' }} />
              </CardHeader>
              <CardContent>
                <div className="fs-4 fw-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="small text-success d-flex align-items-center gap-1 mt-1">
                  <ArrowUpRight style={{ width: '12px', height: '12px' }} />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="col">
            <Card className="border-2">
              <CardHeader className="d-flex flex-row align-items-center justify-content-between pb-2">
                <CardTitle className="small text-secondary">Total Sales</CardTitle>
                <ShoppingCart style={{ width: '16px', height: '16px', color: '#d63384' }} />
              </CardHeader>
              <CardContent>
                <div className="fs-4 fw-bold">{stats.totalSales}</div>
                <p className="small text-success d-flex align-items-center gap-1 mt-1">
                  <ArrowUpRight style={{ width: '12px', height: '12px' }} />
                  +8.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="col">
            <Card className="border-2">
              <CardHeader className="d-flex flex-row align-items-center justify-content-between pb-2">
                <CardTitle className="small text-secondary">Product Views</CardTitle>
                <Eye style={{ width: '16px', height: '16px', color: '#0d6efd' }} />
              </CardHeader>
              <CardContent>
                <div className="fs-4 fw-bold">{stats.totalViews.toLocaleString()}</div>
                <p className="small text-success d-flex align-items-center gap-1 mt-1">
                  <ArrowUpRight style={{ width: '12px', height: '12px' }} />
                  +15.3% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="col">
            <Card className="border-2">
              <CardHeader className="d-flex flex-row align-items-center justify-content-between pb-2">
                <CardTitle className="small text-secondary">Conversion Rate</CardTitle>
                <TrendingUp style={{ width: '16px', height: '16px', color: '#198754' }} />
              </CardHeader>
              <CardContent>
                <div className="fs-4 fw-bold">{stats.conversionRate}%</div>
                <p className="small text-danger d-flex align-items-center gap-1 mt-1">
                  <ArrowDownRight style={{ width: '12px', height: '12px' }} />
                  -2.1% from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="row row-cols-lg-3 g-4">
          {/* Products Section */}
          <div className="col-lg-8">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="h4 fw-bold">Your Products</h2>
              <Button onClick={() => setShowAddProduct(!showAddProduct)} className="gap-2" style={{ background: 'linear-gradient(to right, #6f42c1, #d63384)', border: 'none', color: 'white' }}>
                <Plus style={{ width: '16px', height: '16px' }} />
                Add Product
              </Button>
            </div>

            {showAddProduct && (
              <Card className="mb-4 border-2">
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>Fill in the details to list a new product</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProduct}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" name="name" placeholder="Product name" required />
                      </div>
                      <div className="col-md-6">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" name="price" type="number" placeholder="0.00" required />
                      </div>
                      <div className="col-12">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" placeholder="Product description" required />
                      </div>
                      <div className="col-md-6">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" placeholder="Category" required />
                      </div>
                      <div className="col-md-6">
                        <Label htmlFor="stock">Stock</Label>
                        <Input id="stock" name="stock" type="number" placeholder="0" required />
                      </div>
                      <div className="col-12">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input id="imageUrl" name="imageUrl" placeholder="https://..." required />
                      </div>
                      <div className="col-12 d-flex gap-2">
                        <Button type="submit" style={{ background: 'linear-gradient(to right, #6f42c1, #d63384)', border: 'none', color: 'white' }}>Add Product</Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="d-flex flex-column gap-3">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="d-flex">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover"
                        style={{ width: '128px', height: '128px' }}
                      />
                      <div className="flex-1 p-3">
                        <div className="d-flex align-items-start justify-content-between mb-2">
                          <div>
                            <h3 className="fw-semibold fs-5">{product.name}</h3>
                            <p className="small text-secondary">${product.price}</p>
                          </div>
                          <div className="d-flex gap-2">
                            <Button variant="ghost" size="icon" style={{ width: '32px', height: '32px' }}>
                              <Edit style={{ width: '16px', height: '16px' }} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-danger" style={{ width: '32px', height: '32px' }}>
                              <Trash2 style={{ width: '16px', height: '16px' }} />
                            </Button>
                          </div>
                        </div>
                        <div className="row g-3 small">
                          <div className="col-3">
                            <p className="text-secondary">Stock</p>
                            <p className="fw-semibold">{product.stock}</p>
                          </div>
                          <div className="col-3">
                            <p className="text-secondary">Sales</p>
                            <p className="fw-semibold">{product.sales}</p>
                          </div>
                          <div className="col-3">
                            <p className="text-secondary">Views</p>
                            <p className="fw-semibold">{product.views}</p>
                          </div>
                          <div className="col-3">
                            <p className="text-secondary">Revenue</p>
                            <p className="fw-semibold text-success">${product.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col d-flex flex-column gap-4">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="d-flex align-items-center gap-2">
                  <ShoppingCart style={{ width: '20px', height: '20px' }} />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted small">Order tracking coming soon</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="d-flex align-items-center gap-2">
                  <BarChart3 style={{ width: '20px', height: '20px' }} />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-secondary">Sales Goal</span>
                      <span className="fw-medium">75%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar" style={{ width: '75%', background: 'linear-gradient(to right, #6f42c1, #d63384)' }} />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-secondary">Inventory</span>
                      <span className="fw-medium">60%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar" style={{ width: '60%', background: 'linear-gradient(to right, #0d6efd, #0dcaf0)' }} />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-secondary">Customer Satisfaction</span>
                      <span className="fw-medium">92%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar" style={{ width: '92%', background: 'linear-gradient(to right, #198754, #20c997)' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="d-flex align-items-center gap-2">
                  <TrendingUp style={{ width: '20px', height: '20px' }} />
                  Top Performing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-column gap-2">
                  {products.slice(0, 3).map((product, index) => (
                    <div key={product.id} className="d-flex align-items-center gap-2">
                      <span className={`rounded-circle d-flex align-items-center justify-content-center small fw-bold ${
                        index === 0 ? 'bg-warning text-warning-emphasis' :
                        index === 1 ? 'bg-secondary text-white' :
                        'bg-orange-100 text-orange-700'
                      }`} style={{ width: '24px', height: '24px' }}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="small fw-medium">{product.name}</p>
                        <p className="small text-secondary">${product.revenue.toLocaleString()} revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
