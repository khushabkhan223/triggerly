/**
 * Product Price Fetcher via SerpAPI Google Shopping
 * Fetches current lowest prices for product queries.
 * Filters out accessories, refurbished items, and irrelevant listings.
 * Gracefully skips if SERPAPI_KEY is not set.
 */

/**
 * Normalize a product name for consistent grouping.
 * "Sony WH-1000XM5" → "sony wh1000xm5"
 */
export function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[-_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Accessory & Junk Filters ────────────────────────────────────────────

const ACCESSORY_KEYWORDS = [
  'case', 'cover', 'charger', 'cable', 'screen protector', 'adapter',
  'skin', 'holder', 'stand', 'protector', 'mount', 'strap', 'band',
  'sleeve', 'pouch', 'dock', 'hub', 'dongle', 'stylus', 'pen',
  'tempered glass', 'film', 'folio', 'wallet', 'clip', 'grip',
  'earbuds case', 'cleaning kit', 'sticker', 'decal',
]

const REFURBISHED_KEYWORDS = [
  'refurbished', 'renewed', 'restored', 'used', 'pre-owned', 'open box',
]

/**
 * Check if a listing title is an accessory or junk result.
 */
function isAccessory(title) {
  const lower = title.toLowerCase()
  return ACCESSORY_KEYWORDS.some(kw => lower.includes(kw))
}

/**
 * Check if a listing title is refurbished/used.
 */
function isRefurbished(title) {
  const lower = title.toLowerCase()
  return REFURBISHED_KEYWORDS.some(kw => lower.includes(kw))
}

/**
 * Score how relevant a listing title is to the search query.
 * Returns the number of query keywords found in the title.
 */
function relevanceScore(title, query) {
  const titleLower = title.toLowerCase()
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1)
  let score = 0
  for (const word of queryWords) {
    if (titleLower.includes(word)) score++
  }
  return score
}

/**
 * Filter and rank product results.
 * - Remove accessories
 * - Remove refurbished
 * - Require at least some query keyword overlap
 * - Sort by relevance score (descending), then by price (ascending)
 */
function filterResults(results, query) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1)
  const minKeywords = Math.max(1, Math.floor(queryWords.length * 0.5))

  return results
    .filter(r => {
      const title = r.title || ''
      if (isAccessory(title)) return false
      if (isRefurbished(title)) return false
      if (relevanceScore(title, query) < minKeywords) return false
      return true
    })
    .sort((a, b) => {
      const scoreA = relevanceScore(a.title || '', query)
      const scoreB = relevanceScore(b.title || '', query)
      if (scoreB !== scoreA) return scoreB - scoreA  // higher relevance first
      return a.extracted_price - b.extracted_price    // then lower price first
    })
}

/**
 * Fetch prices for a list of product names.
 * @param {string[]} productNames - list of product name strings
 * @returns {Object} map of normalizedName → lowestPrice
 */
export async function fetchProductPrices(productNames) {
  const apiKey = process.env.SERPAPI_KEY
  if (!apiKey) {
    console.warn('⚠️ SERPAPI_KEY not set — product price fetching disabled')
    return {}
  }

  const prices = {}

  // Deduplicate by normalized name
  const uniqueProducts = [...new Set(productNames.map(normalizeProductName))]

  for (const product of uniqueProducts) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(
        `https://serpapi.com/search.json?q=${encodeURIComponent(product)}&engine=google_shopping&api_key=${apiKey}&num=15`,
        { signal: controller.signal }
      )
      clearTimeout(timeout)

      if (!res.ok) {
        console.warn(`⚠️ Product search failed for "${product}": HTTP ${res.status}`)
        continue
      }

      const data = await res.json()
      const rawResults = (data.shopping_results || [])
        .filter(r => r.extracted_price && r.extracted_price > 0)

      // Apply accessory/refurbished/relevance filters
      const filtered = filterResults(rawResults, product)

      if (filtered.length === 0) {
        console.warn(`⚠️ No valid results for "${product}" (${rawResults.length} raw, all filtered out)`)
        continue
      }

      // Use the best match (highest relevance, lowest price)
      const best = filtered[0]
      prices[product] = best.extracted_price
      console.log(`   📦 "${product}" → $${best.extracted_price} (${best.title})`)

    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn(`⏱️ Product search timed out for "${product}"`)
      } else {
        console.error(`❌ Product search error for "${product}":`, err.message)
      }
    }
  }

  return prices
}
