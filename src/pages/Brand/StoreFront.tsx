import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
} from 'lucide-react'

import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
} from '../../components/ui/card'

import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const API_URL = 'http://localhost:3001'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string | null
  category: string
  brandId: string
}

interface Brand {
  id: string
  name: string
  description: string | null
  category: string | null
  status: string
  followersCount: number
  products: Product[]
}

export default function Storefront() {
  const { brandId } = useParams()

  const { addToCart } = useCart()
  const { user } = useAuth()

  const [brand, setBrand] =
    useState<Brand | null>(null)

  const [following, setFollowing] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [followLoading, setFollowLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  /* =========================
     LOAD STOREFRONT
  ========================= */

  useEffect(() => {
    if (!brandId) {
      setError(
        'No brand ID was provided.'
      )
      setLoading(false)
      return
    }

    const loadStorefront =
      async () => {
        try {
          setLoading(true)
          setError('')

          const response =
            await fetch(
              `${API_URL}/api/products/brand/${brandId}`
            )

          const responseText =
            await response.text()

          let data: any

          try {
            data =
              JSON.parse(
                responseText
              )
          } catch {
            console.error(
              'Invalid API response:',
              responseText
            )

            throw new Error(
              'The API returned an invalid response.'
            )
          }

          if (!response.ok) {
            throw new Error(
              data.error ||
              'Failed to load storefront'
            )
          }

          setBrand(data)
        } catch (error: any) {
          console.error(
            'Storefront loading error:',
            error
          )

          setError(
            error.message ||
            'Failed to load storefront'
          )
        } finally {
          setLoading(false)
        }
      }

    loadStorefront()
  }, [brandId])


  /* =========================
     CHECK FOLLOW STATUS
  ========================= */

  useEffect(() => {
    if (
      !brandId ||
      !user ||
      user.role !== 'CUSTOMER'
    ) {
      return
    }

    const checkFollowStatus =
      async () => {
        try {
          const token =
            localStorage.getItem(
              'token'
            )

          if (!token) {
            return
          }

          const response =
            await fetch(
              `${API_URL}/api/brands/${brandId}/follow`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            )

          if (!response.ok) {
            return
          }

          const data =
            await response.json()

          setFollowing(
            data.following
          )
        } catch (error) {
          console.error(
            'Follow status error:',
            error
          )
        }
      }

    checkFollowStatus()
  }, [brandId, user])


  /* =========================
     FOLLOW / UNFOLLOW
  ========================= */

  const handleFollow =
    async () => {
      if (!brandId) {
        return
      }

      if (!user) {
        alert(
          'Please sign in to follow brands.'
        )
        return
      }

      if (
        user.role !== 'CUSTOMER'
      ) {
        return
      }

      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        alert(
          'Please sign in to follow brands.'
        )
        return
      }

      try {
        setFollowLoading(true)

        const response =
          await fetch(
            `${API_URL}/api/brands/${brandId}/follow`,
            {
              method:
                following
                  ? 'DELETE'
                  : 'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        const data =
          await response.json()

        if (!response.ok) {
          throw new Error(
            data.error ||
            'Failed to update follow status'
          )
        }

        const wasFollowing =
          following

        setFollowing(
          data.following
        )

        setBrand(
          (current) => {
            if (!current) {
              return current
            }

            return {
              ...current,

              followersCount:
                current.followersCount +
                (
                  wasFollowing
                    ? -1
                    : 1
                ),
            }
          }
        )
      } catch (error: any) {
        console.error(
          'Follow error:',
          error
        )

        alert(
          error.message ||
          'Something went wrong'
        )
      } finally {
        setFollowLoading(false)
      }
    }


  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">
          Loading storefront...
        </p>
      </div>
    )
  }


  /* =========================
     ERROR
  ========================= */

  if (
    error ||
    !brand
  ) {
    return (
      <div className="container py-5 text-center">
        <h2 className="mb-3">
          Storefront not found
        </h2>

        <p className="text-muted mb-4">
          {error ||
            'This brand does not exist.'}
        </p>

        <Button asChild>
          <Link to="/shop">
            Back to Shop
          </Link>
        </Button>
      </div>
    )
  }


  /* =========================
     STOREFRONT
  ========================= */

  return (
    <div className="container py-5">

      {/* BRAND HEADER */}

      <div className="mb-5">

        <div className="d-flex justify-content-between align-items-start gap-4 flex-wrap">

          <div>

            <p className="text-muted mb-2">
              {brand.category ||
                'Fashion Brand'}
            </p>

            <h1 className="display-5 fw-bold mb-2">
              {brand.name}
            </h1>

            {brand.description && (
              <p
                className="text-muted mb-3"
                style={{
                  maxWidth:
                    '650px',
                }}
              >
                {brand.description}
              </p>
            )}

            <p className="text-muted mb-0">
              {brand.followersCount}{' '}
              {brand.followersCount ===
              1
                ? 'follower'
                : 'followers'}
            </p>

          </div>


          {user?.role ===
            'CUSTOMER' && (
            <Button
              onClick={
                handleFollow
              }
              disabled={
                followLoading
              }
              variant={
                following
                  ? 'secondary'
                  : 'default'
              }
            >
              <Heart
                size={18}
                className="me-2"
                fill={
                  following
                    ? 'currentColor'
                    : 'none'
                }
              />

              {followLoading
                ? 'Loading...'
                : following
                  ? 'Following'
                  : 'Follow'}
            </Button>
          )}

        </div>

      </div>


      {/* PRODUCTS HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="h4 mb-0">
          Products
        </h2>

        <span className="text-muted">
          {brand.products.length}{' '}
          {brand.products.length ===
          1
            ? 'item'
            : 'items'}
        </span>

      </div>


      {/* NO PRODUCTS */}

      {brand.products.length ===
      0 ? (
        <div className="text-center py-5 border rounded">

          <ShoppingBag
            size={42}
            className="mb-3"
          />

          <h3 className="h5">
            No products yet
          </h3>

          <p className="text-muted mb-0">
            This brand hasn't added
            any products yet.
          </p>

        </div>
      ) : (

        /* PRODUCTS */

        <div className="row g-4">

          {brand.products.map(
            (product) => (
              <div
                key={
                  product.id
                }
                className="col-12 col-sm-6 col-lg-4 col-xl-3"
              >

                <Card className="h-100 overflow-hidden">

                  {/* IMAGE */}

                  <Link
                    to={`/product/${product.id}`}
                    className="text-decoration-none"
                  >
                    <div
                      style={{
                        aspectRatio:
                          '1 / 1',
                        background:
                          '#f5f5f5',
                      }}
                    >

                      {product.imageUrl ? (
                        <img
                          src={
                            product.imageUrl
                          }
                          alt={
                            product.name
                          }
                          className="w-100 h-100"
                          style={{
                            objectFit:
                              'cover',
                          }}
                        />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                          No image
                        </div>
                      )}

                    </div>
                  </Link>


                  <CardContent className="p-3">

                    <Link
                      to={`/product/${product.id}`}
                      className="text-decoration-none text-dark"
                    >
                      <h3 className="h6 mb-1">
                        {
                          product.name
                        }
                      </h3>
                    </Link>


                    <p className="fw-bold mb-2">
                      KSh{' '}
                      {Number(
                        product.price
                      ).toLocaleString()}
                    </p>


                    <p className="text-muted small mb-3">
                      {product.stock >
                      0
                        ? `${product.stock} in stock`
                        : 'Out of stock'}
                    </p>


                    <Button
                      className="w-100"
                      disabled={
                        product.stock <=
                        0
                      }
                      onClick={() =>
                        addToCart({
                          id:
                            product.id,

                          name:
                            product.name,

                          price:
                            Number(
                              product.price
                            ),

                          imageUrl:
                            product.imageUrl,

                          category:
                            product.category,

                          brandId:
                            product.brandId,

                          brandName:
                            brand.name,

                          stock:
                            product.stock,
                        })
                      }
                    >
                      <ShoppingBag
                        size={17}
                        className="me-2"
                      />

                      {product.stock >
                      0
                        ? 'Add to Cart'
                        : 'Out of Stock'}
                    </Button>

                  </CardContent>

                </Card>

              </div>
            )
          )}

        </div>
      )}

    </div>
  )
}