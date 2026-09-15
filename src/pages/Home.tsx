import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import Navbar from '../components/Navbar'
import { ShoppingBag, Store, Shield, Star, TrendingUp, Users, Zap, ArrowRight } from 'lucide-react'

export default function Home() {
  const featuredBrands = [
    { name: 'Elegant Style', category: 'Luxury', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300' },
    { name: 'Urban Fashion', category: 'Streetwear', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300' },
    { name: 'Minimalist Co', category: 'Minimal', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300' },
    { name: 'Vintage Vibes', category: 'Vintage', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300' }
  ]

  const testimonials = [
    { name: 'Sarah M.', role: 'Fashion Blogger', content: 'The best place to discover unique brands. I found my favorite dress here!', rating: 5 },
    { name: 'James K.', role: 'Brand Owner', content: 'Selling on this platform transformed my business. The tools are incredible.', rating: 5 },
    { name: 'Emily R.', role: 'Customer', content: 'Amazing selection and fast shipping. My go-to for fashion now.', rating: 5 }
  ]

  const stats = [
    { label: 'Active Brands', value: '500+', icon: Store },
    { label: 'Products Listed', value: '10K+', icon: ShoppingBag },
    { label: 'Happy Customers', value: '50K+', icon: Users },
    { label: 'Orders Daily', value: '1K+', icon: TrendingUp }
  ]

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="position-relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #fdf2f8, #faf5ff, #eff6ff)' }}>
        <div className="container py-5 py-md-32 position-relative">
          <div className="mx-auto text-center" style={{ maxWidth: '900px' }}>
            <h1 className="display-3 display-md-1 fw-bold mb-4 text-black">
              Discover Fashion
              <span className="d-block" style={{ background: 'linear-gradient(to right, #db8727, #ef6f0f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                That Defines You
              </span>
            </h1>
            <p className="fs-5 text-secondary mb-5 mx-auto" style={{ maxWidth: '600px' }}>
              Shop from curated independent brands countrywide. From luxury to streetwear, find your perfect style.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <Link to="/shop">
                <Button size="lg" className="gap-2" style={{ background: 'linear-gradient(to right, #db8727, #ef6f0f)', border: 'none', color: 'white', padding: '1rem 2rem' }}>
                  <ShoppingBag style={{ width: '20px', height: '20px' }} />
                  Start Shopping
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                </Button>
              </Link>
              <Link to="/auth/brand-signup">
                <Button size="lg" variant="outline" className="gap-2" style={{ padding: '1rem 2rem', borderWidth: '2px' }}>
                  <Store style={{ width: '20px', height: '20px' }} />
                  Become a Brand
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="row row-cols-2 row-cols-md-4 g-4">
            {stats.map((stat, index) => (
              <div key={index} className="col text-center">
                <stat.icon className="mx-auto mb-3" style={{ width: '32px', height: '32px', color: '#ef6f0f' }} />
                <div className="fs-3 fw-bold mb-1">{stat.value}</div>
                <div className="small text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="h2 fw-bold mb-3">Featured Brands</h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
              Discover trending fashion brands from around the world
            </p>
          </div>
          <div className="row row-cols-2 row-cols-md-4 g-4">
            {featuredBrands.map((brand, index) => (
              <Link key={index} to="/shop" className="text-decoration-none">
                <Card className="overflow-hidden border-0">
                  <div className="position-relative overflow-hidden" style={{ height: '192px' }}>
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-100 h-100 object-cover"
                    />
                    <div className="position-absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                    <div className="position-absolute bottom-0 start-0 p-3 text-white">
                      <h3 className="fw-semibold fs-5">{brand.name}</h3>
                      <p className="small opacity-90">{brand.category}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/shop">
              <Button variant="outline" size="lg" className="gap-2">
                View All Brands
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="h2 fw-bold mb-3">Why Choose FashionHub?</h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
              Everything you need to shop or sell fashion
            </p>
          </div>
          <div className="row row-cols-md-3 g-4">
            <div className="col">
              <Card className="border-2">
                <CardHeader>
                  <div className="rounded-3 d-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px', background: '#fce7f3' }}>
                    <ShoppingBag style={{ width: '28px', height: '28px', color: '#ef6f0f' }} />
                  </div>
                  <CardTitle className="fs-4">For Customers</CardTitle>
                  <CardDescription className="text-base">
                    Browse and shop from curated fashion brands worldwide. Find unique pieces that match your style.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/auth/signup">
                    <Button className="w-100 gap-2" variant="outline">
                      Sign Up as Customer
                      <ArrowRight style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="col">
              <Card className="border-2">
                <CardHeader>
                  <div className="rounded-3 d-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px', background: '#f3e8ff' }}>
                    <Store style={{ width: '28px', height: '28px', color: '#db8727' }} />
                  </div>
                  <CardTitle className="fs-4">For Brands</CardTitle>
                  <CardDescription className="text-base">
                    Showcase your products and reach millions of fashion enthusiasts. Powerful tools to grow your business.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/auth/brand-signup">
                    <Button className="w-100 gap-2" variant="outline">
                      Register Your Brand
                      <ArrowRight style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="col">
              <Card className="border-2">
                <CardHeader>
                  <div className="rounded-3 d-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px', background: '#dbeafe' }}>
                    <Shield style={{ width: '28px', height: '28px', color: '#db8727' }} />
                  </div>
                  <CardTitle className="fs-4">Admin Panel</CardTitle>
                  <CardDescription className="text-base">
                    Manage the platform, verify brands, and oversee operations. Complete control over your marketplace.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/auth/admin-login">
                    <Button className="w-100 gap-2" variant="outline">
                      Admin Access
                      <ArrowRight style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5" style={{ background: 'linear-gradient(to bottom right, #fdf2f8, #faf5ff)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="h2 fw-bold mb-3">What People Say</h2>
            <p className="text-secondary">Join thousands of happy customers and brands</p>
          </div>
          <div className="row row-cols-md-3 g-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="col">
                <Card className="border-0 shadow">
                  <CardContent className="p-4">
                    <div className="d-flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} style={{ width: '20px', height: '20px', fill: '#facc15', color: '#facc15' }} />
                      ))}
                    </div>
                    <p className="text-secondary mb-4">"{testimonial.content}"</p>
                    <div>
                      <div className="fw-semibold">{testimonial.name}</div>
                      <div className="small text-secondary">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 text-white" style={{ background: 'linear-gradient(to right, #db2777, #9333ea)' }}>
        <div className="container text-center">
          <h2 className="h2 fw-bold mb-3">Ready to Start?</h2>
          <p className="fs-5 mb-4 mx-auto" style={{ maxWidth: '600px', opacity: 0.9 }}>
            Join thousands of fashion lovers and brands on FashionHub today
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Link to="/auth/signup">
              <Button size="lg" variant="secondary" className="gap-2" style={{ padding: '1rem 2rem' }}>
                <ShoppingBag style={{ width: '20px', height: '20px' }} />
                Start Shopping
              </Button>
            </Link>
            <Link to="/auth/brand-signup">
              <Button size="lg" variant="outline" className="gap-2" style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                <Store style={{ width: '20px', height: '20px' }} />
                Sell Your Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row row-cols-md-4 g-4 mb-4">
            <div className="col">
              <h3 className="h4 fw-bold mb-3" style={{ background: 'linear-gradient(to right, #f472b6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                FashionHub
              </h3>
              <p className="text-secondary">Your destination for unique fashion from independent brands worldwide.</p>
            </div>
            <div className="col">
              <h4 className="fw-semibold mb-3">Shop</h4>
              <ul className="list-unstyled text-secondary">
                <li className="mb-2"><Link to="/shop" className="text-decoration-none text-secondary hover:text-white">All Products</Link></li>
                <li className="mb-2"><Link to="/shop" className="text-decoration-none text-secondary hover:text-white">New Arrivals</Link></li>
                <li><Link to="/shop" className="text-decoration-none text-secondary hover:text-white">Trending</Link></li>
              </ul>
            </div>
            <div className="col">
              <h4 className="fw-semibold mb-3">Sell</h4>
              <ul className="list-unstyled text-secondary">
                <li className="mb-2"><Link to="/auth/brand-signup" className="text-decoration-none text-secondary hover:text-white">Become a Seller</Link></li>
                <li className="mb-2"><Link to="/auth/brand-signup" className="text-decoration-none text-secondary hover:text-white">Seller Guidelines</Link></li>
                <li><Link to="/auth/brand-signup" className="text-decoration-none text-secondary hover:text-white">Success Stories</Link></li>
              </ul>
            </div>
            <div className="col">
              <h4 className="fw-semibold mb-3">Support</h4>
              <ul className="list-unstyled text-secondary">
                <li className="mb-2"><Link to="/auth/signin" className="text-decoration-none text-secondary hover:text-white">Help Center</Link></li>
                <li className="mb-2"><Link to="/auth/signin" className="text-decoration-none text-secondary hover:text-white">Contact Us</Link></li>
                <li><Link to="/auth/signin" className="text-decoration-none text-secondary hover:text-white">FAQs</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-top border-secondary pt-4 text-center text-secondary">
            <p>&copy; 2024 FashionHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
