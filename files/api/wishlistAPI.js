const STORAGE_KEY = 'mf_wishlist_v1'

function readWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Failed to read wishlist from localStorage', err)
    return []
  }
}

function writeWishlist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.warn('Failed to write wishlist to localStorage', err)
  }
}

export async function getWishlist() {
  const items = readWishlist()
  return { items }
}

export async function addToWishlist(productId) {
  const items = readWishlist()
  if (!items.includes(productId)) {
    items.push(productId)
    writeWishlist(items)
  }
  return { items }
}

export async function removeFromWishlist(productId) {
  const items = readWishlist().filter((id) => id !== productId)
  writeWishlist(items)
  return { items }
}
