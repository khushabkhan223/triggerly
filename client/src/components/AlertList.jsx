export default function AlertList({ alerts, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-6 py-4 border-b border-white/[0.04]">
          <div className="skeleton h-4 w-28" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="px-6 py-4 border-b border-white/[0.03]">
            <div className="skeleton h-4 w-48 mb-2" />
            <div className="skeleton h-3 w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="px-6 py-4 border-b border-white/[0.04]">
        <span className="text-sm font-medium text-gray-400">Recent Alerts</span>
      </div>

      {(!alerts || alerts.length === 0) ? (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-gray-600">No alerts yet. Triggers will appear here when conditions are met.</p>
        </div>
      ) : (
        alerts.map((alert) => {
          const trigger = alert.triggers
          const timeAgo = getTimeAgo(alert.triggered_at)
          const valueStr = trigger?.type === 'domain' ? 'Available' : `$${Number(alert.value_detected).toLocaleString()}`

          return (
            <div
              key={alert.id}
              className="flex items-center justify-between px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate">
                  {trigger?.name || 'Unknown trigger'}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Detected: <span className="text-neon-green">{valueStr}</span> · {timeAgo}
                </p>
              </div>
              <span className="status-badge status-triggered">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                Triggered
              </span>
            </div>
          )
        })
      )}
    </div>
  )
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
