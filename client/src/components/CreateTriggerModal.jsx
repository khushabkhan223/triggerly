import { useState, useRef, useCallback, useEffect } from 'react'
import { extractIntent } from '../lib/parser'
import { api } from '../lib/api'

export default function CreateTriggerModal({ isOpen, onClose, onCreate }) {
  const [input, setInput] = useState('')
  const [localIntent, setLocalIntent] = useState(null)
  const [resolved, setResolved] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [resolving, setResolving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInput('')
      setLocalIntent(null)
      setResolved(null)
      setSuggestions(null)
      setResolving(false)
      setLoading(false)
      setError('')
    }
  }, [isOpen])

  // Debounced server-side resolution
  const resolveAsync = useCallback((text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    setResolved(null)
    setSuggestions(null)
    setError('')

    if (text.trim().length < 8) {
      setResolving(false)
      return
    }

    setResolving(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await api.resolveAsset(text)

        if (result.error) {
          setError(result.error)
          setResolved(null)
          setSuggestions(null)
        } else if (result.suggestions) {
          setSuggestions(result.suggestions)
          setResolved(null)
        } else {
          setResolved(result)
          setSuggestions(null)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setResolving(false)
      }
    }, 800)
  }, [])

  const handleInputChange = (value) => {
    setInput(value)
    setError('')

    // Instant local preview
    if (value.trim().length > 5) {
      const intent = extractIntent(value)
      setLocalIntent(intent)
    } else {
      setLocalIntent(null)
      setResolved(null)
      setSuggestions(null)
    }

    // Debounced server resolution
    resolveAsync(value)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSuggestions(null)
    const condStr = localIntent?.condition === '<' ? 'below' : 'above'
    const name = suggestion.type === 'domain'
      ? `${suggestion.target} availability`
      : `${suggestion.target} ${condStr} $${(localIntent?.value || 0).toLocaleString()}`

    setResolved({
      intent: { target: suggestion.target, condition: localIntent?.condition, value: localIntent?.value },
      resolved: suggestion,
      name,
    })
  }

  const handleSubmit = async () => {
    if (!resolved?.resolved) {
      setError('Wait for asset resolution to complete, or select a suggestion.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onCreate({
        type: resolved.resolved.type,
        target: resolved.resolved.target,
        condition: resolved.intent?.condition || localIntent?.condition,
        value: resolved.intent?.value || localIntent?.value,
        name: resolved.name,
        source_id: resolved.resolved.source_id || null,
      })
      setInput('')
      setLocalIntent(null)
      setResolved(null)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const hasResolvedAsset = resolved?.resolved != null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content page-enter" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Trigger</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="text-xs text-gray-500 font-medium mb-2 block">
            Describe what to watch — in plain English
          </label>
          <input
            type="text"
            className="input-glass"
            placeholder='e.g. "Alert me if Bitcoin drops below $50k"'
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && hasResolvedAsset && handleSubmit()}
            maxLength={200}
            autoFocus
          />
          <p className="text-xs text-gray-600 mt-2">{input.length}/200 characters</p>
        </div>

        {/* Resolving Spinner */}
        {resolving && (
          <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl" style={{ background: 'rgba(0, 255, 156, 0.04)', border: '1px solid rgba(0, 255, 156, 0.1)' }}>
            <div className="w-4 h-4 rounded-full border-2 border-neon-green/30 border-t-neon-green animate-spin flex-shrink-0" />
            <p className="text-sm text-gray-400">Resolving asset...</p>
          </div>
        )}

        {/* Resolved Preview */}
        {hasResolvedAsset && !resolving && (
          <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(0, 255, 156, 0.04)', border: '1px solid rgba(0, 255, 156, 0.12)' }}>
            <p className="text-xs text-neon-green font-semibold mb-3 uppercase tracking-wider">Resolved Trigger</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm text-white font-medium capitalize">{resolved.resolved.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Target</p>
                <p className="text-sm text-white font-medium">{resolved.resolved.target}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Condition</p>
                <p className="text-sm text-white font-medium">
                  {resolved.resolved.type === 'domain' ? 'Available' : (resolved.intent?.condition === '<' ? 'Below' : 'Above')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {resolved.resolved.type === 'domain' ? 'Status' : 'Value'}
                </p>
                <p className="text-sm text-white font-medium">
                  {resolved.resolved.type === 'domain' ? 'Watching' : `$${(resolved.intent?.value || 0).toLocaleString()}`}
                </p>
              </div>
            </div>
            {resolved.resolved.displayName && resolved.resolved.displayName !== resolved.resolved.target && (
              <p className="text-xs text-gray-500 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                Matched: <span className="text-gray-300">{resolved.resolved.displayName}</span>
                {resolved.cached && <span className="text-neon-green/50 ml-2">• cached</span>}
              </p>
            )}
          </div>
        )}

        {/* Local Intent Preview (before resolve completes) */}
        {localIntent && !hasResolvedAsset && !resolving && !error && !suggestions && (
          <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wider">Detected</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Condition</p>
                <p className="text-sm text-white font-medium">
                  {localIntent.isDomain ? 'Available' : (localIntent.condition === '<' ? 'Below' : 'Above')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Value</p>
                <p className="text-sm text-white font-medium">
                  {localIntent.isDomain ? localIntent.target : `$${localIntent.value.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-yellow-400 font-semibold mb-3 uppercase tracking-wider">Did you mean?</p>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onClick={() => handleSuggestionSelect(s)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">{s.target}</p>
                      <p className="text-xs text-gray-500">{s.displayName}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full capitalize" style={{
                      background: s.type === 'crypto' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: s.type === 'crypto' ? '#F59E0B' : '#22C55E',
                    }}>
                      {s.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {!localIntent && !error && !suggestions && !resolving && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-3">Try these examples:</p>
            <div className="space-y-2">
              {[
                'Alert me if Bitcoin drops below $50k',
                'Notify me if Tesla goes above $300',
                'Tell me if myidea.com becomes available',
                'Alert me if Sony WH1000XM5 drops below $300',
              ].map((example) => (
                <button
                  key={example}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
                  onClick={() => handleInputChange(example)}
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3 mb-6" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!hasResolvedAsset || loading || resolving}
            className="btn-primary flex-1"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-dark border-t-transparent animate-spin" />
            ) : (
              'Create Trigger'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
