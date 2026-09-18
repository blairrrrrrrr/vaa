import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Store,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import Navbar from '../../components/Navbar'
import { Button } from '../../components/ui/button'
import { useCart } from '../../context/CartContext'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string | null
  category: string
  brandId: string
  brand?: {
    id: string
    name: string
    description?: string | null
    category?: string | null
    status?: string
  }
}

export default function ProductDetails() {
  const { productId } = useParams()
  const { addToCart, isInCart } = useCart()

  const [product, setProduct] =
    useState<Product | null>(null)

  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!productId) {
      setError('Product not found')
      setLoading(false)
      return
    }

    const loadProduct = async () => {
      try {
        setLoading(true)

        const response = await fetch(
          `${API_URL}/api/products/${productId}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || 'Failed to load product'
          )
        }

        setProduct(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load product'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const handleQuantityChange = (
    change: number
  ) => {
    if (!product) {
      return
    }

    setQuantity(currentQuantity =>
      Math.max(
        1,
        Math.min(
          product.stock,
          currentQuantity + change
        )
      )
    )
  }

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) {
      return
    }

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        brandId: product.brandId,
        brandName:
          product.brand?.name || 'Unknown Brand',
        stock: product.stock,
      },
      quantity
    )
  }

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />

        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">
              Loading...
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />

        <div className="container py-5">
          <div className="text-center py-5">
            <h1 className="h3 fw-bold mb-2">
              Product unavailable
            </h1>

            <p className="text-secondary mb-4">
              {error || 'Product not found.'}
            </p>

            <Link to="/shop">
              <Button>
                <ArrowLeft size={16} />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <main className="container py-5">
        <Link
          to={`/brand/${product.brandId}`}
          className="text-decoration-none text-secondary d-inline-flex align-items-center gap-2 mb-4"
        >
          <ArrowLeft size={17} />
          Back to {product.brand?.name || 'Brand'}
        </Link>

        <div className="row g-5">
          {/* Product Image */}
          <div className="col-lg-7">
            <div
              className="bg-white rounded-4 overflow-hidden"
              style={{
                minHeight: '550px',
              }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-100 h-100 object-cover"
                  style={{
                    minHeight: '550px',
                    maxHeight: '750px',
                  }}
                />
              ) : (
                <div
                  className="w-100 d-flex align-items-center justify-content-center text-secondary"
                  style={{
                    minHeight: '550px',
                  }}
                >
                  <Store size={80} />
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="col-lg-5">
            <div className="sticky-lg-top" style={{ top: '30px' }}>
              <Link
                to={`/brand/${product.brandId}`}
                className="text-decoration-none text-primary fw-semibold small"
              >
                {product.brand?.name ||
                  'Unknown Brand'}
              </Link>

              <h1 className="display-5 fw-bold mt-2 mb-3">
                {product.name}
              </h1>

              <div className="mb-4">
                <span className="display-6 fw-bold">
                  Ksh {product.price.toLocaleString()}
                </span>
              </div>

              <div className="mb-4">
                <span className="badge bg-light text-dark border">
                  {product.category}
                </span>
              </div>

              <p
                className="text-secondary"
                style={{
                  whiteSpace: 'pre-line',
                  lineHeight: 1.8,
                }}
              >
                {product.description}
              </p>

              <hr className="my-4" />

              {/* Stock */}
              <div className="mb-4">
                {product.stock <= 0 ? (
                  <span className="text-danger fw-semibold">
                    Out of stock
                  </span>
                ) : product.stock < 10 ? (
                  <span className="text-warning fw-semibold">
                    Only {product.stock} left in stock
                  </span>
                ) : (
                  <span className="text-success fw-semibold">
                    In stock
                  </span>
                )}
              </div>

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Quantity
                  </label>

                  <div
                    className="d-flex align-items-center border rounded-3 bg-white"
                    style={{ width: '150px' }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleQuantityChange(-1)
                      }
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </Button>

                    <span className="flex-grow-1 text-center fw-semibold">
                      {quantity}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleQuantityChange(1)
                      }
                      disabled={
                        quantity >= product.stock
                      }
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <Button
                className="w-100 gap-2 mb-3"
                size="lg"
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                style={{
                  background:
                    isInCart(product.id)
                      ? '#198754'
                      : 'linear-gradient(to right, #db8727, #ef6f0f)',
                  border: 'none',
                  color: 'white',
                }}
              >
                <ShoppingCart size={19} />

                {product.stock <= 0
                  ? 'Out of Stock'
                  : isInCart(product.id)
                    ? 'Add More to Cart'
                    : 'Add to Cart'}
              </Button>

              {isInCart(product.id) && (
                <Link to="/cart">
                  <Button
                    variant="outline"
                    className="w-100"
                  >
                    View Cart
                  </Button>
                </Link>
              )}

              {/* Brand */}
              <div className="mt-5 p-4 bg-white rounded-4">
                <p className="small text-secondary mb-1">
                  Sold by
                </p>

                <div className="d-flex align-items-center justify-content-between gap-3">
                  <div>
                    <h3 className="h5 fw-bold mb-1">
                      {product.brand?.name ||
                        'Unknown Brand'}
                    </h3>

                    {product.brand?.category && (
                      <p className="small text-secondary mb-0">
                        {product.brand.category}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/brand/${product.brandId}`}
                  >
                    <Button variant="outline" size="sm">
                      Visit Store
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}