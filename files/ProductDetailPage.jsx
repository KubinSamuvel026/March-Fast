import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductById } from './api/productAPI.js'
import { useCart } from './CartContext.jsx'
import { useWishlist } from './WishlistContext.jsx'
import './ProductDetailPage.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImg, setActiveImg] = useState(null)

  const { addItem: addToCart, isInCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeWishlist, isWishlisted } = useWishlist()

  useEffect(() => {
    setLoading(true)
    setError(null)
    getProductById(id)
      .then((data) => {
        setProduct(data)
        const rawImg = data.image || data.image_url
        setActiveImg(rawImg?.startsWith('/') ? `http://127.0.0.1:8000${rawImg}` : rawImg || FALLBACK_IMAGE)
      })
      .catch((err) => setError(err.friendlyMessage || 'Product not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  if (error) return (
    <main className="detail-page">
      <div className="container">
        <div className="empty-state">
          <h3>Oops!</h3>
          <p>{error}</p>
          <Link to="/products" className="btn btn-primary">Back to Products</Link>
        </div>
      </div>
    </main>
  )

  if (!product) return null

  const price = parseFloat(product.price || 0).toFixed(2)
  const stock = product.stock ?? product.quantity ?? null
  const outOfStock = stock === 0
  const inCart = isInCart(product.id)
  const wishlisted = isWishlisted(product.id)
  const maxQty = stock || 99

  const handleAddToCart = () => {
    addToCart(product.id, quantity)
  }

  const handleWishlist = () => {
    if (wishlisted) removeWishlist(product.id)
    else addToWishlist(product.id)
  }

  return (
    <main className="detail-page fade-in">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="detail-page__breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="detail-page__layout">
          {/* ── Images ────── */}
          <div className="detail-page__gallery">
            <div className="detail-page__main-image">
              <img
                src={activeImg}
                alt={product.name}
                onError={(e) => { e.target.src = FALLBACK_IMAGE }}
              />
              {outOfStock && (
                <div className="detail-page__oos-overlay">Out of Stock</div>
              )}
            </div>

            {/* Thumbnails — if product has extra images */}
            {product.images?.length > 1 && (
              <div className="detail-page__thumbs">
                {product.images.map((img, i) => {
                  const thumbUrl = img?.startsWith('/') ? `http://127.0.0.1:8000${img}` : img
                  return (
                    <button
                      key={i}
                      className={`detail-page__thumb ${activeImg === thumbUrl ? 'active' : ''}`}
                      onClick={() => setActiveImg(thumbUrl)}
                    >
                      <img src={thumbUrl} alt={`View ${i + 1}`} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Info ──────── */}
          <div className="detail-page__info">
            {product.category && (
              <span className="detail-page__category">{product.category}</span>
            )}
            <h1 className="detail-page__name">{product.name}</h1>

            {product.vendor && (
              <p className="detail-page__vendor">by {product.vendor?.name || product.vendor}</p>
            )}

            <div className="detail-page__price-row">
              <span className="detail-page__price">${price}</span>
              {stock !== null && stock > 0 && (
                <span className="detail-page__stock-badge">
                  {stock <= 10 ? `⚡ Only ${stock} left` : '✅ In Stock'}
                </span>
              )}
              {outOfStock && (
                <span className="detail-page__stock-badge detail-page__stock-badge--out">
                  Out of Stock
                </span>
              )}
            </div>

            {product.description && (
              <div className="detail-page__desc">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Quantity */}
            {!outOfStock && (
              <div className="detail-page__qty-row">
                <span className="form-label">Quantity</span>
                <div className="detail-page__qty-ctrl">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="detail-page__actions">
              <button
                className={`btn btn-primary detail-page__cart-btn ${inCart ? 'in-cart' : ''}`}
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                {inCart ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Added to Cart
                  </>
                ) : outOfStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>

              <button
                className={`detail-page__wish-btn ${wishlisted ? 'active' : ''}`}
                onClick={handleWishlist}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlisted ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

            {/* Checkout shortcut */}
            {!outOfStock && (
              <Link to="/cart" className="btn btn-amber detail-page__checkout-btn">
                Proceed to Checkout →
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
