/**
 * In-memory resolver cache with 24-hour TTL.
 * Key = normalized intent target (strips filler words, lowercase, trimmed).
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const FILLER_WORDS = ['stock', 'price', 'inc', 'crypto', 'coin', 'token', 'share', 'shares', 'corp', 'corporation', 'ltd', 'limited', 'the']

const cache = new Map()

/**
 * Normalize a query string into a cache key.
 * "Tesla stock" → "tesla"
 * "tesla inc" → "tesla"
 * "Bitcoin price" → "bitcoin"
 */
export function normalizeCacheKey(query) {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(word => !FILLER_WORDS.includes(word))
    .join(' ')
    .trim()
}

/**
 * Get a cached resolved asset, or null if miss / expired.
 */
export function getCached(query) {
  const key = normalizeCacheKey(query)
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }

  return entry.value
}

/**
 * Store a resolved asset in the cache.
 */
export function setCache(query, value) {
  const key = normalizeCacheKey(query)
  cache.set(key, { value, timestamp: Date.now() })
}

/**
 * Get current cache size (for logging).
 */
export function cacheSize() {
  return cache.size
}
