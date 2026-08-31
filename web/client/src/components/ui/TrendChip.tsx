// Small inline trend chip for use outside KpiCard (e.g. hero headers, insight text).
export default function TrendChip({ change }: { change: number | null }) {
  if (change === null) return null
  const up = change >= 0
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 7px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700,
      color: up ? 'var(--success)' : 'var(--danger)',
      background: up ? 'var(--success-light)' : 'var(--danger-light)',
    }}>
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: up ? 'none' : 'scaleY(-1)' }}>
        <path d="M2 11l4.5-5L10 9l4-6" /><path d="M10.5 3H14v3.5" />
      </svg>
      {up ? '+' : '-'}{Math.abs(change).toFixed(1)}%
    </span>
  )
}
