interface Props { status: string }

const statusConfig: Record<string, { bg: string; color: string }> = {
  Antrian:    { bg: 'var(--status-antrian-bg)',  color: 'var(--status-antrian)' },
  Printing:   { bg: 'var(--status-printing-bg)', color: 'var(--status-printing)' },
  Selesai:    { bg: 'var(--status-selesai-bg)',  color: 'var(--status-selesai)' },
  Dibatalkan: { bg: 'var(--status-batal-bg)',    color: 'var(--status-batal)' },
  Idle:        { bg: 'var(--status-selesai-bg)', color: 'var(--status-idle)' },
  Maintenance: { bg: 'var(--status-antrian-bg)', color: 'var(--status-maintenance)' },
  Rusak:       { bg: 'var(--danger-light)',       color: 'var(--danger)' },
}

export default function StatusBadge({ status }: Props) {
  const cfg = statusConfig[status] ?? { bg: 'var(--bg-surface-2)', color: 'var(--text-muted)' }
  const isPrinting = status === 'Printing'
  return (
    <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span
        className={`status-dot${isPrinting ? ' animate-pulse' : ''}`}
        style={{ background: cfg.color }}
      />
      {status}
    </span>
  )
}
