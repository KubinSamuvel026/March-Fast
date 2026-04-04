import { Link } from 'react-router-dom'
import { useWishlist } from './WishlistContext.jsx'
import './WishlistPage.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80'

const getImageUrl = (imagePath, fallback = FALLBACK_IMAGE) => {
  if (!imagePath) return fallback
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
  if (imagePath.startsWith('/')) return `https://api.marchfastn.shop${imagePath}`
  return imagePath
}

export default function WishlistPage() {
  const { items, loading, removeItem, moveToCart } = useWishlist()

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>
  }

  return (
    <main className="wishlist-page fade-in">
      <div className="container">
        <h1 className="section-title">My Wishlist</h1>
        <p className="section-subtitle">
          {items.length > 0
            ? `${items.length} saved item${items.length !== 1 ? 's' : ''}`
            : 'No saved items yet'}
        </p>

        {items.length === 0 ? (
          <div className="empty-state">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love and come back to them anytime.</p>
            <Link to="/products" className="btn btn-amber">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-page__grid">
            {items.map((item) => {
              const product = item.product || item
              const price = parseFloat(product.price || 0).toFixed(2)
              const imageUrl = getImageUrl(product.image || product.image_url)
              const outOfStock = (product.stock ?? product.quantity) === 0

              return (
                <div key={item.id || product.id} className="wishlist-card fade-in">
                  <Link to={`/product/${product.id}`} className="wishlist-card__image-link">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="wishlist-card__image"
                      onError={(e) => { e.target.src = FALLBACK_IMAGE }}
                    />
                    {outOfStock && (
                      <div className="wishlist-card__oos">Out of Stock</div>
                    )}
                  </Link>

                  <div className="wishlist-card__body">
                    {product.category && (
                      <span className="wishlist-card__cat">{product.category}</span>
                    )}
                    <Link to={`/product/${product.id}`} className="wishlist-card__name">
                      {product.name}
                    </Link>
                    <span className="wishlist-card__price">${price}</span>

                    <div className="wishlist-card__actions">
                      <button
                        className="btn btn-primary wishlist-card__cart-btn"
                        onClick={() => moveToCart(product.id)}
                        disabled={outOfStock}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        Move to Cart
                      </button>

                      <button
                        className="wishlist-card__remove"
                        onClick={() => removeItem(product.id)}
                        aria-label="Remove from wishlist"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
