import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { supabase } from '../lib/supabase.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// GET /api/alerts — List user's alerts
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50)

    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        triggers (name, type, target, condition, value)
      `)
      .eq('user_id', req.user.id)
      .order('triggered_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/alerts/stats — Dashboard metrics
router.get('/stats', async (req, res) => {
  try {
    // Count active triggers
    const { count: activeTriggers, error: e1 } = await supabase
      .from('triggers')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('status', 'active')

    if (e1) throw e1

    // Count total alerts
    const { count: totalAlerts, error: e2 } = await supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)

    if (e2) throw e2

    // Count alerts in last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentAlerts, error: e3 } = await supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .gte('triggered_at', yesterday)

    if (e3) throw e3

    res.json({
      activeTriggers: activeTriggers || 0,
      totalAlerts: totalAlerts || 0,
      recentAlerts: recentAlerts || 0,
      avgResponse: '1.2s', // Placeholder — would come from actual monitoring metrics
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
