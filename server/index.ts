import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../src/lib/prisma'

const app = express()

const PORT = Number(process.env.PORT) || 3001
const JWT_SECRET = process.env.JWT_SECRET
const CLIENT_URL =
  process.env.CLIENT_URL || 'http://localhost:5173'

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is required. Add it to your server .env file.'
  )
}

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
)

app.use(express.json())

type UserRole =
  | 'CUSTOMER'
  | 'BRAND'
  | 'ADMIN'

interface AuthUser {
  userId: string
  role: UserRole
}

const generateToken = (
  userId: string,
  role: UserRole
) => {
  return jwt.sign(
    {
      userId,
      role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  )
}

const verifyToken = (
  token: string
): AuthUser | null => {
  try {
    return jwt.verify(
      token,
      JWT_SECRET
    ) as AuthUser
  } catch {
    return null
  }
}

const authenticate = (
  req: any,
  res: any,
  next: any
) => {
  const authHeader =
    req.headers.authorization

  if (
    !authHeader ||
    !authHeader.startsWith('Bearer ')
  ) {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }

  const token =
    authHeader.substring(7)

  const decoded =
    verifyToken(token)

  if (!decoded) {
    return res.status(401).json({
      error: 'Invalid or expired token',
    })
  }

  req.user = decoded

  next()
}

const requireRole = (
  ...roles: UserRole[]
) => {
  return (
    req: any,
    res: any,
    next: any
  ) => {
    if (
      !roles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        error: 'Forbidden',
      })
    }

    next()
  }
}


/* =========================
   HEALTH
========================= */

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'VAA API is running',
  })
})


/* =========================
   CUSTOMER SIGN UP
========================= */

app.post(
  '/api/auth/signup',
  async (req, res) => {
    try {
      const {
        email,
        password,
        name,
      } = req.body

      if (!email || !password) {
        return res.status(400).json({
          error:
            'Email and password are required',
        })
      }

      if (
        typeof password !== 'string' ||
        password.length < 6
      ) {
        return res.status(400).json({
          error:
            'Password must be at least 6 characters',
        })
      }

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase()

      const existingUser =
        await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        })

      if (existingUser) {
        return res.status(400).json({
          error:
            'Email already exists',
        })
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        )

      const user =
        await prisma.user.create({
          data: {
            email:
              normalizedEmail,
            password:
              hashedPassword,
            name:
              name
                ? String(name).trim()
                : null,
            role: 'CUSTOMER',
          },
        })

      const token =
        generateToken(
          user.id,
          user.role
        )

      return res.status(201).json({
        token,

        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    } catch (error) {
      console.error(
        'Customer signup error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   BRAND SIGN UP
========================= */

app.post(
  '/api/auth/brand-signup',
  async (req, res) => {
    try {
      const {
        email,
        password,
        name,
        brandName,
        category,
      } = req.body

      if (
        !email ||
        !password ||
        !brandName
      ) {
        return res.status(400).json({
          error:
            'Email, password and brand name are required',
        })
      }

      if (
        typeof password !== 'string' ||
        password.length < 6
      ) {
        return res.status(400).json({
          error:
            'Password must be at least 6 characters',
        })
      }

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase()

      const existingUser =
        await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        })

      if (existingUser) {
        return res.status(400).json({
          error:
            'Email already exists',
        })
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        )

      const user =
        await prisma.user.create({
          data: {
            email:
              normalizedEmail,
            password:
              hashedPassword,
            name:
              name
                ? String(name).trim()
                : null,
            role: 'BRAND',

            brand: {
              create: {
                name:
                  String(
                    brandName
                  ).trim(),

                category:
                  category
                    ? String(
                      category
                    ).trim()
                    : null,

                status: 'pending',
              },
            },
          },

          include: {
            brand: true,
          },
        })

      const token =
        generateToken(
          user.id,
          user.role
        )

      return res.status(201).json({
        token,

        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },

        brand: user.brand,
      })
    } catch (error) {
      console.error(
        'Brand signup error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   SIGN IN
========================= */

app.post(
  '/api/auth/signin',
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body

      if (!email || !password) {
        return res.status(400).json({
          error:
            'Email and password are required',
        })
      }

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase()

      const user =
        await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        })

      if (!user) {
        return res.status(401).json({
          error:
            'Invalid credentials',
        })
      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        )

      if (!validPassword) {
        return res.status(401).json({
          error:
            'Invalid credentials',
        })
      }

      const token =
        generateToken(
          user.id,
          user.role
        )

      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }

      if (user.role === 'BRAND') {
        const brand =
          await prisma.brand.findUnique({
            where: {
              userId: user.id,
            },
          })

        return res.json({
          token,
          user: userData,
          brand,
        })
      }

      return res.json({
        token,
        user: userData,
      })
    } catch (error) {
      console.error(
        'Signin error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   ADMIN SIGN IN
========================= */

app.post(
  '/api/auth/admin-signin',
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body

      if (!email || !password) {
        return res.status(400).json({
          error:
            'Email and password are required',
        })
      }

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase()

      const user =
        await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        })

      if (
        !user ||
        user.role !== 'ADMIN'
      ) {
        return res.status(401).json({
          error:
            'Invalid admin credentials',
        })
      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        )

      if (!validPassword) {
        return res.status(401).json({
          error:
            'Invalid credentials',
        })
      }

      const token =
        generateToken(
          user.id,
          user.role
        )

      return res.json({
        token,

        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    } catch (error) {
      console.error(
        'Admin signin error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   CURRENT USER
========================= */

app.get(
  '/api/auth/me',
  authenticate,
  async (req: any, res) => {
    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id: req.user.userId,
          },

          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        })

      if (!user) {
        return res.status(404).json({
          error:
            'User not found',
        })
      }

      return res.json(user)
    } catch (error) {
      console.error(
        'Get current user error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   LOGGED-IN BRAND
========================= */

app.get(
  '/api/brand/me',
  authenticate,
  requireRole('BRAND'),
  async (req: any, res) => {
    try {
      const brand =
        await prisma.brand.findUnique({
          where: {
            userId:
              req.user.userId,
          },

          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            status: true,
            userId: true,
            createdAt: true,
            updatedAt: true,

            products: {
              orderBy: {
                createdAt:
                  'desc',
              },

              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                imageUrl: true,
                category: true,
                brandId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        })

      if (!brand) {
        return res.status(404).json({
          error:
            'Brand not found',
        })
      }

      return res.json(brand)
    } catch (error) {
      console.error(
        'GET /api/brand/me error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   ALL PUBLIC PRODUCTS
========================= */

app.get(
  '/api/products',
  async (_req, res) => {
    try {
      const products =
        await prisma.product.findMany({
          where: {
            brand: {
              status: 'approved',
            },
          },

          include: {
            brand: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                status: true,
              },
            },
          },

          orderBy: {
            createdAt:
              'desc',
          },
        })

      return res.json(products)
    } catch (error) {
      console.error(
        'Get products error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   BRAND STOREFRONT
   IMPORTANT:
   THIS MUST COME BEFORE
   /api/products/:productId
========================= */

app.get(
  '/api/products/brand/:brandId',
  async (req, res) => {
    try {
      const brand =
        await prisma.brand.findUnique({
          where: {
            id:
              req.params.brandId,
          },

          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            status: true,
            createdAt: true,

            products: {
              orderBy: {
                createdAt:
                  'desc',
              },

              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                imageUrl: true,
                category: true,
                brandId: true,
                createdAt: true,
                updatedAt: true,
              },
            },

            _count: {
              select: {
                followers: true,
              },
            },
          },
        })

      if (
        !brand ||
        brand.status !== 'approved'
      ) {
        return res.status(404).json({
          error:
            'Brand not found',
        })
      }

      return res.json({
        id: brand.id,
        name: brand.name,
        description:
          brand.description,
        category:
          brand.category,
        status:
          brand.status,
        createdAt:
          brand.createdAt,

        followersCount:
          brand._count.followers,

        products:
          brand.products,
      })
    } catch (error) {
      console.error(
        'Get brand storefront error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   SINGLE PRODUCT
========================= */

app.get(
  '/api/products/:productId',
  async (req, res) => {
    try {
      const product =
        await prisma.product.findFirst({
          where: {
            id:
              req.params.productId,

            brand: {
              status: 'approved',
            },
          },

          include: {
            brand: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                status: true,
              },
            },
          },
        })

      if (!product) {
        return res.status(404).json({
          error:
            'Product not found',
        })
      }

      return res.json(product)
    } catch (error) {
      console.error(
        'Get product error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   CREATE PRODUCT
========================= */

app.post(
  '/api/products',
  authenticate,
  requireRole('BRAND'),
  async (req: any, res) => {
    try {
      const {
        name,
        description,
        price,
        stock,
        imageUrl,
        category,
      } = req.body

      if (
        !name ||
        !description ||
        price === undefined ||
        !category
      ) {
        return res.status(400).json({
          error:
            'Name, description, price and category are required',
        })
      }

      const numericPrice =
        Number(price)

      const numericStock =
        Number(stock ?? 0)

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          error:
            'Invalid price',
        })
      }

      if (
        !Number.isInteger(
          numericStock
        ) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          error:
            'Invalid stock',
        })
      }

      const brand =
        await prisma.brand.findUnique({
          where: {
            userId:
              req.user.userId,
          },
        })

      if (!brand) {
        return res.status(404).json({
          error:
            'Brand not found',
        })
      }

      const product =
        await prisma.product.create({
          data: {
            name:
              String(name).trim(),

            description:
              String(
                description
              ).trim(),

            price:
              numericPrice,

            stock:
              numericStock,

            imageUrl:
              imageUrl
                ? String(
                  imageUrl
                ).trim()
                : null,

            category:
              String(
                category
              ).trim(),

            brandId:
              brand.id,
          },
        })

      return res.status(201).json(
        product
      )
    } catch (error) {
      console.error(
        'Create product error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   UPDATE PRODUCT
========================= */

app.patch(
  '/api/products/:productId',
  authenticate,
  requireRole('BRAND'),
  async (req: any, res) => {
    try {
      const brand =
        await prisma.brand.findUnique({
          where: {
            userId:
              req.user.userId,
          },
        })

      if (!brand) {
        return res.status(404).json({
          error:
            'Brand not found',
        })
      }

      const product =
        await prisma.product.findFirst({
          where: {
            id:
              req.params.productId,

            brandId:
              brand.id,
          },
        })

      if (!product) {
        return res.status(404).json({
          error:
            'Product not found',
        })
      }

      const {
        name,
        description,
        price,
        stock,
        imageUrl,
        category,
      } = req.body

      const data: any = {}

      if (name !== undefined) {
        if (
          !String(name).trim()
        ) {
          return res.status(400).json({
            error:
              'Product name cannot be empty',
          })
        }

        data.name =
          String(name).trim()
      }

      if (
        description !==
        undefined
      ) {
        if (
          !String(
            description
          ).trim()
        ) {
          return res.status(400).json({
            error:
              'Description cannot be empty',
          })
        }

        data.description =
          String(
            description
          ).trim()
      }

      if (price !== undefined) {
        const numericPrice =
          Number(price)

        if (
          !Number.isFinite(
            numericPrice
          ) ||
          numericPrice < 0
        ) {
          return res.status(400).json({
            error:
              'Invalid price',
          })
        }

        data.price =
          numericPrice
      }

      if (stock !== undefined) {
        const numericStock =
          Number(stock)

        if (
          !Number.isInteger(
            numericStock
          ) ||
          numericStock < 0
        ) {
          return res.status(400).json({
            error:
              'Invalid stock',
          })
        }

        data.stock =
          numericStock
      }

      if (
        imageUrl !==
        undefined
      ) {
        data.imageUrl =
          imageUrl
            ? String(
              imageUrl
            ).trim()
            : null
      }

      if (
        category !==
        undefined
      ) {
        if (
          !String(
            category
          ).trim()
        ) {
          return res.status(400).json({
            error:
              'Category cannot be empty',
          })
        }

        data.category =
          String(
            category
          ).trim()
      }

      const updatedProduct =
        await prisma.product.update({
          where: {
            id:
              product.id,
          },

          data,
        })

      return res.json(
        updatedProduct
      )
    } catch (error) {
      console.error(
        'Update product error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   DELETE PRODUCT
========================= */

app.delete(
  '/api/products/:productId',
  authenticate,
  requireRole('BRAND'),
  async (req: any, res) => {
    try {
      const brand =
        await prisma.brand.findUnique({
          where: {
            userId:
              req.user.userId,
          },
        })

      if (!brand) {
        return res.status(404).json({
          error:
            'Brand not found',
        })
      }

      const product =
        await prisma.product.findFirst({
          where: {
            id:
              req.params.productId,

            brandId:
              brand.id,
          },
        })

      if (!product) {
        return res.status(404).json({
          error:
            'Product not found',
        })
      }

      await prisma.product.delete({
        where: {
          id:
            product.id,
        },
      })

      return res.json({
        success: true,
        message:
          'Product deleted successfully',
      })
    } catch (error) {
      console.error(
        'Delete product error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   PUBLIC BRANDS
========================= */

app.get(
  '/api/brands/public',
  async (_req, res) => {
    try {
      const brands =
        await prisma.brand.findMany({
          where: {
            status: 'approved',
          },

          select: {
            id: true,
            name: true,
            description: true,
            category: true,
          },

          orderBy: {
            createdAt:
              'desc',
          },
        })

      return res.json(brands)
    } catch (error) {
      console.error(
        'Get public brands error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   FOLLOW BRAND
========================= */

app.get(
  '/api/brands/:brandId/follow',
  authenticate,
  requireRole('CUSTOMER'),
  async (req: any, res) => {
    try {
      const follow =
        await prisma.brandFollow.findUnique({
          where: {
            userId_brandId: {
              userId:
                req.user.userId,

              brandId:
                req.params.brandId,
            },
          },
        })

      return res.json({
        following:
          !!follow,
      })
    } catch (error) {
      console.error(
        'Check follow error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   FOLLOW BRAND
========================= */

app.post(
  '/api/brands/:brandId/follow',
  authenticate,
  requireRole('CUSTOMER'),
  async (req: any, res) => {
    try {
      const brand =
        await prisma.brand.findUnique({
          where: {
            id:
              req.params.brandId,
          },
        })

      if (
        !brand ||
        brand.status !== 'approved'
      ) {
        return res.status(404).json({
          error:
            'Brand not found',
        })
      }

      await prisma.brandFollow.upsert({
        where: {
          userId_brandId: {
            userId:
              req.user.userId,

            brandId:
              req.params.brandId,
          },
        },

        update: {},

        create: {
          userId:
            req.user.userId,

          brandId:
            req.params.brandId,
        },
      })

      return res.json({
        following: true,
      })
    } catch (error) {
      console.error(
        'Follow brand error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   UNFOLLOW BRAND
========================= */

app.delete(
  '/api/brands/:brandId/follow',
  authenticate,
  requireRole('CUSTOMER'),
  async (req: any, res) => {
    try {
      await prisma.brandFollow.deleteMany({
        where: {
          userId:
            req.user.userId,

          brandId:
            req.params.brandId,
        },
      })

      return res.json({
        following: false,
      })
    } catch (error) {
      console.error(
        'Unfollow brand error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   ALL BRANDS - ADMIN
========================= */

app.get(
  '/api/brands',
  authenticate,
  requireRole('ADMIN'),
  async (_req, res) => {
    try {
      const brands =
        await prisma.brand.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },

            products: true,
          },

          orderBy: {
            createdAt:
              'desc',
          },
        })

      return res.json(brands)
    } catch (error) {
      console.error(
        'Get brands error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   UPDATE BRAND STATUS
========================= */

app.patch(
  '/api/brands/:brandId/status',
  authenticate,
  requireRole('ADMIN'),
  async (req, res) => {
    try {
      const {
        status,
      } = req.body

      const allowedStatuses = [
        'pending',
        'approved',
        'rejected',
      ]

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          error:
            'Invalid status. Use pending, approved or rejected.',
        })
      }

      const existingBrand =
        await prisma.brand.findUnique({
          where: {
            id:
              req.params.brandId,
          },
        })

      if (!existingBrand) {
        return res.status(404).json({
          error:
            'Brand not found',
        })
      }

      const brand =
        await prisma.brand.update({
          where: {
            id:
              req.params.brandId,
          },

          data: {
            status,
          },
        })

      return res.json(brand)
    } catch (error) {
      console.error(
        'Update brand status error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal server error',
      })
    }
  }
)


/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  () => {
    console.log(
      `VAA API running on port ${PORT}`
    )
  }
)