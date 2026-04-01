import { Link } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { useWishlist } from './WishlistContext.jsx'
import './ProductCard.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'

export default function ProductCard({ product }) {
  const { addItem: addToCart, isInCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeWishlist, isWishlisted } = useWishlist()

  const inCart = isInCart(product.id)
  const wishlisted = isWishlisted(product.id)

  const handleCartClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product.id, 1)
  }

  const handleWishlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (wishlisted) {
      removeWishlist(product.id)
    } else {
      addToWishlist(product.id)
    }
  }

  const rawImageUrl = product.image || product.image_url
  const imageUrl = rawImageUrl?.startsWith('/')
    ? ` https://marchfastn.shop/api${rawImageUrl}`
    : rawImageUrl || FALLBACK_IMAGE

  const price = parseFloat(product.price || 0).toFixed(2)
  const stock = product.stock ?? product.quantity ?? null
  const outOfStock = stock === 0

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__media">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-card__image"
          onError={(e) => { e.target.src = FALLBACK_IMAGE }}
          loading="lazy"
        />

        {/* Wishlist toggle */}
        <button
          className={`product-card__wish-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {outOfStock && (
          <span className="product-card__badge product-card__badge--out">Out of Stock</span>
        )}
      </div>

      <div className="product-card__body">
        {product.category && (
          <span className="product-card__category">{product.category}</span>
        )}
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__footer">
          <span className="product-card__price">${price}</span>
          <button
            className={`product-card__cart-btn ${inCart ? 'in-cart' : ''} ${outOfStock ? 'disabled' : ''}`}
            onClick={handleCartClick}
            disabled={outOfStock}
            aria-label={inCart ? 'In cart' : 'Add to cart'}
          >
            {inCart ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Added
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Cart
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}
