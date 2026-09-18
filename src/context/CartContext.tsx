import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string | null
  category: string
  brandId: string
  brandName: string
  stock: number
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'vaa_cart'

export function CartProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)

      if (!savedCart) {
        return []
      }

      const parsed = JSON.parse(savedCart)

      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(items)
    )
  }, [items])

  const addToCart = (
    item: Omit<CartItem, 'quantity'>,
    quantity = 1
  ) => {
    if (item.stock <= 0) {
      return
    }

    setItems(currentItems => {
      const existingItem = currentItems.find(
        cartItem => cartItem.id === item.id
      )

      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          item.stock
        )

        return currentItems.map(cartItem =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: newQuantity,
              }
            : cartItem
        )
      }

      return [
        ...currentItems,
        {
          ...item,
          quantity: Math.min(quantity, item.stock),
        },
      ]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems(currentItems =>
      currentItems.filter(item => item.id !== productId)
    )
  }

  const updateQuantity = (
    productId: string,
    quantity: number
  ) => {
    setItems(currentItems =>
      currentItems.map(item => {
        if (item.id !== productId) {
          return item
        }

        const safeQuantity = Math.max(
          1,
          Math.min(quantity, item.stock)
        )

        return {
          ...item,
          quantity: safeQuantity,
        }
      })
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.id === productId)
  }

  const itemCount = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.quantity,
      0
    )
  }, [items])

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    )
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error(
      'useCart must be used within CartProvider'
    )
  }

  return context
}