import { getProductById } from './productAPI.js'

const STORAGE_KEY = 'mf_cart_v1'

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Failed to read cart from localStorage', err)
    return []
  }
}

function writeCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.warn('Failed to write cart to localStorage', err)
  }
}

function normalizeItem(item) {
  // Ensure we store the product snapshot so the UI can render quickly.
  return {
    id: item.id,
    product: item.product,
    quantity: item.quantity,
  }
}

export async function getCart() {
  const items = readCart()
  return { items }
}

export async function addToCart(productId, quantity = 1) {
  const items = readCart()
  const existingIndex = items.findIndex((i) => i.id === productId)

  // Fetch product details so the UI can render the cart.
  const product = await getProductById(productId)

  if (existingIndex >= 0) {
    items[existingIndex] = normalizeItem({
      id: productId,
      product,
      quantity: items[existingIndex].quantity + quantity,
    })
  } else {
    items.push(normalizeItem({ id: productId, product, quantity }))
  }

  writeCart(items)
  return { items }
}

export async function updateCartItem(itemId, quantity) {
  const items = readCart()
  const idx = items.findIndex((i) => i.id === itemId)
  if (idx === -1) throw new Error('Cart item not found')

  if (quantity <= 0) {
    items.splice(idx, 1)
  } else {
    items[idx] = normalizeItem({
      id: itemId,
      product: items[idx].product,
      quantity,
    })
  }

  writeCart(items)
  return { items }
}

export async function removeFromCart(itemId) {
  const items = readCart().filter((i) => i.id !== itemId)
  writeCart(items)
  return { items }
}

export async function clearCart() {
  writeCart([])
  return { items: [] }
}
