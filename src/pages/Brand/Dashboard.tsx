import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import Navbar from '../../components/Navbar'
import { Plus, TrendingUp, DollarSign, Eye, Edit, Trash2, BarChart3, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001'

export default function BrandDashboard() {
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)


  const loadBrand = async () => {
    const token = localStorage.getItem('token')

    const response = await fetch(
      `${API_URL}/api/brand/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || 'Failed to load brand'
      )
    }

    setBrand(data)
    return data
  }

  const loadProducts = async (brandId: string) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/api/products/brand/${brandId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()
    if (!response.ok) {
      console.error('Failed to load products:', data)
      setProducts([])
      return
    }
    setProducts(data)
  }

  useEffect(() => {
    const brandData = localStorage.getItem('brand')
    if (brandData) {
      setBrand(JSON.parse(brandData))
      const parsedBrand = JSON.parse(brandData)
      loadProducts(parsedBrand.id)
        .finally(() => setLoading(false))
    } else {
      loadBrand()
        .then((data) => loadProducts(data.id))
        .catch(() => setLoading(false))
        .finally(() => setLoading(false))
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

    const name = formData.get('name')
    const description = formData.get('description')
    const price = formData.get('price')
    const stock = formData.get('stock')
    const imageUrl = formData.get('imageUrl')
    const category = formData.get('category')

    const token = localStorage.getItem('token')
    const response = await fetch(
      `${API_URL}/api/products`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          stock: Number(stock),
          imageUrl,
          category,
        }),
      }
    )
    if (response.ok) {
      setShowAddProduct(false)
      // Refresh products
      if (brand) {
        loadProducts(brand.id)
      }
    }
  }

  const updateProduct = async (
    productId: string,
    productData: {
      name: string
      description: string
      price: number
      stock: number
      imageUrl?: string
      category: string
    }
  ) => {
    const token = localStorage.getItem('token')

    const response = await fetch(
      `${API_URL}/api/products/${productId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || 'Failed to update product'
      )
    }

    return data
  }

  const deleteProduct = async (
    productId: string
  ) => {
    const token = localStorage.getItem('token')

    const response = await fetch(
      `${API_URL}/api/products/${productId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || 'Failed to delete product'
      )
    }

    return data
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId)
      if (brand) {
        loadProducts(brand.id)
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      category: formData.get('category') as string,
      imageUrl: formData.get('imageUrl') as string,
    }

    try {
      await updateProduct(editingProduct.id, productData)
      setEditingProduct(null)
      if (brand) {
        loadProducts(brand.id)
      }
    } catch (error) {
      console.error('Failed to update product:', error)
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

            {editingProduct && (
              <Card className="mb-4 border-2">
                <CardHeader>
                  <CardTitle>Edit Product</CardTitle>
                  <CardDescription>Update product details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProduct}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <Label htmlFor="edit-name">Product Name</Label>
                        <Input id="edit-name" name="name" defaultValue={editingProduct.name} required />
                      </div>
                      <div className="col-md-6">
                        <Label htmlFor="edit-price">Price</Label>
                        <Input id="edit-price" name="price" type="number" defaultValue={editingProduct.price} required />
                      </div>
                      <div className="col-12">
                        <Label htmlFor="edit-description">Description</Label>
                        <Input id="edit-description" name="description" defaultValue={editingProduct.description} required />
                      </div>
                      <div className="col-md-6">
                        <Label htmlFor="edit-category">Category</Label>
                        <Input id="edit-category" name="category" defaultValue={editingProduct.category} required />
                      </div>
                      <div className="col-md-6">
                        <Label htmlFor="edit-stock">Stock</Label>
                        <Input id="edit-stock" name="stock" type="number" defaultValue={editingProduct.stock} required />
                      </div>
                      <div className="col-12">
                        <Label htmlFor="edit-imageUrl">Image URL</Label>
                        <Input id="edit-imageUrl" name="imageUrl" defaultValue={editingProduct.imageUrl || editingProduct.image} required />
                      </div>
                      <div className="col-12 d-flex gap-2">
                        <Button type="submit" style={{ background: 'linear-gradient(to right, #6f42c1, #d63384)', border: 'none', color: 'white' }}>Update Product</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
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
                        src={product.imageUrl || product.image}
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
                            <Button variant="ghost" size="icon" style={{ width: '32px', height: '32px' }} onClick={() => handleEditProduct(product)}>
                              <Edit style={{ width: '16px', height: '16px' }} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-danger" style={{ width: '32px', height: '32px' }} onClick={() => handleDeleteProduct(product.id)}>
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
                            <p className="fw-semibold">{product.sales || 0}</p>
                          </div>
                          <div className="col-3">
                            <p className="text-secondary">Views</p>
                            <p className="fw-semibold">{product.views || 0}</p>
                          </div>
                          <div className="col-3">
                            <p className="text-secondary">Revenue</p>
                            <p className="fw-semibold text-success">${(product.revenue || 0).toLocaleString()}</p>
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
                      <span className={`rounded-circle d-flex align-items-center justify-content-center small fw-bold ${index === 0 ? 'bg-warning text-warning-emphasis' :
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
