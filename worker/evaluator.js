/**
 * Condition evaluator
 * Evaluates trigger conditions against fetched data
 */

export function evaluateTriggers(triggers, priceData, domainData) {
  const triggered = []

  for (const trigger of triggers) {
    let currentValue = null
    let fired = false

    if (trigger.type === 'domain') {
      // Domain: value is 1 (available), check if domain is available
      const isAvailable = domainData[trigger.target]
      if (isAvailable) {
        currentValue = 1
        fired = true
      } else {
        currentValue = 0
      }
    } else {
      // Crypto, stock, or product: compare price against threshold
      currentValue = priceData[trigger.target]
      if (currentValue == null) continue // No data for this asset

      if (trigger.condition === '<' && currentValue < trigger.value) {
        fired = true
      } else if (trigger.condition === '>' && currentValue > trigger.value) {
        fired = true
      }
    }

    if (fired) {
      triggered.push({
        trigger,
        value_detected: currentValue,
      })
    }
  }

  return triggered
}
