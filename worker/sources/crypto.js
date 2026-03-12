/**
 * CoinGecko crypto price fetcher
 * Fetches prices once per unique asset, not per trigger
 */

// Map trigger targets to CoinGecko IDs
const COINGECKO_IDS = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'XRP': 'ripple',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LTC': 'litecoin',
  'BNB': 'binancecoin',
}

export async function fetchCryptoPrices(symbols) {
  const ids = symbols
    .map(s => COINGECKO_IDS[s])
    .filter(Boolean)

  if (ids.length === 0) return {}

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`

  // Attempt with one retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        if (attempt === 0) {
          console.log('⚠️ CoinGecko request failed, retrying in 2s...')
          await new Promise(r => setTimeout(r, 2000))
          continue
        }
        throw new Error(`CoinGecko API error: ${res.status}`)
      }

      const data = await res.json()
      const prices = {}

      // Map back to our symbol format
      for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
        if (data[geckoId]?.usd != null) {
          prices[symbol] = data[geckoId].usd
        }
      }

      return prices
    } catch (err) {
      if (attempt === 1) {
        console.error('❌ CoinGecko fetch failed after retry:', err.message)
        return {}
      }
    }
  }

  return {}
}
