interface ColorPair { bg: string; color: string }

interface Props {
  status: string
  colorMap?: Record<string, ColorPair>
  dot?: boolean
  pulseOn?: string
}

const defaultColorMap: Record<string, ColorPair> = {
  Antrian:    { bg: 'var(--status-antrian-bg)',  color: 'var(--status-antrian)' },
  Printing:   { bg: 'var(--status-printing-bg)', color: 'var(--status-printing)' },
  Selesai:    { bg: 'var(--status-selesai-bg)',  color: 'var(--status-selesai)' },
  Dibatalkan: { bg: 'var(--status-batal-bg)',    color: 'var(--status-batal)' },
  Idle:        { bg: 'var(--status-selesai-bg)', color: 'var(--status-idle)' },
  Maintenance: { bg: 'var(--status-antrian-bg)', color: 'var(--status-maintenance)' },
  Rusak:       { bg: 'var(--danger-light)',       color: 'var(--danger)' },
}

export default function StatusBadge({ status, colorMap = defaultColorMap, dot = true, pulseOn = 'Printing' }: Props) {
  const cfg = colorMap[status] ?? { bg: 'var(--bg-surface-2)', color: 'var(--text-muted)' }
  const isPulsing = status === pulseOn
  return (
    <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
      {dot && (
        <span
          className={`status-dot${isPulsing ? ' animate-pulse' : ''}`}
          style={{ background: cfg.color }}
        />
      )}
      {status}
    </span>
  )
}
