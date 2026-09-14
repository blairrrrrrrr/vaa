export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  brandId: string
  brandName: string
  category: string
  stock: number
  createdAt: Date
}

export interface Brand {
  id: string
  name: string
  description: string
  logoUrl: string
  userId: string
  verified: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export type UserRole = 'customer' | 'brand' | 'admin'
