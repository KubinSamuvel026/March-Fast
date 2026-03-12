import { Link } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import CartItem from './CartItem.jsx'
import './CartPage.css'

export default function CartPage() {
  const { items, total, count, loading } = useCart()

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>
  }

  return (
    <main className="cart-page fade-in">
      <div className="container">
        <h1 className="section-title">Your Cart</h1>
        <p className="section-subtitle">
          {count > 0 ? `${count} item${count !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
        </p>

        {items.length === 0 ? (
          <div className="empty-state">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn btn-amber">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-page__layout">
            {/* Items */}
            <div className="cart-page__items">
              {/* Column headers — desktop */}
              <div className="cart-page__table-header">
                <span>Product</span>
                <span style={{ gridColumn: '3' }}>Quantity</span>
                <span style={{ gridColumn: '4', textAlign: 'right' }}>Subtotal</span>
              </div>

              <div className="cart-page__list">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Continue shopping */}
              <Link to="/products" className="cart-page__continue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <aside className="cart-page__summary">
              <h2 className="cart-page__summary-title">Order Summary</h2>

              <div className="cart-page__summary-rows">
                <div className="cart-page__summary-row">
                  <span>Subtotal ({count} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="cart-page__summary-row">
                  <span>Shipping</span>
                  <span className="cart-page__free">Free</span>
                </div>
                <div className="cart-page__summary-row">
                  <span>Tax (estimated)</span>
                  <span>${(total * 0.08).toFixed(2)}</span>
                </div>
              </div>

              <div className="cart-page__summary-total">
                <span>Total</span>
                <span>${(total + total * 0.08).toFixed(2)}</span>
              </div>

              <Link to="/checkout" className="btn btn-amber cart-page__checkout-btn">
                Proceed to Checkout
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>

              <div className="cart-page__trust">
                <span>🔒 Secure checkout</span>
                <span>🚚 Free delivery</span>
                <span>↩️ Easy returns</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
