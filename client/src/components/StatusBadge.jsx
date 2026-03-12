export default function StatusBadge({ status }) {
  const styles = {
    active: 'status-active',
    paused: 'status-paused',
    cooldown: 'status-cooldown',
    triggered: 'status-triggered',
  }

  const dotColors = {
    active: 'bg-neon-green-dim',
    paused: 'bg-gray-400',
    cooldown: 'bg-yellow-500',
    triggered: 'bg-accent-purple',
  }

  const labels = {
    active: 'Active',
    paused: 'Paused',
    cooldown: 'Cooldown',
    triggered: 'Triggered',
  }

  return (
    <span className={`status-badge ${styles[status] || styles.active}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || dotColors.active}`} />
      {labels[status] || status}
    </span>
  )
}
