/**
 * Triggerly Background Worker
 * Runs every 30 seconds, fetches data grouped by asset, evaluates triggers,
 * creates alerts, and sends notifications.
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })
import { createClient } from '@supabase/supabase-js'
import { fetchCryptoPrices } from './sources/crypto.js'
import { fetchStockPrices } from './sources/stocks.js'
import { checkDomainAvailability } from './sources/domains.js'
import { fetchProductPrices } from './sources/products.js'
import { evaluateTriggers } from './evaluator.js'
import { sendAlertEmail } from './notifier.js'
import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Triggerly worker running");
});

app.listen(PORT, () => {
  console.log(`Worker health server running on port ${PORT}`);
});

const POLL_INTERVAL = 30_000 // 30 seconds
const MAX_TRIGGERS_PER_CYCLE = 1000
const COOLDOWN_MINUTES = 10

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runCycle() {
  const now = new Date().toISOString()
  console.log(`\n🔄 [${new Date().toLocaleTimeString()}] Starting monitoring cycle...`)

  try {
    // 1. Load eligible triggers
    const { data: triggers, error } = await supabase
      .from('triggers')
      .select('*')
      .eq('status', 'active')
      .lte('next_check', now)
      .or('cooldown_until.is.null,cooldown_until.lte.' + now)
      .limit(MAX_TRIGGERS_PER_CYCLE)

    if (error) {
      console.error('❌ Failed to load triggers:', error.message)
      return
    }

    if (!triggers || triggers.length === 0) {
      console.log('  No triggers to process')
      return
    }

    console.log(`  Found ${triggers.length} eligible trigger(s)`)

    // 2. Group triggers by (type, target)
    const groups = {}
    for (const trigger of triggers) {
      const key = `${trigger.type}:${trigger.target}`
      if (!groups[key]) groups[key] = []
      groups[key].push(trigger)
    }

    // 3. Fetch data once per unique asset
    const cryptoSymbols = [...new Set(triggers.filter(t => t.type === 'crypto').map(t => t.target))]
    const stockSymbols = [...new Set(triggers.filter(t => t.type === 'stock').map(t => t.target))]
    const domainNames = [...new Set(triggers.filter(t => t.type === 'domain').map(t => t.target))]
    const productNames = [...new Set(triggers.filter(t => t.type === 'product').map(t => t.target))]

    const [cryptoPrices, stockPrices, domainStatus, productPrices] = await Promise.all([
      cryptoSymbols.length > 0 ? fetchCryptoPrices(cryptoSymbols) : {},
      stockSymbols.length > 0 ? fetchStockPrices(stockSymbols) : {},
      domainNames.length > 0 ? checkDomainAvailability(domainNames) : {},
      productNames.length > 0 ? fetchProductPrices(productNames) : {},
    ])

    const allPrices = { ...cryptoPrices, ...stockPrices, ...productPrices }

    if (Object.keys(cryptoPrices).length > 0) {
      console.log('  📊 Crypto prices:', Object.entries(cryptoPrices).map(([k, v]) => `${k}: $${v.toLocaleString()}`).join(', '))
    }
    if (Object.keys(stockPrices).length > 0) {
      console.log('  📈 Stock prices:', Object.entries(stockPrices).map(([k, v]) => `${k}: $${v}`).join(', '))
    }
    if (Object.keys(domainStatus).length > 0) {
      console.log('  🌐 Domain status:', Object.entries(domainStatus).map(([k, v]) => `${k}: ${v ? 'available' : 'taken'}`).join(', '))
    }
    if (Object.keys(productPrices).length > 0) {
      console.log('  🛒 Product prices:', Object.entries(productPrices).map(([k, v]) => `${k}: $${v.toLocaleString()}`).join(', '))
    }

    // 4. Evaluate all triggers
    const triggered = evaluateTriggers(triggers, allPrices, domainStatus)

    if (triggered.length > 0) {
      console.log(`  🔔 ${triggered.length} trigger(s) fired!`)

      for (const { trigger, value_detected } of triggered) {
        // 5. Insert alert
        const { error: alertError } = await supabase
          .from('alerts')
          .insert({
            trigger_id: trigger.id,
            user_id: trigger.user_id,
            value_detected,
          })

        if (alertError) {
          console.error(`  ❌ Failed to insert alert for "${trigger.name}":`, alertError.message)
          continue
        }

        // 6. Get user email for notification
        const { data: userData } = await supabase.auth.admin.getUserById(trigger.user_id)
        if (userData?.user?.email) {
          await sendAlertEmail(userData.user.email, trigger, value_detected)
        }

        // 7. Apply 10-minute cooldown
        const cooldownUntil = new Date(Date.now() + COOLDOWN_MINUTES * 60 * 1000).toISOString()
        await supabase
          .from('triggers')
          .update({
            status: 'cooldown',
            cooldown_until: cooldownUntil,
            last_checked: now,
            next_check: cooldownUntil,
          })
          .eq('id', trigger.id)

        console.log(`  ✅ Alert created for "${trigger.name}" (cooldown until ${new Date(cooldownUntil).toLocaleTimeString()})`)
      }
    } else {
      console.log('  No conditions met')
    }

    // 8. Update last_checked and next_check for non-triggered triggers
    const triggerIds = triggers.map(t => t.id)
    const triggeredIds = new Set(triggered.map(t => t.trigger.id))
    const unTriggeredIds = triggerIds.filter(id => !triggeredIds.has(id))

    if (unTriggeredIds.length > 0) {
      const nextCheck = new Date(Date.now() + POLL_INTERVAL).toISOString()
      await supabase
        .from('triggers')
        .update({ last_checked: now, next_check: nextCheck })
        .in('id', unTriggeredIds)
    }

    // 9. Re-activate triggers whose cooldown has expired
    await supabase
      .from('triggers')
      .update({ status: 'active', cooldown_until: null })
      .eq('status', 'cooldown')
      .lte('cooldown_until', now)

  } catch (err) {
    console.error('❌ Worker cycle error:', err.message)
  }
}

// Start the worker loop
console.log('⚡ Triggerly Worker started')
console.log(`  Polling every ${POLL_INTERVAL / 1000}s`)
console.log(`  Max triggers per cycle: ${MAX_TRIGGERS_PER_CYCLE}`)
console.log(`  Cooldown: ${COOLDOWN_MINUTES} minutes\n`)

runCycle()
setInterval(runCycle, POLL_INTERVAL)
