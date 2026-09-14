import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../src/lib/prisma'

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

app.use(cors())
app.use(express.json())

// Helper function to generate JWT token
const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' })
}

// Helper function to verify JWT token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch {
    return null
  }
}

// Middleware to authenticate requests
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  req.user = decoded
  next()
}

// Customer Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'CUSTOMER'
      }
    })

    const token = generateToken(user.id, user.role)
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Brand Sign Up
app.post('/api/auth/brand-signup', async (req, res) => {
  try {
    const { email, password, name, brandName, category } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'BRAND',
        brand: {
          create: {
            name: brandName,
            category,
            status: 'pending'
          }
        }
      },
      include: {
        brand: true
      }
    })

    const token = generateToken(user.id, user.role)
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      brand: user.brand
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Sign In
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user.id, user.role)
    const userData = { id: user.id, email: user.email, name: user.name, role: user.role }
    
    if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({ where: { userId: user.id } })
      res.json({ token, user: userData, brand })
    } else {
      res.json({ token, user: userData })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin Sign In
app.post('/api/auth/admin-signin', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Invalid admin credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user.id, user.role)
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get current user
app.get('/api/auth/me', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true }
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        brand: {
          include: {
            user: true
          }
        }
      }
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get products by brand
app.get('/api/products/brand/:brandId', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { brandId: req.params.brandId },
      include: {
        brand: true
      }
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create product (Brand only)
app.post('/api/products', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'BRAND') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const brand = await prisma.brand.findUnique({ where: { userId: req.user.userId } })
    if (!brand) {
      return res.status(400).json({ error: 'Brand not found' })
    }

    const product = await prisma.product.create({
      data: {
        ...req.body,
        brandId: brand.id
      }
    })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all brands (Admin)
app.get('/api/brands', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const brands = await prisma.brand.findMany({
      include: {
        user: true,
        products: true
      }
    })
    res.json(brands)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Approve/Reject brand (Admin)
app.patch('/api/brands/:brandId/status', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { status } = req.body
    const brand = await prisma.brand.update({
      where: { id: req.params.brandId },
      data: { status }
    })
    res.json(brand)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
