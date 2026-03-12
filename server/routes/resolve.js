/**
 * POST /api/resolve
 * AI-powered trigger resolution endpoint.
 * 1. Check for domain in input (bypass LLM)
 * 2. Check cache
 * 3. Parse intent with Gemini Flash
 * 4. Run resolver pipeline
 * 5. Cache result
 */

import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { parseIntent } from '../lib/llm.js'
import { resolveDomain, runResolverPipeline } from '../lib/resolvers.js'
import { getCached, setCache, normalizeCacheKey } from '../lib/resolverCache.js'

const router = Router()
router.use(authenticate)

// Input sanitization
function sanitize(input) {
  let clean = String(input || '').replace(/<[^>]*>/g, '').slice(0, 200).trim()
  return clean
}

// Parse value from shorthand
function parseShorthandValue(str) {
  if (!str) return null
  let cleaned = String(str).replace(/[₹$€£,]/g, '').trim()
  const multiplier = cleaned.toLowerCase().endsWith('k') ? 1000
    : cleaned.toLowerCase().endsWith('m') ? 1000000
    : 1
  cleaned = cleaned.replace(/[kKmM]$/, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num * multiplier
}

// Simple regex fallback parser (if LLM fails)
function regexParse(text) {
  const lower = text.toLowerCase()

  const belowWords = ['below', 'under', 'less than', 'lower than', 'drops below', 'falls below', 'dips below', 'goes below', 'drops under']
  const aboveWords = ['above', 'over', 'more than', 'higher than', 'goes above', 'rises above', 'reaches', 'hits', 'exceeds']

  let condition = null
  for (const w of belowWords) { if (lower.includes(w)) { condition = '<'; break } }
  if (!condition) for (const w of aboveWords) { if (lower.includes(w)) { condition = '>'; break } }
  if (!condition) return null

  // Find the position of the condition keyword and extract value from text AFTER it
  // This prevents grabbing model numbers like "141" from "airdopes 141"
  const conditionWords = [...belowWords, ...aboveWords]
  let condPos = -1
  let condWord = ''
  for (const w of conditionWords) {
    const idx = lower.indexOf(w)
    if (idx !== -1 && (condPos === -1 || idx < condPos)) {
      condPos = idx
      condWord = w
    }
  }

  const afterCondition = condPos !== -1 ? text.slice(condPos + condWord.length) : text
  const valueMatch = afterCondition.match(/[$₹€£]?\s*[\d,]+\.?\d*\s*[kKmM]?/)
  if (!valueMatch) return null
  const value = parseShorthandValue(valueMatch[0])
  if (!value || value <= 0) return null

  // Extract target: everything between "if/when" and the condition word
  const targetMatch = lower.match(/(?:if|when)\s+(.+?)(?:drops|falls|dips|goes|rises|reaches|hits|exceeds|below|under|above|over|less|more|lower|higher)/)
  const target = targetMatch ? targetMatch[1].trim() : lower.split(/\s+(below|above|under|over|drops|falls|goes)\s+/)[0].trim()

  return { target, condition, value }
}

router.post('/', async (req, res) => {
  try {
    const text = sanitize(req.body.text)
    if (!text || text.length < 5) {
      return res.status(400).json({ error: 'Input too short. Describe what you want to monitor.' })
    }

    // ─── Step 1: Domain bypass (skip LLM entirely) ───────────────
    const domainResult = resolveDomain(text)
    if (domainResult) {
      setCache(domainResult.target, domainResult)
      return res.json({
        intent: { target: domainResult.target, condition: '<', value: 1 },
        resolved: domainResult,
        name: `${domainResult.target} availability`,
      })
    }

    // ─── Step 2: Parse intent (LLM or regex fallback) ────────────
    let intent = await parseIntent(text)

    if (!intent) {
      intent = regexParse(text)
    }

    if (!intent) {
      return res.status(400).json({
        error: 'Could not understand your trigger. Try something like "Alert me if Bitcoin drops below $50k"',
      })
    }

    // ─── Step 3: Check cache ─────────────────────────────────────
    const cached = getCached(intent.target)
    if (cached) {
      const condStr = intent.condition === '<' ? 'below' : 'above'
      const name = `${cached.target} ${condStr} $${intent.value.toLocaleString()}`
      return res.json({ intent, resolved: cached, name, cached: true })
    }

    // ─── Step 4: Run resolver pipeline ───────────────────────────
    const result = await runResolverPipeline(text, intent.target)

    if (!result) {
      return res.status(422).json({
        error: 'Could not identify the asset. Try specifying a clearer crypto name, stock name, domain, or product.',
      })
    }

    // ─── Step 5: Ambiguity — return suggestions ──────────────────
    if (result.suggestions) {
      return res.json({ intent, suggestions: result.suggestions })
    }

    // ─── Step 6: Cache + return ──────────────────────────────────
    setCache(intent.target, result)

    const condStr = intent.condition === '<' ? 'below' : 'above'
    const name = result.type === 'domain'
      ? `${result.target} availability`
      : `${result.target} ${condStr} $${intent.value.toLocaleString()}`

    return res.json({ intent, resolved: result, name })

  } catch (err) {
    console.error('❌ Resolve error:', err)
    res.status(500).json({ error: 'Internal resolution error. Please try again.' })
  }
})

export default router
