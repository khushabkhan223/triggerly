/**
 * TwelveData stock price fetcher
 * Gracefully skips if API key is not configured
 */

export async function fetchStockPrices(symbols) {
  const apiKey = process.env.TWELVEDATA_API_KEY

  if (!apiKey) {
    console.log('⚠️ TWELVEDATA_API_KEY not set — skipping stock triggers')
    return {}
  }

  if (symbols.length === 0) return {}

  try {
    const symbolList = symbols.join(',')
    const url = `https://api.twelvedata.com/price?symbol=${symbolList}&apikey=${apiKey}`
    const res = await fetch(url)

    if (!res.ok) {
      console.error(`❌ TwelveData API error: ${res.status}`)
      return {}
    }

    const data = await res.json()
    const prices = {}

    // Single symbol response is { price: "123.45" }
    // Multiple symbols response is { TSLA: { price: "123" }, AAPL: { price: "456" } }
    if (symbols.length === 1) {
      if (data.price) {
        prices[symbols[0]] = parseFloat(data.price)
      }
    } else {
      for (const symbol of symbols) {
        if (data[symbol]?.price) {
          prices[symbol] = parseFloat(data[symbol].price)
        }
      }
    }

    return prices
  } catch (err) {
    console.error('❌ TwelveData fetch failed:', err.message)
    return {}
  }
}
