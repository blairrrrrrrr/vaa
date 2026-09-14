import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import SignIn from './pages/Auth/SignIn'
import SignUp from './pages/Auth/SignUp'
import BrandSignUp from './pages/Auth/BrandSignUp'
import AdminLogin from './pages/Auth/AdminLogin'
import Shop from './pages/Shop'
import BrandDashboard from './pages/Brand/Dashboard'
import AdminDashboard from './pages/Admin/Dashboard'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/brand-signup" element={<BrandSignUp />} />
            <Route path="/auth/admin-login" element={<AdminLogin />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/brand/dashboard" element={<BrandDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
