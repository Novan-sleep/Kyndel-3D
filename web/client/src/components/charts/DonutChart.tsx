import { useState } from 'react'

export interface DonutDatum {
  label: string
  value: number
  color: string
}

interface Props {
  data: DonutDatum[]
  centerLabel?: string
  centerValue?: string | number
  emptyMessage?: string
}

const SIZE = 160
const R = 62
const STROKE = 20
const CIRC = 2 * Math.PI * R

export default function DonutChart({ data, centerLabel, centerValue, emptyMessage = 'Belum ada data' }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const total = data.reduce((a, d) => a + d.value, 0)

  if (data.length === 0 || total === 0) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        {emptyMessage}
      </div>
    )
  }

  let cumulative = 0
  const segments = data.map((d, i) => {
    const frac = d.value / total
    const dash = frac * CIRC
    const gap = data.length > 1 ? 2 : 0
    const offset = -cumulative
    cumulative += dash
    return { ...d, dash: Math.max(dash - gap, 0), offset, isHover: hoverIdx === i }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
          {segments.map((s, i) => (
            <circle
              key={s.label}
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={s.isHover ? STROKE + 3 : STROKE}
              strokeDasharray={`${s.dash.toFixed(1)} ${CIRC.toFixed(1)}`}
              strokeDashoffset={s.offset.toFixed(1)}
              strokeLinecap="butt"
              style={{ transition: 'stroke-width 120ms ease', cursor: 'default' }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <title>{s.label}: {s.value}</title>
            </circle>
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Manrope', sans-serif", lineHeight: 1, color: 'var(--text-primary)' }}>
            {centerValue ?? total}
          </div>
          {centerLabel && (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {centerLabel}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', width: '100%' }}>
        {data.map((d, i) => (
          <div key={d.label}
            onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              borderRadius: 9, background: 'var(--bg-surface-2)',
              border: `1px solid ${hoverIdx === i ? d.color : 'var(--border)'}`,
              transition: 'border-color 120ms ease',
            }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1 }}>{d.label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
