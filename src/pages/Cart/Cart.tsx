import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'

import Navbar from '../../components/Navbar'
import { Button } from '../../components/ui/button'
import { useCart } from '../../context/CartContext'

export default function Cart() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />

        <main className="container py-5">
          <div className="text-center py-5">
            <div
              className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle bg-white"
              style={{
                width: '90px',
                height: '90px',
              }}
            >
              <ShoppingBag
                size={40}
                className="text-secondary"
              />
            </div>

            <h1 className="h2 fw-bold mb-2">
              Your cart is empty
            </h1>

            <p className="text-secondary mb-4">
              Looks like you haven't added anything
              to your cart yet.
            </p>

            <Link to="/shop">
              <Button
                style={{
                  background:
                    'linear-gradient(to right, #db8727, #ef6f0f)',
                  border: 'none',
                  color: 'white',
                }}
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <main className="container py-5">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-5">
          <div>
            <h1 className="display-6 fw-bold mb-1">
              Shopping Cart
            </h1>

            <p className="text-secondary mb-0">
              Review your items before checkout.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={clearCart}
            className="gap-2"
          >
            <Trash2 size={16} />
            Clear Cart
          </Button>
        </div>

        <div className="row g-4">
          {/* Cart Items */}
          <div className="col-lg-8">
            <div className="bg-white rounded-4 overflow-hidden">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 ${
                    index !== items.length - 1
                      ? 'border-bottom'
                      : ''
                  }`}
                >
                  <div className="row g-3 align-items-center">
                    {/* Image */}
                    <div className="col-4 col-sm-3 col-md-2">
                      <Link
                        to={`/product/${item.id}`}
                        className="text-decoration-none"
                      >
                        <div
                          className="rounded-3 overflow-hidden bg-light"
                          style={{
                            aspectRatio: '1 / 1',
                          }}
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-100 h-100 object-cover"
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary">
                              <ShoppingBag size={25} />
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>

                    {/* Details */}
                    <div className="col-8 col-sm-9 col-md-4">
                      <Link
                        to={`/product/${item.id}`}
                        className="text-decoration-none text-dark"
                      >
                        <p className="small text-primary fw-semibold mb-1">
                          {item.brandName}
                        </p>

                        <h2 className="h6 fw-bold mb-1">
                          {item.name}
                        </h2>
                      </Link>

                      <p className="small text-secondary mb-2">
                        {item.category}
                      </p>

                      <p className="fw-bold mb-0">
                        Ksh {item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="col-7 col-sm-6 col-md-3">
                      <div className="d-flex align-items-center border rounded-3 bg-light">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={15} />
                        </Button>

                        <span className="flex-grow-1 text-center fw-semibold">
                          {item.quantity}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            item.quantity >= item.stock
                          }
                        >
                          <Plus size={15} />
                        </Button>
                      </div>
                    </div>

                    {/* Total / Remove */}
                    <div className="col-5 col-sm-6 col-md-3 text-end">
                      <p className="fw-bold mb-2">
                        Ksh{' '}
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString()}
                      </p>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger gap-1"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/shop"
              className="text-decoration-none text-secondary d-inline-flex align-items-center gap-2 mt-4"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="col-lg-4">
            <div className="bg-white rounded-4 p-4 sticky-lg-top" style={{ top: '30px' }}>
              <h2 className="h4 fw-bold mb-4">
                Order Summary
              </h2>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary">
                  Subtotal
                </span>

                <span className="fw-semibold">
                  Ksh {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary">
                  Delivery
                </span>

                <span className="small text-secondary">
                  Calculated at checkout
                </span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold">
                  Total
                </span>

                <span className="fs-5 fw-bold">
                  Ksh {subtotal.toLocaleString()}
                </span>
              </div>

              <Button
                className="w-100"
                size="lg"
                disabled
                title="Checkout will be connected next"
              >
                Checkout
              </Button>

              <p className="small text-secondary text-center mt-3 mb-0">
                Checkout and M-Pesa payments will be
                connected next.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}