import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart as clearCartStorage } from './api/cartAPI.js'
import toast from 'react-hot-toast'

/* ── State Shape ─────────────────────────────────────── */
const initialState = {
  items: [],          // [{ id, product, quantity, subtotal }]
  total: 0,
  count: 0,           // total quantity across all items
  loading: false,
  error: null,
}

/* ── Reducer ─────────────────────────────────────────── */
function cartReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null }

    case 'SET_CART': {
      const items = action.payload?.items || action.payload || []
      const total = items.reduce((sum, item) => {
        const price = item.product?.price || item.price || 0
        return sum + parseFloat(price) * item.quantity
      }, 0)
      const count = items.reduce((sum, item) => sum + item.quantity, 0)
      return { ...state, items, total, count, loading: false, error: null }
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
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Fetch cart on mount
  const fetchCart = useCallback(async () => {
    dispatch({ type: 'LOADING' })
    try {
      const data = await getCart()
      dispatch({ type: 'SET_CART', payload: data })
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.friendlyMessage })
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Add to cart
  const addItem = useCallback(async (productId, quantity = 1) => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login'
      return
    }
    try {
      const data = await addToCart(productId, quantity)
      dispatch({ type: 'SET_CART', payload: data })
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to add to cart')
    }
  }, [])

  // Update quantity
  const updateItem = useCallback(async (itemId, quantity) => {
    if (quantity < 1) return removeItem(itemId)
    try {
      const data = await updateCartItem(itemId, quantity)
      dispatch({ type: 'SET_CART', payload: data })
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to update cart')
    }
  }, [])

  // Remove item
  const removeItem = useCallback(async (itemId) => {
    try {
      const data = await removeFromCart(itemId)
      dispatch({ type: 'SET_CART', payload: data })
      toast.success('Item removed')
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to remove item')
    }
  }, [])

  // Clear cart locally (after successful checkout)
  const clearCart = useCallback(async () => {
    await clearCartStorage()
    dispatch({ type: 'CLEAR' })
  }, [])

  // Check if product is in cart
  const isInCart = useCallback(
    (productId) => state.items.some((item) => item.product?.id === productId || item.product_id === productId),
    [state.items]
  )

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
