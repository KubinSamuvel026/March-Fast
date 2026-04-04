/**
 * Build image URL with proper base URL prefix
 * Priority: Full URL > Relative path with prefix > Fallback
 * @param {string} imagePath - The image path or URL from backend
 * @param {string} fallbackUrl - Fallback placeholder image
 * @returns {string} Complete image URL
 */
export function getImageUrl(imagePath, fallbackUrl = null) {
  // If no image path, return fallback
  if (!imagePath) {
    return fallbackUrl || null;
  }

  // If it's already a full URL (starts with http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path, prefix with base URL
  if (imagePath.startsWith('/')) {
    return `https://api.marchfastn.shop${imagePath}`;
  }

  // Default to the path as-is (shouldn't reach here normally)
  return imagePath;
}

/**
 * Handle image load failure by setting a fallback
 * @param {Event} event - The onError event
 * @param {string} fallbackUrl - Fallback image URL
 */
export function handleImageError(event, fallbackUrl) {
  if (event && event.target && fallbackUrl) {
    event.target.src = fallbackUrl;
  }
}
