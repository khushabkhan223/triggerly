/**
 * 4-Stage Asset Resolver Pipeline
 * Order: Domain → Crypto → Stock → Product
 * Each resolver has a strict timeout and returns null on failure.
 */

// ─── Domain Resolver (instant, no API) ──────────────────────────────────

const DOMAIN_REGEX = /([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.(?:com|net|org|io|ai|co|dev|app|xyz|me|info|biz|us|uk|in))\b/i

/**
 * Extract a domain from a full sentence.
 * "Check if mystartup.com is available" → "mystartup.com"
 */
export function resolveDomain(text) {
  const match = text.match(DOMAIN_REGEX)
  if (!match) return null

  const domain = match[1].toLowerCase().replace(/[?.!,;]+$/, '')
  return {
    type: 'domain',
    target: domain,
    displayName: domain,
  }
}

// ─── Crypto Resolver (CoinGecko, 3s timeout) ────────────────────────────

export async function resolveCrypto(query) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (!res.ok) return null

    const data = await res.json()
    const coins = data.coins || []

    if (coins.length === 0) return null

    const qLower = query.toLowerCase().trim()

    // Only accept crypto if the query is an exact match on name or symbol
    // This prevents tokenized stocks like "Tesla xStock" from matching "tesla"
    for (const coin of coins.slice(0, 5)) {
      const nameExact = coin.name.toLowerCase() === qLower
      const symbolExact = coin.symbol.toLowerCase() === qLower

      if (nameExact || symbolExact) {
        return {
          type: 'crypto',
          target: coin.symbol.toUpperCase(),
          source_id: coin.id,
          displayName: coin.name,
        }
      }
    }

    // No exact match — don't resolve as crypto, let stock resolver try next
    return null
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('⏱️ Crypto resolver timed out')
    } else {
      console.error('❌ Crypto resolver error:', err.message)
    }
    return null
  }
}

// ─── Stock Resolver (TwelveData, 3s timeout) ────────────────────────────

const COMPANY_TICKER_MAP = {
  'tesla': { ticker: 'TSLA', name: 'Tesla Inc' },
  'apple': { ticker: 'AAPL', name: 'Apple Inc' },
  'amazon': { ticker: 'AMZN', name: 'Amazon.com Inc' },
  'google': { ticker: 'GOOGL', name: 'Alphabet Inc' },
  'alphabet': { ticker: 'GOOGL', name: 'Alphabet Inc' },
  'microsoft': { ticker: 'MSFT', name: 'Microsoft Corp' },
  'meta': { ticker: 'META', name: 'Meta Platforms Inc' },
  'facebook': { ticker: 'META', name: 'Meta Platforms Inc' },
  'netflix': { ticker: 'NFLX', name: 'Netflix Inc' },
  'nvidia': { ticker: 'NVDA', name: 'Nvidia Corp' },
  'amd': { ticker: 'AMD', name: 'Advanced Micro Devices' },
  'intel': { ticker: 'INTC', name: 'Intel Corp' },
  'jpmorgan': { ticker: 'JPM', name: 'JPMorgan Chase & Co' },
  'jp morgan': { ticker: 'JPM', name: 'JPMorgan Chase & Co' },
  'visa': { ticker: 'V', name: 'Visa Inc' },
  'mastercard': { ticker: 'MA', name: 'Mastercard Inc' },
  'paypal': { ticker: 'PYPL', name: 'PayPal Holdings' },
  'disney': { ticker: 'DIS', name: 'Walt Disney Co' },
  'coca cola': { ticker: 'KO', name: 'Coca-Cola Co' },
  'cocacola': { ticker: 'KO', name: 'Coca-Cola Co' },
  'pepsi': { ticker: 'PEP', name: 'PepsiCo Inc' },
  'mcdonalds': { ticker: 'MCD', name: "McDonald's Corp" },
  'starbucks': { ticker: 'SBUX', name: 'Starbucks Corp' },
  'boeing': { ticker: 'BA', name: 'Boeing Co' },
  'walmart': { ticker: 'WMT', name: 'Walmart Inc' },
  'salesforce': { ticker: 'CRM', name: 'Salesforce Inc' },
  'uber': { ticker: 'UBER', name: 'Uber Technologies' },
  'airbnb': { ticker: 'ABNB', name: 'Airbnb Inc' },
  'spotify': { ticker: 'SPOT', name: 'Spotify Technology' },
  'snap': { ticker: 'SNAP', name: 'Snap Inc' },
  'snapchat': { ticker: 'SNAP', name: 'Snap Inc' },
  'twitter': { ticker: 'X', name: 'X Corp' },
  'oracle': { ticker: 'ORCL', name: 'Oracle Corp' },
  'ibm': { ticker: 'IBM', name: 'IBM Corp' },
  'sony': { ticker: 'SONY', name: 'Sony Group Corp' },
  'samsung': { ticker: 'SSNLF', name: 'Samsung Electronics' },
  'reliance': { ticker: 'RELIANCE.BSE', name: 'Reliance Industries' },
  'tata': { ticker: 'TCS.BSE', name: 'Tata Consultancy Services' },
  'infosys': { ticker: 'INFY', name: 'Infosys Ltd' },
  'wipro': { ticker: 'WIT', name: 'Wipro Ltd' },
}

export async function resolveStock(query) {
  // Check local company map first (instant, no API)
  const qLower = query.toLowerCase().trim()
  const mapped = COMPANY_TICKER_MAP[qLower]
  if (mapped) {
    console.log(`   📊 Stock resolved via local map: "${qLower}" → ${mapped.ticker} (${mapped.name})`)
    return {
      type: 'stock',
      target: mapped.ticker,
      displayName: mapped.name,
    }
  }

  // Fallback to TwelveData API
  const apiKey = process.env.TWELVEDATA_API_KEY
  if (!apiKey) {
    console.warn('⚠️ TWELVEDATA_API_KEY not set — stock resolution skipped')
    return null
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(
      `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(query)}&outputsize=5`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (!res.ok) return null

    const data = await res.json()
    const results = data.data || []

    if (results.length === 0) return null

    // Filter to common US exchanges for better relevance
    const usResults = results.filter(r =>
      ['NYSE', 'NASDAQ'].includes(r.exchange)
    )

    const pool = usResults.length > 0 ? usResults : results
    const top = pool[0]

    // Check for ambiguity
    if (pool.length >= 2) {
      const qLower = query.toLowerCase()
      const exactMatches = pool.filter(r =>
        r.instrument_name.toLowerCase().includes(qLower) ||
        r.symbol.toLowerCase() === qLower
      )

      if (exactMatches.length > 1) {
        return {
          suggestions: exactMatches.slice(0, 3).map(r => ({
            type: 'stock',
            target: r.symbol,
            displayName: `${r.instrument_name} (${r.exchange})`,
          })),
        }
      }
    }

    return {
      type: 'stock',
      target: top.symbol,
      displayName: `${top.instrument_name}`,
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('⏱️ Stock resolver timed out')
    } else {
      console.error('❌ Stock resolver error:', err.message)
    }
    return null
  }
}

// ─── Product Resolver (SerpAPI, 5s timeout) ──────────────────────────────

/**
 * Normalize a product name for consistent matching.
 * "Sony WH-1000XM5" → "sony wh1000xm5"
 */
export function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[-_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalize vague product queries into specific model names.
 * "latest iphone pro" → "iphone 16 pro"
 */
const LATEST_MODELS = {
  'iphone pro max': 'iphone 16 pro max',
  'iphone pro': 'iphone 16 pro',
  'iphone': 'iphone 16',
  'macbook pro': 'macbook pro m4',
  'macbook air': 'macbook air m4',
  'macbook': 'macbook air m4',
  'samsung galaxy ultra': 'samsung galaxy s25 ultra',
  'samsung galaxy': 'samsung galaxy s25',
  'galaxy ultra': 'galaxy s25 ultra',
  'galaxy': 'galaxy s25',
  'pixel': 'pixel 9',
  'pixel pro': 'pixel 9 pro',
  'ipad pro': 'ipad pro m4',
  'ipad air': 'ipad air m2',
  'ipad': 'ipad 10th gen',
  'apple watch': 'apple watch series 10',
  'airpods pro': 'airpods pro 2',
  'airpods': 'airpods 4',
  'playstation': 'playstation 5',
  'ps': 'ps5',
  'xbox': 'xbox series x',
}

export function normalizeProductQuery(query) {
  let q = query.toLowerCase().trim()

  // Strip filler words
  q = q.replace(/\b(latest|newest|current|new|recent|the)\b/gi, '').replace(/\s+/g, ' ').trim()

  // Match against known latest models (longest match first)
  const sorted = Object.entries(LATEST_MODELS).sort((a, b) => b[0].length - a[0].length)
  for (const [phrase, model] of sorted) {
    if (q === phrase || q.startsWith(phrase + ' ') || q.endsWith(' ' + phrase)) {
      q = q.replace(phrase, model)
      break
    }
  }

  return q
}

export async function resolveProduct(query) {
  const normalized = normalizeProductQuery(query)
  console.log(`   Product query normalized: "${query}" → "${normalized}"`)

  const apiKey = process.env.SERPAPI_KEY
  if (!apiKey) {
    // No SerpAPI key — still accept as product type (will skip in worker)
    return {
      type: 'product',
      target: normalizeProductName(normalized),
      displayName: normalized,
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(normalized)}&engine=google_shopping&api_key=${apiKey}&num=5`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (!res.ok) {
      return {
        type: 'product',
        target: normalizeProductName(normalized),
        displayName: normalized,
      }
    }

    const data = await res.json()
    const results = (data.shopping_results || [])
      .filter(r => r.extracted_price && r.extracted_price > 0)

    if (results.length === 0) {
      return {
        type: 'product',
        target: normalizeProductName(normalized),
        displayName: normalized,
      }
    }

    // Use the best match title and normalize the target
    const best = results[0]
    return {
      type: 'product',
      target: normalizeProductName(normalized),
      displayName: best.title || normalized,
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('⏱️ Product resolver timed out')
    } else {
      console.error('❌ Product resolver error:', err.message)
    }
    // Graceful: still accept as product
    return {
      type: 'product',
      target: normalizeProductName(normalized),
      displayName: normalized,
    }
  }
}

// ─── Pipeline Runner ─────────────────────────────────────────────────────

const STOCK_FILLER_WORDS = /\b(stock|stocks|share|shares|price|prices|equity|equities)\b/gi

/**
 * Run the full resolution pipeline.
 * @param {string} text - full user input text (for domain extraction)
 * @param {string} query - extracted target phrase from LLM
 * @returns {object|null} - resolved asset or { suggestions } or null
 */
export async function runResolverPipeline(text, query) {
  // Stage 1: Domain (instant, deterministic)
  const domainResult = resolveDomain(text)
  if (domainResult) return domainResult

  // Detect if user is asking about stocks specifically
  const isStockQuery = STOCK_FILLER_WORDS.test(query)

  // Clean stock-related filler words from query for better API matching
  const cleanedQuery = query.replace(STOCK_FILLER_WORDS, '').replace(/\s+/g, ' ').trim() || query
  console.log(`   Resolver query: "${query}" → cleaned: "${cleanedQuery}"${isStockQuery ? ' (stock intent detected)' : ''}`)

  // Stage 2: Crypto
  const cryptoResult = await resolveCrypto(cleanedQuery)
  if (cryptoResult) return cryptoResult

  // Stage 3: Stock
  const stockResult = await resolveStock(cleanedQuery)
  if (stockResult) return stockResult

  // Stage 4: Product (skip if query had stock-related words)
  if (isStockQuery) {
    console.log('   ⏭️ Skipping product resolver — stock intent detected')
    return null
  }

  const productResult = await resolveProduct(cleanedQuery)
  if (productResult) return productResult

  return null
}
