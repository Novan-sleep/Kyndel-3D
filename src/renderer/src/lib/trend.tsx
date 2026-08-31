// Shared trend helpers used by dashboards/report pages (Statistik, Keuangan)
// to show "bulan ini vs bulan lalu" style KPI chips consistently.

// null = tidak ada data pembanding (periode lalu kosong) -> jangan tampilkan chip
export function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr > 0 ? 100 : null
  return ((curr - prev) / prev) * 100
}

interface TrendChipProps {
  change: number | null
  /** true untuk metrik yang "turun = bagus" (mis. Pengeluaran) */
  invert?: boolean
}

export function TrendChip({ change, invert = false }: TrendChipProps) {
  if (change === null) return null
  const arrowUp = change >= 0
  const isGood = invert ? change <= 0 : change >= 0
  return (
    <span className={`stat-chip ${isGood ? 'stat-chip-up' : 'stat-chip-down'}`}>
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: arrowUp ? 'none' : 'scaleY(-1)' }}>
        <path d="M2 11l4.5-5L10 9l4-6" /><path d="M10.5 3H14v3.5" />
      </svg>
      {arrowUp ? '+' : '-'}{Math.abs(change).toFixed(1)}%
    </span>
  )
}

interface StatTileProps {
  label: string
  value: string
  change: number | null
  invert?: boolean
  /** warna nilai utama (default var(--text-primary)) */
  color?: string
  /** teks kecil di bawah nilai */
  sub?: string
  /** override background container, mis. gradient highlight */
  background?: string
  /** garis aksen kiri */
  accent?: string
}

export function StatTile({ label, value, change, invert, color, sub, background, accent }: StatTileProps) {
  const isGood = change === null ? null : invert ? change <= 0 : change >= 0
  const dir = isGood === null ? '' : isGood ? 'stat-tile-up' : 'stat-tile-down'
  return (
    <div
      className={`stat-tile ${dir}`}
      style={{ background, borderLeft: accent ? `3px solid ${accent}` : undefined }}
    >
      <div style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text-muted)', marginBottom:10 }}>{label}</div>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:10 }}>
        <span style={{ fontFamily:"'Sora',sans-serif", fontSize:21, fontWeight:800, color: color ?? 'var(--text-primary)', letterSpacing:'-0.02em' }}>{value}</span>
        <TrendChip change={change} invert={invert} />
      </div>
      {sub && <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:6 }}>{sub}</div>}
    </div>
  )
}
