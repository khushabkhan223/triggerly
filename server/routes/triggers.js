import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { supabase } from '../lib/supabase.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// GET /api/triggers — List user's triggers
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('triggers')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/triggers — Create a new trigger
router.post('/', async (req, res) => {
  try {
    const { type, target, condition, value, name, frequency, source_id } = req.body

    // Validate required fields
    if (!type || !target || !condition || value == null || !name) {
      return res.status(400).json({ error: 'Missing required fields: type, target, condition, value, name' })
    }

    // Validate type
    if (!['crypto', 'stock', 'domain', 'product'].includes(type)) {
      return res.status(400).json({ error: 'Invalid trigger type. Must be: crypto, stock, domain, or product' })
    }

    // Validate condition
    if (!['<', '>'].includes(condition)) {
      return res.status(400).json({ error: 'Invalid condition. Must be: < or >' })
    }

    // Validate value
    if (typeof value !== 'number' || value <= 0) {
      return res.status(400).json({ error: 'Value must be a positive number' })
    }

    // Sanitize name (strip HTML, limit length)
    const sanitizedName = name.replace(/<[^>]*>/g, '').slice(0, 200).trim()

    // Sanitize target (alphanumeric + dots only)
    const sanitizedTarget = target.replace(/[^a-zA-Z0-9.]/g, '').slice(0, 50)

    // Check 50 trigger limit
    const { count, error: countError } = await supabase
      .from('triggers')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)

    if (countError) throw countError

    if (count >= 50) {
      return res.status(403).json({ error: 'Maximum 50 triggers per user. Delete existing triggers to create new ones.' })
    }

    // Insert trigger
    const { data, error } = await supabase
      .from('triggers')
      .insert({
        user_id: req.user.id,
        type,
        target: sanitizedTarget,
        condition,
        value,
        name: sanitizedName,
        frequency: frequency || 30,
        status: 'active',
        next_check: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/triggers/:id — Update trigger status (pause/resume)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'paused'].includes(status)) {
      return res.status(400).json({ error: 'Status must be: active or paused' })
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('triggers')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Trigger not found' })
    }

    const updateData = { status }
    if (status === 'active') {
      updateData.next_check = new Date().toISOString()
      updateData.cooldown_until = null
    }

    const { data, error } = await supabase
      .from('triggers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/triggers/:id — Delete a trigger
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('triggers')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Trigger not found' })
    }

    const { error } = await supabase
      .from('triggers')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
