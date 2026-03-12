import { useEffect, useRef } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import './OrderSuccessPage.css'

export default function OrderSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const tickRef  = useRef(null)

  const order      = location.state?.order
  const orderTotal = location.state?.orderTotal

  // Redirect if accessed directly without order data
  useEffect(() => {
    if (!order && !orderTotal) {
      const timeout = setTimeout(() => navigate('/'), 3000)
      return () => clearTimeout(timeout)
    }
  }, [order, navigate, orderTotal])

  // Trigger tick animation on mount
  useEffect(() => {
    const el = tickRef.current
    if (el) {
      el.style.animation = 'none'
      requestAnimationFrame(() => {
        el.style.animation = ''
      })
    }
  }, [])

  // Parse order data — handles various API response shapes
  const orderId      = order?.id || order?.order_id || order?.order?.id || '—'
  const orderItems   = order?.items || order?.order?.items || order?.order_items || []
  const displayTotal = orderTotal || order?.total_amount || order?.total || order?.order?.total_amount || '—'
  const customerName = order?.customer_name || order?.name || order?.order?.customer_name || ''
  const createdAt    = order?.created_at || order?.order?.created_at || new Date().toISOString()
  const paymentMethod = order?.payment_method || order?.order?.payment_method || 'cod'

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <main className="success-page fade-in">
      <div className="container">
        <div className="success-page__card">
          {/* Confetti dots */}
          <div className="success-page__confetti" aria-hidden>
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="confetti-dot" style={{
                '--delay': `${Math.random() * 1.5}s`,
                '--x': `${Math.random() * 100}%`,
                '--color': ['#e8a045','#7c6ef4','#3dbd7d','#e85555','#f0b96a'][i % 5],
              }} />
            ))}
          </div>

          {/* Check icon */}
          <div className="success-page__icon" ref={tickRef}>
            <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="26" cy="26" r="26" fill="var(--amber)" className="success-circle" />
              <path
                d="M14 26L22 34L38 18"
                stroke="var(--ink)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="success-tick"
              />
            </svg>
          </div>

          <h1 className="success-page__title">Order Placed!</h1>
          <p className="success-page__subtitle">
            {customerName ? `Thank you, ${customerName.split(' ')[0]}!` : 'Thank you for your order!'}
            {' '}Your order has been received and is being processed.
          </p>

          {/* Order meta */}
          <div className="success-page__meta">
            <div className="success-page__meta-item">
              <span>Order ID</span>
              <strong>#{typeof orderId === 'string' ? orderId : JSON.stringify(orderId)}</strong>
            </div>
            <div className="success-page__meta-item">
              <span>Date</span>
              <strong>{formattedDate}</strong>
            </div>
            <div className="success-page__meta-item">
              <span>Payment</span>
              <strong>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</strong>
            </div>
            <div className="success-page__meta-item success-page__meta-item--total">
              <span>Total</span>
              <strong>${displayTotal}</strong>
            </div>
          </div>

          {/* Items */}
          {orderItems.length > 0 && (
            <div className="success-page__items">
              <h3 className="success-page__items-title">Items Ordered</h3>
              {orderItems.map((item, i) => {
                const product = item.product || item
                return (
                  <div key={i} className="success-page__item">
                    <div className="success-page__item-dot" />
                    <span className="success-page__item-name">
                      {product.name || item.product_name || 'Product'}
                    </span>
                    <span className="success-page__item-qty">×{item.quantity}</span>
                    {(product.price || item.price) && (
                      <span className="success-page__item-price">
                        ${(parseFloat(product.price || item.price) * item.quantity).toFixed(2)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Vendor note */}
          <div className="success-page__vendor-note">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            The vendor has been notified and will process your order shortly.
          </div>

          {/* Actions */}
          <div className="success-page__actions">
            <Link to="/products" className="btn btn-amber success-page__btn">
              Continue Shopping
            </Link>
            <Link to="/" className="btn btn-outline success-page__btn">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
