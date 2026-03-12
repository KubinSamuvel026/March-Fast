import { useCart } from './CartContext.jsx'
import './CartItem.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'

export default function CartItem({ item }) {
  const { updateItem, removeItem } = useCart()

  const product = item.product || item
  const price = parseFloat(product.price || item.price || 0)
  const subtotal = (price * item.quantity).toFixed(2)
  const rawImg = product.image || product.image_url
  const imageUrl = rawImg?.startsWith('/') ? `http://127.0.0.1:8000${rawImg}` : rawImg || FALLBACK_IMAGE

  return (
    <div className="cart-item">
      <div className="cart-item__image-wrap">
        <img
          src={imageUrl}
          alt={product.name}
          className="cart-item__image"
          onError={(e) => { e.target.src = FALLBACK_IMAGE }}
        />
      </div>

      <div className="cart-item__info">
        <h4 className="cart-item__name">{product.name}</h4>
        {product.category && (
          <span className="cart-item__category">{product.category}</span>
        )}
        <span className="cart-item__unit-price">${price.toFixed(2)} each</span>
      </div>

      <div className="cart-item__qty">
        <button
          className="cart-item__qty-btn"
          onClick={() => updateItem(item.id, item.quantity - 1)}
          aria-label="Decrease quantity"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span className="cart-item__qty-value">{item.quantity}</span>
        <button
          className="cart-item__qty-btn"
          onClick={() => updateItem(item.id, item.quantity + 1)}
          aria-label="Increase quantity"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className="cart-item__subtotal">
        <span>${subtotal}</span>
      </div>

      <button
        className="cart-item__remove"
        onClick={() => removeItem(item.id)}
        aria-label="Remove item"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  )
}
