import { useState } from 'react'
import { fmtShort } from './format'

export interface BarDatum {
  label: string
  value: number
  color?: string
}

interface Props {
  data: BarDatum[]
  color?: string
  formatValue?: (n: number) => string
  emptyMessage?: string
}

const BAR_H = 20
const BAR_GAP = 14

export default function BarChart({ data, color = 'var(--accent)', formatValue = fmtShort, emptyMessage = 'Belum ada data' }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  if (data.length === 0) {
    return (
      <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        {emptyMessage}
      </div>
    )
  }

  const W = 480
  const padL = 6, padR = 56, padT = 4, padB = 4
  const labelW = 108
  const chartW = W - padL - padR - labelW
  const rowH = BAR_H + BAR_GAP
  const H = padT + padB + data.length * rowH - BAR_GAP
  const maxVal = Math.max(...data.map(d => d.value), 1)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {data.map((d, i) => {
        const y = padT + i * rowH
        const barW = Math.max((d.value / maxVal) * chartW, d.value > 0 ? 3 : 0)
        const barColor = d.color ?? color
        const isHover = hoverIdx === i
        return (
          <g key={d.label} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} style={{ cursor: 'default' }}>
            <text x={padL + labelW - 10} y={y + BAR_H / 2 + 3.5} textAnchor="end" fontSize={10.5} style={{ fill: 'var(--text-secondary)' }}>
              {d.label}
            </text>
            {/* track */}
            <rect x={padL + labelW} y={y} width={chartW} height={BAR_H} rx={4} style={{ fill: 'var(--bg-surface-2)' }} />
            {/* fill */}
            <rect
              x={padL + labelW} y={y} width={barW} height={BAR_H} rx={4}
              style={{ fill: barColor, opacity: isHover ? 1 : 0.88, transition: 'opacity 120ms ease' }}
            />
            <text x={padL + labelW + barW + 8} y={y + BAR_H / 2 + 3.5} fontSize={10.5} fontWeight={700}
              style={{ fill: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>
              {formatValue(d.value)}
            </text>
            {/* hit target */}
            <rect x={padL} y={y - BAR_GAP / 2} width={W - padL - padR} height={BAR_H + BAR_GAP} style={{ fill: 'transparent' }} />
          </g>
        )
      })}
    </svg>
  )
}
