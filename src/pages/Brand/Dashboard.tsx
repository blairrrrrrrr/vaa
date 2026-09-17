import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Store,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react'

import Navbar from '../../components/Navbar'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { useAuth } from '../../context/AuthContext'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl?: string | null
  category: string
  brandId: string
  createdAt: string
  updatedAt: string
}

interface Brand {
  id: string
  name: string
  description?: string | null
  category?: string | null
  status: string
  userId: string
  createdAt: string
  updatedAt: string
  products: Product[]
}

interface ProductForm {
  name: string
  description: string
  price: string
  stock: string
  category: string
  imageUrl: string
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  imageUrl: '',
}

export default function BrandDashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null)

  const [form, setForm] =
    useState<ProductForm>(emptyForm)

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/signin', { replace: true })
      return
    }

    if (!authLoading && user?.role !== 'BRAND') {
      navigate('/shop', { replace: true })
      return
    }

    if (!authLoading && user?.role === 'BRAND') {
      loadBrand()
    }
  }, [user, authLoading])

  const loadBrand = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        navigate('/auth/signin', { replace: true })
        return
      }

      const response = await fetch(
        `${API_URL}/api/brand/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('brand')

        navigate('/auth/signin', { replace: true })
        return
      }

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to load brand'
        )
      }

      setBrand(data)
    } catch (err: any) {
      setError(
        err.message || 'Failed to load brand dashboard'
      )
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingProduct(null)
    setShowAddProduct(false)
  }

  const handleAddProduct = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    try {
      setSubmitting(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('You are not authenticated')
      }

      const response = await fetch(
        `${API_URL}/api/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            stock: Number(form.stock),
            category: form.category.trim(),
            imageUrl: form.imageUrl.trim() || null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to create product'
        )
      }

      await loadBrand()
      resetForm()
    } catch (err: any) {
      setError(
        err.message || 'Failed to create product'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)

    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      imageUrl: product.imageUrl || '',
    })

    setShowAddProduct(false)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleUpdateProduct = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!editingProduct) return

    try {
      setSubmitting(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('You are not authenticated')
      }

      const response = await fetch(
        `${API_URL}/api/products/${editingProduct.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            stock: Number(form.stock),
            category: form.category.trim(),
            imageUrl: form.imageUrl.trim() || null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to update product'
        )
      }

      await loadBrand()
      resetForm()
    } catch (err: any) {
      setError(
        err.message || 'Failed to update product'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (
    productId: string
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    )

    if (!confirmed) return

    try {
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('You are not authenticated')
      }

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

      if (editingProduct?.id === productId) {
        resetForm()
      }

      await loadBrand()
    } catch (err: any) {
      setError(
        err.message || 'Failed to delete product'
      )
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />

        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div
              className="spinner-border mb-3"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="text-secondary">
              Loading your brand dashboard...
            </p>
          </div>
        </div>
      </>
    )
  }

  if (!brand) {
    return (
      <>
        <Navbar />

        <div className="container py-5">
          <Card>
            <CardContent className="py-5 text-center">
              <Store
                className="mx-auto mb-3 text-secondary"
                style={{
                  width: 48,
                  height: 48,
                }}
              />

              <h2 className="h4 fw-bold">
                Brand not found
              </h2>

              <p className="text-secondary mb-4">
                We couldn't find a brand associated with
                your account.
              </p>

              <Button onClick={loadBrand}>
                <RefreshCw
                  style={{
                    width: 16,
                    height: 16,
                    marginRight: 8,
                  }}
                />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const products = brand.products || []

  const totalProducts = products.length

  const totalStock = products.reduce(
    (total, product) =>
      total + product.stock,
    0
  )

  const outOfStock = products.filter(
    (product) => product.stock === 0
  ).length

  const lowStock = products.filter(
    (product) =>
      product.stock > 0 &&
      product.stock <= 5
  ).length

  const status =
    brand.status?.toLowerCase()

  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 py-md-5">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <p className="text-secondary mb-1">
              Brand Dashboard
            </p>

            <h1 className="h2 fw-bold mb-1">
              {brand.name}
            </h1>

            <p className="text-secondary mb-0">
              Manage your products and brand.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline"
              onClick={loadBrand}
              disabled={loading}
            >
              <RefreshCw
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 6,
                }}
              />
              Refresh
            </Button>

            <Button
              onClick={() => {
                setEditingProduct(null)
                setForm(emptyForm)
                setShowAddProduct(
                  !showAddProduct
                )
              }}
              style={{
                background:
                  'linear-gradient(to right, #6f42c1, #d63384)',
                border: 'none',
                color: 'white',
              }}
            >
              <Plus
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 6,
                }}
              />
              Add Product
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-center justify-content-between"
            role="alert"
          >
            <span>{error}</span>

            <button
              type="button"
              className="btn-close"
              onClick={() => setError('')}
            />
          </div>
        )}

        {/* Brand status */}
        <Card className="mb-4">
          <CardContent className="py-3">
            <div className="d-flex align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                {isApproved ? (
                  <CheckCircle
                    className="text-success"
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                ) : isRejected ? (
                  <XCircle
                    className="text-danger"
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                ) : (
                  <Clock
                    className="text-warning"
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                )}

                <div>
                  <div className="fw-semibold">
                    Brand status
                  </div>

                  <div className="small text-secondary">
                    {isApproved
                      ? 'Your brand is approved and active.'
                      : isRejected
                        ? 'Your brand application was rejected.'
                        : 'Your brand is waiting for admin approval.'}
                  </div>
                </div>
              </div>

              <span
                className={`badge ${
                  isApproved
                    ? 'text-bg-success'
                    : isRejected
                      ? 'text-bg-danger'
                      : 'text-bg-warning'
                }`}
              >
                {brand.status}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <Card>
              <CardContent className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-secondary small mb-1">
                      Products
                    </p>

                    <h2 className="h3 fw-bold mb-0">
                      {totalProducts}
                    </h2>
                  </div>

                  <div className="p-3 rounded bg-light">
                    <Package
                      style={{
                        width: 22,
                        height: 22,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <Card>
              <CardContent className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-secondary small mb-1">
                      Total Stock
                    </p>

                    <h2 className="h3 fw-bold mb-0">
                      {totalStock}
                    </h2>
                  </div>

                  <div className="p-3 rounded bg-light">
                    <Store
                      style={{
                        width: 22,
                        height: 22,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <Card>
              <CardContent className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-secondary small mb-1">
                      Stock Alerts
                    </p>

                    <h2 className="h3 fw-bold mb-0">
                      {outOfStock + lowStock}
                    </h2>

                    <p className="small text-secondary mb-0">
                      {outOfStock} out of stock ·{' '}
                      {lowStock} low stock
                    </p>
                  </div>

                  <div className="p-3 rounded bg-light">
                    <Package
                      style={{
                        width: 22,
                        height: 22,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Product */}
        {showAddProduct && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>
                Add New Product
              </CardTitle>

              <CardDescription>
                Add a product to your VAA storefront.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleAddProduct}
              >
                <div className="row g-3">
                  <div className="col-md-6">
                    <Label htmlFor="product-name">
                      Product Name
                    </Label>

                    <Input
                      id="product-name"
                      value={form.name}
                      onChange={(e) =>
                        updateForm(
                          'name',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Oversized Graphic Tee"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="product-price">
                      Price
                    </Label>

                    <Input
                      id="product-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        updateForm(
                          'price',
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <Label htmlFor="product-description">
                      Description
                    </Label>

                    <Input
                      id="product-description"
                      value={form.description}
                      onChange={(e) =>
                        updateForm(
                          'description',
                          e.target.value
                        )
                      }
                      placeholder="Describe your product"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="product-category">
                      Category
                    </Label>

                    <Input
                      id="product-category"
                      value={form.category}
                      onChange={(e) =>
                        updateForm(
                          'category',
                          e.target.value
                        )
                      }
                      placeholder="T-Shirts"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="product-stock">
                      Stock
                    </Label>

                    <Input
                      id="product-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(e) =>
                        updateForm(
                          'stock',
                          e.target.value
                        )
                      }
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="product-image">
                      Image URL
                    </Label>

                    <Input
                      id="product-image"
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) =>
                        updateForm(
                          'imageUrl',
                          e.target.value
                        )
                      }
                      placeholder="https://..."
                    />
                  </div>
                  

                  <div className="col-12 d-flex gap-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background:
                          'linear-gradient(to right, #6f42c1, #d63384)',
                        border: 'none',
                        color: 'white',
                      }}
                    >
                      {submitting
                        ? 'Adding...'
                        : 'Add Product'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Edit Product */}
        {editingProduct && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>
                Edit Product
              </CardTitle>

              <CardDescription>
                Update the details of{' '}
                {editingProduct.name}.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleUpdateProduct}
              >
                <div className="row g-3">
                  <div className="col-md-6">
                    <Label htmlFor="edit-name">
                      Product Name
                    </Label>

                    <Input
                      id="edit-name"
                      value={form.name}
                      onChange={(e) =>
                        updateForm(
                          'name',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="edit-price">
                      Price
                    </Label>

                    <Input
                      id="edit-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        updateForm(
                          'price',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="col-12">
                    <Label htmlFor="edit-description">
                      Description
                    </Label>

                    <Input
                      id="edit-description"
                      value={form.description}
                      onChange={(e) =>
                        updateForm(
                          'description',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="edit-category">
                      Category
                    </Label>

                    <Input
                      id="edit-category"
                      value={form.category}
                      onChange={(e) =>
                        updateForm(
                          'category',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="edit-stock">
                      Stock
                    </Label>

                    <Input
                      id="edit-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(e) =>
                        updateForm(
                          'stock',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="col-12">
                    <Label htmlFor="edit-image">
                      Image URL
                    </Label>

                    <Input
                      id="edit-image"
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) =>
                        updateForm(
                          'imageUrl',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background:
                          'linear-gradient(to right, #6f42c1, #d63384)',
                        border: 'none',
                        color: 'white',
                      }}
                    >
                      {submitting
                        ? 'Updating...'
                        : 'Update Product'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="h4 fw-bold mb-1">
              Your Products
            </h2>

            <p className="text-secondary small mb-0">
              {totalProducts === 0
                ? 'You have not added any products yet.'
                : `${totalProducts} product${
                    totalProducts === 1
                      ? ''
                      : 's'
                  }`}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-5 text-center">
              <Package
                className="mx-auto mb-3 text-secondary"
                style={{
                  width: 48,
                  height: 48,
                }}
              />

              <h3 className="h5 fw-bold">
                No products yet
              </h3>

              <p className="text-secondary mb-4">
                Start building your storefront by
                adding your first product.
              </p>

              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setForm(emptyForm)
                  setShowAddProduct(true)
                }}
                style={{
                  background:
                    'linear-gradient(to right, #6f42c1, #d63384)',
                  border: 'none',
                  color: 'white',
                }}
              >
                <Plus
                  style={{
                    width: 16,
                    height: 16,
                    marginRight: 6,
                  }}
                />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="d-flex flex-column gap-3">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="row g-0">
                    <div className="col-auto">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            width: 140,
                            height: 140,
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center bg-light"
                          style={{
                            width: 140,
                            height: 140,
                          }}
                        >
                          <Package
                            className="text-secondary"
                            style={{
                              width: 36,
                              height: 36,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="col">
                      <div className="p-3">
                        <div className="d-flex align-items-start justify-content-between gap-3">
                          <div>
                            <h3 className="h5 fw-semibold mb-1">
                              {product.name}
                            </h3>

                            <p className="text-secondary small mb-1">
                              {product.category}
                            </p>

                            <p className="fw-bold mb-2">
                              KSh{' '}
                              {Number(
                                product.price
                              ).toLocaleString()}
                            </p>
                          </div>

                          <div className="d-flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleEditProduct(
                                  product
                                )
                              }
                              aria-label={`Edit ${product.name}`}
                            >
                              <Edit
                                style={{
                                  width: 16,
                                  height: 16,
                                }}
                              />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-danger"
                              onClick={() =>
                                handleDeleteProduct(
                                  product.id
                                )
                              }
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2
                                style={{
                                  width: 16,
                                  height: 16,
                                }}
                              />
                            </Button>
                          </div>
                        </div>

                        <p className="small text-secondary mb-3">
                          {product.description}
                        </p>

                        <div className="d-flex flex-wrap gap-2">
                          <span
                            className={`badge ${
                              product.stock === 0
                                ? 'text-bg-danger'
                                : product.stock <= 5
                                  ? 'text-bg-warning'
                                  : 'text-bg-success'
                            }`}
                          >
                            {product.stock === 0
                              ? 'Out of stock'
                              : `${product.stock} in stock`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}