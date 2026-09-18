import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import Navbar from '../components/Navbar'
import { Search, ShoppingCart, Heart, SlidersHorizontal, ArrowUpDown, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:3001'

export default function Shop() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const { addToCart, isInCart } = useCart()

  const categories = ['All', 'Dresses', 'Outerwear', 'Pants', 'Accessories', 'Shoes']

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ]

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory

    let matchesPrice = true
    if (priceRange === 'under-50') matchesPrice = product.price < 50
    else if (priceRange === '50-100') matchesPrice = product.price >= 50 && product.price < 100
    else if (priceRange === '100-200') matchesPrice = product.price >= 100 && product.price < 200
    else if (priceRange === '200+') matchesPrice = product.price >= 200

    return matchesSearch && matchesCategory && matchesPrice
  })

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId)
    } else {
      newFavorites.add(productId)
    }
    setFavorites(newFavorites)
  }

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <p className="text-secondary">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      {/* Hero Section */}
      <section className="text-white py-4" style={{ background: 'linear-gradient(to right, #db8727, #ef6f0f)' }}>
        <div className="container text-center">
          <h1 className="h2 h-md-1 fw-bold mb-3">Shop the Collection</h1>
          <p className="fs-5 mx-auto" style={{ maxWidth: '600px', opacity: 0.9 }}>
            Discover unique fashion pieces from independent brands worldwide
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="container py-4">
        <div className="bg-white rounded-3 shadow-sm p-4 mb-4">
          <div className="d-flex flex-column flex-lg-row gap-3">
            {/* Search */}
            <div className="position-relative flex-grow-1">
              <Search className="position-absolute top-50 start-3 translate-middle-y text-secondary" style={{ width: '20px', height: '20px' }} />
              <Input
                placeholder="Search products or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-5"
                style={{ height: '48px' }}
              />
            </div>

            {/* Category Filter */}
            <div className="d-flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  style={selectedCategory === category ? { background: 'linear-gradient(to right, #db8727, #ef6f0f)', border: 'none', color: 'white' } : {}}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="d-flex align-items-center gap-2">
              <ArrowUpDown style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
                style={{ height: '48px' }}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="d-flex align-items-center gap-2">
              <SlidersHorizontal style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="form-select"
                style={{ height: '48px' }}
              >
                <option value="all">All Prices</option>
                <option value="under-50">Under Ksh 500</option>
                <option value="50-100">Ksh 500 - Ksh 1000</option>
                <option value="100-200">Ksh 1000 - Ksh 2000</option>
                <option value="200+">Ksh 2000+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <p className="text-secondary">
            Showing <span className="fw-semibold">{filteredProducts.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="col">
              <Card className="overflow-hidden border-0">
                <div className="position-relative overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-100 object-cover"
                    style={{ height: '288px' }}
                  />
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="bg-white bg-opacity-90 px-3 py-1 rounded-pill small fw-medium">
                      {product.category}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`position-absolute top-0 end-0 m-2 bg-white bg-opacity-90 ${favorites.has(product.id) ? 'text-danger' : ''
                      }`}
                    style={{ width: '36px', height: '36px' }}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart style={{ width: '20px', height: '20px', fill: favorites.has(product.id) ? 'currentColor' : 'none' }} />
                  </Button>
                </div>
                <CardContent className="p-3">
                  <p className="small text-primary fw-medium mb-1">{product.brand?.name || 'Unknown Brand'}</p>
                  <Link
                    to={`/product/${product.id}`}
                    className="text-decoration-none text-dark"
                  >
                    <h3 className="fw-semibold fs-5 mb-2 text-truncate">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="small text-secondary mb-3 text-truncate" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                  {/* <div className="d-flex align-items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} style={{ width: '16px', height: '16px', fill: '#facc15', color: '#facc15' }} />
                    ))}
                    <span className="small text-secondary ms-2">(4.5)</span>
                  </div> */}
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="fs-4 fw-bold text-danger">Ksh {product.price}</p>
                    {product.stock < 10 && (
                      <span className="small text-warning fw-medium">
                        Only {product.stock} left
                      </span>
                    )}
                  </div>
                </CardContent>
                <div className="p-3 pt-0">
                  <Button
                    className="w-100 gap-2"
                    disabled={product.stock <= 0}
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        category: product.category,
                        brandId: product.brandId,
                        brandName:
                          product.brand?.name || 'Unknown Brand',
                        stock: product.stock,
                      })
                    }
                    style={{
                      background:
                        isInCart(product.id)
                          ? '#198754'
                          : 'linear-gradient(to right, #db8727, #ef6f0f)',
                      border: 'none',
                      color: 'white',
                    }}
                  >
                    <ShoppingCart
                      style={{
                        width: '16px',
                        height: '16px',
                      }}
                    />

                    {product.stock <= 0
                      ? 'Out of Stock'
                      : isInCart(product.id)
                        ? 'Added to Cart'
                        : 'Add to Cart'}
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-5">
            <div className="display-1 mb-3">🔍</div>
            <h3 className="h3 fw-semibold mb-2">No products found</h3>
            <p className="text-secondary mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
              setPriceRange('all')
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="text-white py-4" style={{ background: 'linear-gradient(to right, #db8727, #ef6f0f)' }}>
        <div className="container text-center">
          <h2 className="h3 fw-bold mb-3">Stay Updated</h2>
          <p className="mb-4 mx-auto" style={{ maxWidth: '500px', opacity: 0.9 }}>
            Subscribe to get notified about new arrivals, exclusive deals, and fashion tips
          </p>
          <div className="d-flex mx-auto gap-2" style={{ maxWidth: '400px' }}>
            <Input
              placeholder="Enter your email"
              className="bg-white bg-opacity-10 text-white"
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}
            />
            <Button variant="secondary" style={{ padding: '0 2rem' }}>Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
