import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { getWishlist, addToWishlist, removeFromWishlist } from './api/wishlistAPI.js'
import { addToCart } from './api/cartAPI.js'
import { useCart } from './CartContext.jsx'
import toast from 'react-hot-toast'

/* ── State ───────────────────────────────────────────── */
const initialState = {
  items: [],   // [{ id, product }]
  loading: false,
  error: null,
}

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null }
    case 'SET_WISHLIST':
      return {
        ...state,
        items: action.payload?.items || action.payload || [],
        loading: false,
        error: null,
      }
    case 'ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'CLEAR':
      return { ...initialState }
    default:
      return state
  }
}

/* ── Context ─────────────────────────────────────────── */
const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState)
  const { refreshCart } = useCart()

  const fetchWishlist = useCallback(async () => {
    dispatch({ type: 'LOADING' })
    try {
      const data = await getWishlist()
      dispatch({ type: 'SET_WISHLIST', payload: data })
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.friendlyMessage })
    }
  }, [])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const addItem = useCallback(async (productId) => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login'
      return
    }
    try {
      const data = await addToWishlist(productId)
      dispatch({ type: 'SET_WISHLIST', payload: data })
      toast.success('Added to wishlist!')
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to add to wishlist')
    }
  }, [])

  const removeItem = useCallback(async (productId) => {
    try {
      const data = await removeFromWishlist(productId)
      dispatch({ type: 'SET_WISHLIST', payload: data })
      toast.success('Removed from wishlist')
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to remove item')
    }
  }, [])

  // Clear wishlist locally (e.g. on logout)
  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  // Move wishlist item to cart
  const moveToCart = useCallback(async (productId) => {
    try {
      await addToCart(productId, 1)
      await removeFromWishlist(productId)
      const data = await getWishlist()
      dispatch({ type: 'SET_WISHLIST', payload: data })
      refreshCart()
      toast.success('Moved to cart!')
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to move item')
    }
  }, [refreshCart])

  const isWishlisted = useCallback(
    (productId) =>
      state.items.some(
        (item) => item.product?.id === productId || item.product_id === productId
      ),
    [state.items]
  )

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        moveToCart,
        refreshWishlist: fetchWishlist,
        clearWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
