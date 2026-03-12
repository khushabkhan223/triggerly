/**
 * Lightweight local intent extractor
 * Runs instantly on keystroke — extracts condition and value only.
 * Full asset resolution happens server-side via /api/resolve.
 */

// ─── Input Sanitization ──────────────────────────────────────────────

export function sanitizeInput(input) {
  let clean = input.replace(/<[^>]*>/g, '')
  clean = clean.slice(0, 200).trim()
  return clean
}

// ─── Value Parsing ───────────────────────────────────────────────────

function parseValue(str) {
  let cleaned = str.replace(/[₹$€£,]/g, '').trim()
  const multiplier = cleaned.toLowerCase().endsWith('k') ? 1000
    : cleaned.toLowerCase().endsWith('m') ? 1000000
    : 1
  cleaned = cleaned.replace(/[kKmM]$/, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num * multiplier
}

// ─── Condition Detection ─────────────────────────────────────────────

const BELOW_WORDS = ['below', 'under', 'less than', 'lower than', 'drops below', 'falls below', 'goes below', 'drops under', 'dips below', 'dips under']
const ABOVE_WORDS = ['above', 'over', 'more than', 'higher than', 'goes above', 'rises above', 'reaches', 'hits', 'exceeds']

// ─── Domain Detection ────────────────────────────────────────────────

const DOMAIN_REGEX = /([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.(?:com|net|org|io|ai|co|dev|app|xyz|me|info|biz))\b/i

// ─── Main Extractor ──────────────────────────────────────────────────

/**
 * Extract intent locally (instant, no API call).
 * Returns partial data for immediate preview — the server resolves the asset type.
 */
export function extractIntent(rawInput) {
  const input = sanitizeInput(rawInput)
  if (!input) return null

  const lower = input.toLowerCase()

  // Domain detection — instant, no condition/value needed
  const domainMatch = input.match(DOMAIN_REGEX)
  if (domainMatch && (lower.includes('available') || lower.includes('domain') || lower.includes('register'))) {
    return {
      isDomain: true,
      target: domainMatch[1].toLowerCase().replace(/[?.!,;]+$/, ''),
      condition: '<',
      value: 1,
    }
  }

  // Condition detection
  let condition = null
  for (const w of BELOW_WORDS) { if (lower.includes(w)) { condition = '<'; break } }
  if (!condition) for (const w of ABOVE_WORDS) { if (lower.includes(w)) { condition = '>'; break } }
  if (!condition) return null

  // Extract value from text AFTER the condition keyword to avoid model numbers
  const allCondWords = [...BELOW_WORDS, ...ABOVE_WORDS]
  let condPos = -1
  let condWord = ''
  for (const w of allCondWords) {
    const idx = lower.indexOf(w)
    if (idx !== -1 && (condPos === -1 || idx < condPos)) {
      condPos = idx
      condWord = w
    }
  }

  const afterCondition = condPos !== -1 ? input.slice(condPos + condWord.length) : input
  const valueMatch = afterCondition.match(/[$₹€£]?\s*[\d,]+\.?\d*\s*[kKmM]?/)
  if (!valueMatch) return null
  const value = parseValue(valueMatch[0])
  if (!value || value <= 0) return null

  return {
    isDomain: false,
    condition,
    value,
  }
}
