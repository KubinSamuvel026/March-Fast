import { useState, useEffect, useCallback } from 'react'
import axiosClient from './axiosClient.js'
import ProductCard from './ProductCard.jsx'
import './ProductsPage.css'

export default function ProductsPage() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [sortBy, setSortBy] = useState('default')

  const [category, setCategory] = useState('all')
  const [categories, setCategories] = useState([])

  const fetchProducts = useCallback(async (q = '') => {

    setLoading(true)
    setError(null)

    try {

      let url = '/products/'
      let allProducts = []

      while (url) {

        const response = await axiosClient.get(url, {
          params: q ? { search: q } : {}
        })

        const payload = response.data
        const data = payload?.data

        const list =
          data?.products ||
          payload?.results ||
          data?.results ||
          data ||
          []

        allProducts = [...allProducts, ...list]

        url = payload?.next || data?.next || null
      }

      setProducts(allProducts)

      const cats = [
        ...new Set(
          allProducts
            .map(p => p.category_name)
            .filter(Boolean)
        )
      ]

      setCategories(cats)

    } catch (err) {

      console.error(err)
      setError('Failed to load products.')

    } finally {

      setLoading(false)

    }

  }, [])

  useEffect(() => {
    fetchProducts(search)
  }, [search, fetchProducts])

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const filteredProducts =
    category === 'all'
      ? products
      : products.filter(p => p.category_name === category)

  const sorted = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return parseFloat(a.price) - parseFloat(b.price)
    if (sortBy === 'price-desc') return parseFloat(b.price) - parseFloat(a.price)
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
    return 0
  })

  return (
    <main className="products-page">

      <div className="container">

        <div className="products-page__header">
          <div>
            <h1 className="section-title">All Products</h1>
            <p className="section-subtitle">
              {loading
                ? 'Loading...'
                : `${products.length} products available`}
            </p>
          </div>
        </div>

        <div className="products-page__toolbar">

          <div className="products-page__search">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="products-page__search-input"
            />
          </div>

          <div className="products-page__sort">
            <label>Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All</option>

              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}

            </select>
          </div>

          <div className="products-page__sort">
            <label>Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
            </select>
          </div>

        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button
              onClick={() => fetchProducts(search)}
              style={{
                marginLeft: 12,
                fontWeight: 600,
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (

          <div className="loading-center">
            <div className="spinner" />
          </div>

        ) : sorted.length === 0 ? (

          <div className="empty-state">
            <h3>No products found</h3>
          </div>

        ) : (

          <div className="products-page__grid">

            {sorted.map((product, i) => (
              <div key={product.id} style={{ animationDelay: `${i * 0.04}s` }}>
                <ProductCard product={product} />
              </div>
            ))}

          </div>

        )}

      </div>

    </main>
  )
}
