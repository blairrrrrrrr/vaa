import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'

import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Shop from './pages/Shop'

import SignIn from './pages/Auth/SignIn'
import SignUp from './pages/Auth/SignUp'
import BrandSignUp from './pages/Auth/BrandSignUp'
import AdminLogin from './pages/Auth/AdminLogin'

import BrandDashboard from './pages/Brand/Dashboard'
import BrandStorefront from './pages/Brand/StoreFront'

import ProductDetails from './pages/Product/Details'
import Cart from './pages/Cart/Cart'

import AdminDashboard from './pages/Admin/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public */}
              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/auth/signin"
                element={<SignIn />}
              />

              <Route
                path="/auth/signup"
                element={<SignUp />}
              />

              <Route
                path="/auth/brand-signup"
                element={<BrandSignUp />}
              />

              <Route
                path="/auth/admin-login"
                element={<AdminLogin />}
              />

              {/* Customer */}
              <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
                <Route
                  path="/shop"
                  element={<Shop />}
                />

                <Route
                  path="/cart"
                  element={<Cart />}
                />
              </Route>

              {/* Public storefront */}
              <Route
                path="/brand/:brandId"
                element={<BrandStorefront />}
              />

              {/* Public product */}
              <Route
                path="/product/:productId"
                element={<ProductDetails />}
              />

              {/* Brand */}
              <Route element={<ProtectedRoute allowedRoles={['BRAND']} />}>
                <Route
                  path="/brand/dashboard"
                  element={<BrandDashboard />}
                />
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route
                  path="/admin/dashboard"
                  element={<AdminDashboard />}
                />
              </Route>

              {/* Fallback */}
              <Route
                path="*"
                element={<Home />}
              />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App