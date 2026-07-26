const COLORS: Record<string, { fg: string; bg: string }> = {
  Antrian: { fg: 'var(--status-antrian)', bg: 'var(--status-antrian-bg)' },
  Printing: { fg: 'var(--status-printing)', bg: 'var(--status-printing-bg)' },
  Selesai: { fg: 'var(--status-selesai)', bg: 'var(--status-selesai-bg)' },
  Dibatalkan: { fg: 'var(--status-batal)', bg: 'var(--status-batal-bg)' },
  Idle: { fg: 'var(--status-idle)', bg: 'var(--status-selesai-bg)' },
  Maintenance: { fg: 'var(--status-maintenance)', bg: 'var(--status-antrian-bg)' },
  Rusak: { fg: 'var(--status-rusak)', bg: 'var(--status-batal-bg)' },
}

export default function StatusBadge({ status }: { status: string }) {
  const c = COLORS[status] ?? { fg: 'var(--text-secondary)', bg: 'var(--bg-surface-2)' }
  return (
    <span className="badge" style={{ color: c.fg, background: c.bg }}>
      {status}
    </span>
  )
}
