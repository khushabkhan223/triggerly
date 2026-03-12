import StatusBadge from './StatusBadge'

const TYPE_ICONS = {
  crypto: { emoji: '₿', bg: 'bg-yellow-500/10' },
  stock: { emoji: '📈', bg: 'bg-green-500/10' },
  domain: { emoji: '🌐', bg: 'bg-purple-500/10' },
}

export default function TriggerTable({ triggers, onPause, onResume, onDelete, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
        <div className="p-6 flex items-center justify-between border-b border-white/[0.04]">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-5 w-20" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="px-6 py-4 flex items-center justify-between border-b border-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="skeleton w-8 h-8 rounded-lg" />
              <div>
                <div className="skeleton h-4 w-40 mb-2" />
                <div className="skeleton h-3 w-28" />
              </div>
            </div>
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!triggers || triggers.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(0, 255, 156, 0.05)' }}>
          <svg className="w-8 h-8 text-neon-green opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No triggers yet</h3>
        <p className="text-sm text-muted">Create your first trigger to start monitoring the internet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
        <span className="text-sm font-medium text-gray-400">Your Triggers</span>
        <span className="text-xs text-gray-600">{triggers.length} trigger{triggers.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Rows */}
      {triggers.map((trigger) => {
        const icon = TYPE_ICONS[trigger.type] || TYPE_ICONS.crypto
        const condStr = trigger.type === 'domain'
          ? 'becomes available'
          : `${trigger.condition === '<' ? 'below' : 'above'} $${Number(trigger.value).toLocaleString()}`

        return (
          <div
            key={trigger.id}
            className="flex items-center justify-between px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${icon.bg}`}>
                <span className="text-sm">{icon.emoji}</span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-white text-sm truncate">{trigger.name}</p>
                <p className="text-xs text-muted truncate">{trigger.target} {condStr}</p>
              </div>
            </div>

            <div className="hidden sm:block text-xs text-muted px-4">
              Every {trigger.frequency}s
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={trigger.status} />

              {/* Actions (show on hover) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {trigger.status === 'active' || trigger.status === 'cooldown' ? (
                  <button
                    onClick={() => onPause(trigger.id)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                    title="Pause"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => onResume(trigger.id)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                    title="Resume"
                  >
                    <svg className="w-4 h-4 text-neon-green" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => onDelete(trigger.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
