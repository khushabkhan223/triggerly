export default function MetricCard({ label, value, change, changeColor = 'text-neon-green' }) {
  return (
    <div className="metric-card">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {change && (
        <p className={`text-xs mt-1.5 ${changeColor}`}>{change}</p>
      )}
    </div>
  )
}
