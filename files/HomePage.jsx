import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from './api/productAPI.js'
import ProductCard from './ProductCard.jsx'
import './HomePage.css'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts({ limit: 8 })
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || data.products || []
        setFeatured(items.slice(0, 8))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="home">
      {/* ── Hero ──────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__grid-lines" />
        </div>
        <div className="container hero__content">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            New arrivals every week
          </div>
          <h1 className="hero__title">
            Shop Smarter,<br />
            <span className="hero__title-accent">March Faster.</span>
          </h1>
          <p className="hero__desc">
            Discover thousands of products from verified vendors.
            Fast shipping, real prices, zero hassle.
          </p>
          <div className="hero__actions">
            <Link to="/products" className="btn btn-amber hero__cta">
              Shop Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <Link to="/products" className="btn btn-outline hero__browse">
              Browse Catalog
            </Link>
          </div>

          <div className="hero__stats">
            {[['10K+', 'Products'], ['500+', 'Vendors'], ['24h', 'Delivery'], ['4.9★', 'Rating']].map(
              ([val, label]) => (
                <div className="hero__stat" key={label}>
                  <strong>{val}</strong>
                  <span>{label}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Feature Badges ────────────────────────── */}
      <section className="perks">
        <div className="container perks__grid" style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {[
            { icon: '🚚', title: 'Fast Delivery', desc: 'Same-day in major cities' },
            { icon: '🔒', title: 'Secure Checkout', desc: 'Encrypted & protected' },
            { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free returns' },
            { icon: '🎁', title: 'Gift Wrapping', desc: 'Available on all items' },
          ].map((p) => (
            <div className="perk-card" key={p.title}>
              <span className="perk-card__icon">{p.icon}</span>
              <div>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────── */}
      <section className="featured">
        <div className="container">
          <div className="featured__header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked deals, updated daily</p>
            </div>
            <Link to="/products" className="featured__see-all">
              See all
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <p>No products available yet.</p>
              <Link to="/products" className="btn btn-primary">Browse All</Link>
            </div>
          ) : (
            <div className="featured__grid" style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {featured.map((product, i) => (
                <div
                  key={product.id}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Banner CTA ───────────────────────────── */}
      <section className="banner-cta">
        <div className="container banner-cta__inner">
          <div className="banner-cta__text">
            <h2>Ready to start shopping?</h2>
            <p>Join thousands of happy customers across the platform.</p>
          </div>
          <Link to="/products" className="btn btn-amber">
            Explore All Products
          </Link>
        </div>
      </section>
    </main>
  )
}
