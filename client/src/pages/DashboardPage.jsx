import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import MetricCard from '../components/MetricCard'
import TriggerTable from '../components/TriggerTable'
import AlertList from '../components/AlertList'
import CreateTriggerModal from '../components/CreateTriggerModal'
import { api } from '../lib/api'

export default function DashboardPage() {
  const [triggers, setTriggers] = useState([])
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = useCallback(async () => {
    try {
      const [triggersData, alertsData, statsData] = await Promise.all([
        api.getTriggers(),
        api.getAlerts(),
        api.getStats(),
      ])
      setTriggers(triggersData)
      setAlerts(alertsData)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      showToast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleCreate = async (triggerData) => {
    const data = await api.createTrigger(triggerData)
    setTriggers(prev => [data, ...prev])
    showToast('Trigger created successfully')
    fetchData() // Refresh stats
  }

  const handlePause = async (id) => {
    try {
      await api.updateTrigger(id, { status: 'paused' })
      setTriggers(prev => prev.map(t => t.id === id ? { ...t, status: 'paused' } : t))
      showToast('Trigger paused')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleResume = async (id) => {
    try {
      await api.updateTrigger(id, { status: 'active' })
      setTriggers(prev => prev.map(t => t.id === id ? { ...t, status: 'active', cooldown_until: null } : t))
      showToast('Trigger resumed')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteTrigger(id)
      setTriggers(prev => prev.filter(t => t.id !== id))
      showToast('Trigger deleted')
      fetchData() // Refresh stats
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-24 pb-16">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 page-enter">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-muted mt-1">Monitor your triggers and alerts</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Trigger
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 page-enter" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <>
              <div className="metric-card"><div className="skeleton h-4 w-24 mb-2" /><div className="skeleton h-8 w-16" /></div>
              <div className="metric-card"><div className="skeleton h-4 w-24 mb-2" /><div className="skeleton h-8 w-16" /></div>
              <div className="metric-card"><div className="skeleton h-4 w-24 mb-2" /><div className="skeleton h-8 w-16" /></div>
            </>
          ) : (
            <>
              <MetricCard
                label="Active Triggers"
                value={stats?.activeTriggers ?? 0}
                change={stats?.activeTriggers > 0 ? `${stats.activeTriggers} monitoring` : null}
              />
              <MetricCard
                label="Alerts Triggered"
                value={stats?.totalAlerts ?? 0}
                change={stats?.recentAlerts > 0 ? `↑ ${stats.recentAlerts} today` : null}
                changeColor="text-accent-purple-light"
              />
              <MetricCard
                label="Avg Response"
                value={stats?.avgResponse ?? '—'}
                change="~99.9% uptime"
                changeColor="text-gray-500"
              />
            </>
          )}
        </div>

        {/* Triggers + Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-enter" style={{ animationDelay: '0.2s' }}>
          {/* Triggers Table (2/3 width) */}
          <div className="lg:col-span-2">
            <TriggerTable
              triggers={triggers}
              onPause={handlePause}
              onResume={handleResume}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>

          {/* Alerts List (1/3 width) */}
          <div>
            <AlertList alerts={alerts} loading={loading} />
          </div>
        </div>
      </main>

      {/* Create Trigger Modal */}
      <CreateTriggerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
