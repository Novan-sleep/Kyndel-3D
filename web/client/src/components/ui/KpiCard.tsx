import { LazyMotion, domAnimation, m } from 'motion/react'
import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  sub?: string
  color?: string
  accent?: string
  accentLight?: string
  icon?: ReactNode
  /** Percentage change vs. last month. Pass null/undefined to hide the trend badge. */
  trend?: number | null
  /** Set true for metrics where a lower value is the good direction (e.g. Pengeluaran). */
  invertTrend?: boolean
}

const TrendUpIcon = () => (
  <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,12 6,7 9,10 14,3" /><polyline points="10,3 14,3 14,7" />
  </svg>
)
const TrendDownIcon = () => (
  <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,4 6,9 9,6 14,13" /><polyline points="10,13 14,13 14,9" />
  </svg>
)

export default function KpiCard({ label, value, sub, color, accent, accentLight, icon, trend, invertTrend }: Props) {
  const hasTrend = trend !== null && trend !== undefined
  const semanticTrend = hasTrend ? (invertTrend ? -trend : trend) : 0
  const isUp = hasTrend && semanticTrend > 0
  const isDown = hasTrend && semanticTrend < 0
  const trendColor = isUp ? 'var(--success)' : isDown ? 'var(--danger)' : 'var(--text-muted)'
  const trendBg = isUp ? 'var(--success-light)' : isDown ? 'var(--danger-light)' : 'var(--bg-surface-2)'
  const hoverBg = isUp ? 'var(--success-light)' : isDown ? 'var(--danger-light)' : undefined

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className="kpi-card"
        whileHover={hoverBg ? { y: -2, backgroundColor: hoverBg } : { y: -2 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {accent && <div className="kpi-card-accent" style={{ background: accent }} />}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div className="kpi-label">{label}</div>
          {icon && (
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-md)',
              background: accentLight ?? 'var(--bg-surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: color ?? 'var(--text-secondary)', flexShrink: 0,
            }}>
              {icon}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div className="kpi-value" style={{ color: color ?? 'var(--text-primary)' }}>{value}</div>
          {hasTrend && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0,
              padding: '2px 6px', borderRadius: 'var(--radius-full)',
              fontSize: 10, fontWeight: 700, color: trendColor, background: trendBg,
            }}>
              {isUp ? <TrendUpIcon /> : isDown ? <TrendDownIcon /> : null}
              {trend! > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </m.div>
    </LazyMotion>
  )
}
