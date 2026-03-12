/**
 * Gemini 2.5 Flash Intent Parser — Structured Output
 * Uses responseSchema to force pure JSON output from the model.
 * Does NOT guess asset types or symbols — only extracts raw target phrase.
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

let model = null

function getModel() {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not set — LLM parsing disabled, falling back to regex')
      return null
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            target: { type: SchemaType.STRING },
            condition: { type: SchemaType.STRING },
            value: { type: SchemaType.NUMBER },
          },
          required: ['target', 'condition', 'value'],
        },
        temperature: 0,
        maxOutputTokens: 200,
      },
    })
    console.log('✅ Triggerly AI parser initialized with Gemini 2.5 Flash (structured output)')
  }
  return model
}

const SYSTEM_PROMPT = `You are a trigger intent parser for an automation system.

Extract the trigger intent and return ONLY valid JSON.
Do not include explanations or additional text.

Return this exact structure:
{"target": string, "condition": "<" or ">", "value": number}

Rules:
- target: the asset name, company name, crypto name, domain, or product name (lowercase, no symbols)
- condition: "<" for below/under/drops/falls/dips/cheaper OR ">" for above/over/rises/exceeds/hits
- value: the numeric threshold (convert shorthand: 50k=50000, 1m=1000000)
- Do NOT guess ticker symbols (e.g. do NOT convert "tesla" to "TSLA")
- Do NOT guess asset type (crypto, stock, domain, product)
- Extract the VALUE from the price threshold, NOT from model numbers in product names
- For "boat airdopes 141 below ₹900", the value is 900, NOT 141
- For domain availability triggers with no price, use condition "<" and value 1

Examples:
Input: "Alert me if Tesla drops below $200"
Output: {"target":"tesla","condition":"<","value":200}

Input: "Notify me if Nvidia goes above 900"
Output: {"target":"nvidia","condition":">","value":900}

Input: "Tell me when Bitcoin dips under 50k"
Output: {"target":"bitcoin","condition":"<","value":50000}

Input: "Alert me if Sony WH1000XM5 drops below $300"
Output: {"target":"sony wh1000xm5","condition":"<","value":300}

Input: "tell me when boat airdopes 141 goes below ₹900"
Output: {"target":"boat airdopes 141","condition":"<","value":900}

Input: "Alert me if Tesla becomes cheaper than 200"
Output: {"target":"tesla","condition":"<","value":200}`

// ─── Input Preprocessing ─────────────────────────────────────────────

function preprocess(input) {
  let clean = String(input || '')
    .replace(/<[^>]*>/g, '')     // Strip HTML
    .trim()
    .slice(0, 200)               // Limit to 200 chars
  // Normalize currency shorthand
  clean = clean.replace(/(\d+)k\b/gi, (_, n) => String(Number(n) * 1000))
  clean = clean.replace(/(\d+)m\b/gi, (_, n) => String(Number(n) * 1000000))
  return clean
}

/**
 * Make a single Gemini call with timeout.
 */
async function callGemini(llm, sanitized) {
  const result = await Promise.race([
    llm.generateContent(`${SYSTEM_PROMPT}\n\nInput: "${sanitized}"`),
    new Promise((_, reject) => setTimeout(() => reject(new Error('LLM timeout (5s)')), 5000)),
  ])
  return result.response.text().trim()
}

/**
 * Parse user text into structured intent using Gemini 2.5 Flash.
 * Retries once if the response looks incomplete.
 * @param {string} text - raw user input
 * @returns {{ target: string, condition: string, value: number } | null}
 */
export async function parseIntent(text) {
  const llm = getModel()
  if (!llm) return null

  const sanitized = preprocess(text)
  console.log('🤖 Triggerly AI parser running with Gemini 2.5 Flash')
  console.log('   User text:', sanitized)

  let attempts = 0
  const maxAttempts = 2

  while (attempts < maxAttempts) {
    attempts++
    try {
      const responseText = await callGemini(llm, sanitized)
      console.log(`   Gemini raw response (attempt ${attempts}):`, responseText)

      // Guard: detect obviously incomplete responses
      if (responseText.length < 10 || !responseText.includes('target') || !responseText.includes('value')) {
        console.warn(`⚠️ Gemini response looks incomplete (attempt ${attempts})`)
        if (attempts < maxAttempts) {
          console.log('   Retrying Gemini...')
          continue
        }
        console.warn('   Gemini parser failed — falling back to regex parser')
        return null
      }

      const parsed = JSON.parse(responseText)

      // Validate target exists
      if (!parsed.target) {
        console.warn('⚠️ Gemini returned no target')
        console.warn('   Gemini parser failed — falling back to regex parser')
        return null
      }

      // Validate condition
      if (!['<', '>'].includes(parsed.condition)) {
        console.warn('⚠️ Gemini returned invalid condition:', parsed.condition)
        console.warn('   Gemini parser failed — falling back to regex parser')
        return null
      }

      // Validate value is numeric
      const numValue = Number(parsed.value)
      if (isNaN(numValue) || numValue <= 0) {
        console.warn('⚠️ Gemini returned invalid value:', parsed.value)
        console.warn('   Gemini parser failed — falling back to regex parser')
        return null
      }

      const intent = {
        target: String(parsed.target).toLowerCase().trim(),
        condition: parsed.condition === '>' ? '>' : '<',
        value: numValue,
      }

      console.log('   ✅ Gemini parsed intent:', JSON.stringify(intent))
      return intent

    } catch (err) {
      console.error(`❌ Gemini parse error (attempt ${attempts}):`, err.message)
      if (attempts < maxAttempts) {
        console.log('   Retrying Gemini...')
        continue
      }
      console.warn('   Gemini parser failed — falling back to regex parser')
      return null
    }
  }

  return null
}
