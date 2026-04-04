import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { submitCheckout } from './api/orderAPI.js'
import toast from 'react-hot-toast'
import './CheckoutPage.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&q=80'

const getImageUrl = (imagePath, fallback = FALLBACK_IMAGE) => {
  if (!imagePath) return fallback
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
  if (imagePath.startsWith('/')) return `https://api.marchfastn.shop${imagePath}`
  return imagePath
}

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postal_code: '',
  payment_method: 'cod',
  card_number: '',
  card_expiry: '',
  card_cvv: '',
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()

  // Protect Checkout Route
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
    }
  }, [navigate])

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1=shipping, 2=payment

  const tax = total * 0.08
  const grandTotal = (total + tax).toFixed(2)

  /* ── Validation ───────────────────────────────────── */
  const validateStep1 = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'Required'
    if (!form.last_name.trim()) e.last_name = 'Required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.phone.trim()) e.phone = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.postal_code.trim()) e.postal_code = 'Required'
    return e
  }

  const validateStep2 = () => {
    const e = {}
    if (form.payment_method === 'card') {
      if (!form.card_number.trim() || form.card_number.replace(/\s/g, '').length !== 16)
        e.card_number = 'Enter a valid 16-digit card number'
      if (!form.card_expiry.trim() || !/^\d{2}\/\d{2}$/.test(form.card_expiry))
        e.card_expiry = 'Format: MM/YY'
      if (!form.card_cvv.trim() || form.card_cvv.length < 3)
        e.card_cvv = 'Enter valid CVV'
    }
    return e
  }

  /* ── Step Navigation ──────────────────────────────── */
  const handleNext = () => {
    const errs = validateStep1()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fill all required fields')
      return
    }
    setErrors({})
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── Submit ───────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateStep2()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please check payment details')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        customer_name: `${form.first_name} ${form.last_name}`,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        shipping_address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        payment_method: form.payment_method,
        items: items.map((item) => ({
          product_id: item.product?.id || item.product_id,
          quantity: item.quantity,
        })),
        total_amount: grandTotal,
      }

      const response = await submitCheckout(payload)
      clearCart()
      navigate('/order-success', {
        state: {
          order: response,
          orderTotal: grandTotal,
        },
      })
    } catch (err) {
      toast.error(err.friendlyMessage || 'Checkout failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Format card number ───────────────────────────── */
  const formatCard = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  /* ── Guard: empty cart ────────────────────────────── */
  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="container">
          <div className="empty-state">
            <h3>Your cart is empty</h3>
            <p>Add some items before checking out.</p>
            <Link to="/products" className="btn btn-amber">Browse Products</Link>
          </div>
        </div>
      </main>
    )
  }

  const field = (name, label, type = 'text', placeholder = '', extra = {}) => (
    <div className="form-group" key={name}>
      <label className="form-label">{label}</label>
      <input
        type={type}
        className={`form-input ${errors[name] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) =>
          setForm((f) => ({ ...f, [name]: e.target.value }))
        }
        {...extra}
      />
      {errors[name] && <span className="checkout-page__field-err">{errors[name]}</span>}
    </div>
  )

  return (
    <main className="checkout-page fade-in">
      <div className="container">
        <div className="checkout-page__layout">
          {/* ── Left: Form ───────────────────────── */}
          <div className="checkout-page__form-col">
            {/* Progress */}
            <div className="checkout-page__steps">
              <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
                <span className="checkout-step__num">1</span>
                <span>Shipping</span>
              </div>
              <div className="checkout-step__line" />
              <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
                <span className="checkout-step__num">2</span>
                <span>Payment</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* ── Step 1: Shipping Info ── */}
              {step === 1 && (
                <section className="checkout-page__section fade-in">
                  <h2 className="checkout-page__section-title">Shipping Information</h2>

                  <div className="checkout-page__two-col">
                    {field('first_name', 'First Name', 'text', 'John')}
                    {field('last_name', 'Last Name', 'text', 'Doe')}
                  </div>

                  {field('email', 'Email Address', 'email', 'john@example.com')}
                  {field('phone', 'Phone Number', 'tel', '+1 234 567 8900')}
                  {field('address', 'Street Address', 'text', '123 Main Street')}

                  <div className="checkout-page__two-col">
                    {field('city', 'City', 'text', 'New York')}
                    {field('postal_code', 'Postal Code', 'text', '10001')}
                  </div>

                  <button type="button" className="btn btn-primary checkout-page__next-btn" onClick={handleNext}>
                    Continue to Payment
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </section>
              )}

              {/* ── Step 2: Payment ── */}
              {step === 2 && (
                <section className="checkout-page__section fade-in">
                  <button type="button" className="checkout-page__back" onClick={() => setStep(1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Shipping
                  </button>

                  <h2 className="checkout-page__section-title">Payment Method</h2>

                  <div className="checkout-page__payment-opts">
                    {[
                      { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                      { value: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Secure card payment' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`payment-opt ${form.payment_method === opt.value ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={opt.value}
                          checked={form.payment_method === opt.value}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, payment_method: e.target.value }))
                          }
                        />
                        <span className="payment-opt__icon">{opt.icon}</span>
                        <div>
                          <span className="payment-opt__label">{opt.label}</span>
                          <span className="payment-opt__desc">{opt.desc}</span>
                        </div>
                        {form.payment_method === opt.value && (
                          <svg className="payment-opt__check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Card Fields */}
                  {form.payment_method === 'card' && (
                    <div className="checkout-page__card-fields fade-in">
                      <div className="checkout-page__card-header">
                        <span>Card Details</span>
                        <div className="checkout-page__card-brands">
                          <span>VISA</span><span>MC</span><span>AMEX</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Card Number</label>
                        <input
                          type="text"
                          className={`form-input ${errors.card_number ? 'error' : ''}`}
                          placeholder="1234 5678 9012 3456"
                          value={form.card_number}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, card_number: formatCard(e.target.value) }))
                          }
                          maxLength={19}
                        />
                        {errors.card_number && <span className="checkout-page__field-err">{errors.card_number}</span>}
                      </div>

                      <div className="checkout-page__two-col">
                        <div className="form-group">
                          <label className="form-label">Expiry</label>
                          <input
                            type="text"
                            className={`form-input ${errors.card_expiry ? 'error' : ''}`}
                            placeholder="MM/YY"
                            value={form.card_expiry}
                            maxLength={5}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, '')
                              if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2, 4)
                              setForm((f) => ({ ...f, card_expiry: v }))
                            }}
                          />
                          {errors.card_expiry && <span className="checkout-page__field-err">{errors.card_expiry}</span>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVV</label>
                          <input
                            type="text"
                            className={`form-input ${errors.card_cvv ? 'error' : ''}`}
                            placeholder="123"
                            value={form.card_cvv}
                            maxLength={4}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '')
                              setForm((f) => ({ ...f, card_cvv: v }))
                            }}
                          />
                          {errors.card_cvv && <span className="checkout-page__field-err">{errors.card_cvv}</span>}
                        </div>
                      </div>

                      <div className="checkout-page__card-notice">
                        🔒 This is a simulated payment. No real charge will occur.
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-amber checkout-page__submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Place Order · ${grandTotal}
                      </>
                    )}
                  </button>
                </section>
              )}
            </form>
          </div>

          {/* ── Right: Order Summary ────────────── */}
          <aside className="checkout-page__summary">
            <h3 className="checkout-page__summary-title">Order Summary</h3>

            <div className="checkout-page__items">
              {items.map((item) => {
                const product = item.product || item
                const price = parseFloat(product.price || 0)
                const imageUrl = getImageUrl(product.image || product.image_url)
                return (
                  <div key={item.id} className="checkout-page__item">
                    <div className="checkout-page__item-image">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        onError={(e) => { e.target.src = FALLBACK_IMAGE }}
                      />
                      <span className="checkout-page__item-qty">{item.quantity}</span>
                    </div>
                    <div className="checkout-page__item-info">
                      <span className="checkout-page__item-name">{product.name}</span>
                    </div>
                    <span className="checkout-page__item-price">
                      ${(price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="checkout-page__summary-rows">
              <div className="checkout-page__summary-row">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="checkout-page__summary-row">
                <span>Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Free</span>
              </div>
              <div className="checkout-page__summary-row">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout-page__grand-total">
              <span>Total</span>
              <span>${grandTotal}</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
