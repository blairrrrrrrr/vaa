import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Shop from './pages/Shop'

import SignIn from './pages/Auth/SignIn'
import SignUp from './pages/Auth/SignUp'
import BrandSignUp from './pages/Auth/BrandSignUp'
import AdminLogin from './pages/Auth/AdminLogin'

import BrandDashboard from './pages/Brand/Dashboard'
import AdminDashboard from './pages/Admin/Dashboard'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />

            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/brand-signup" element={<BrandSignUp />} />
            <Route path="/auth/admin-login" element={<AdminLogin />} />

            {/* Customer */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/shop" element={<Shop />} />
            </Route>

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
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}