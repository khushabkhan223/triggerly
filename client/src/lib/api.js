import { supabase } from './supabase'

const API_BASE = 'https://triggerly-api.onrender.com/api'

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  }
}

async function request(path, options = {}) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  // Triggers
  getTriggers: () => request('/triggers'),
  createTrigger: (data) => request('/triggers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTrigger: (id, data) => request(`/triggers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteTrigger: (id) => request(`/triggers/${id}`, {
    method: 'DELETE',
  }),

  // Alerts
  getAlerts: (limit = 20) => request(`/alerts?limit=${limit}`),
  getStats: () => request('/alerts/stats'),

  // AI Resolution
  resolveAsset: (text) => request('/resolve', {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
}
