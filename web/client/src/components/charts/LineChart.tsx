import { useState } from 'react'
import { fmtShort } from './format'

export interface LineSeries<T> {
  key: keyof T
  label: string
  color: string
  dashed?: boolean
}

interface Props<T> {
  data: (T & { label: string })[]
  series: LineSeries<T>[]
  loading?: boolean
  emptyMessage?: string
  formatValue?: (n: number) => string
}

export default function LineChart<T>({
  data, series, loading, emptyMessage = 'Belum ada data untuk periode ini', formatValue = fmtShort,
}: Props<T>) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const W = 900, H = 260
  const padL = 72, padR = 20, padT = 16, padB = 36
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span className="spinner" />
      </div>
    )
  }

  const hasData = data.some(d => series.some(s => Number(d[s.key]) !== 0))
  if (!hasData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
        {emptyMessage}
      </div>
    )
  }

  const allVals = data.flatMap(d => series.map(s => Number(d[s.key])))
  const maxVal = Math.max(...allVals, 1)
  const minVal = Math.min(...allVals, 0)
  const range = maxVal - minVal || 1

  const xPos = (i: number) => data.length <= 1 ? padL + chartW / 2 : padL + (i / (data.length - 1)) * chartW
  const yPos = (v: number) => padT + chartH - ((v - minVal) / range) * chartH

  const makePath = (key: keyof T) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(Number(d[key])).toFixed(1)}`).join(' ')

  const TICKS = 5
  const yTicks = Array.from({ length: TICKS + 1 }, (_, i) => minVal + (i / TICKS) * range)
  const xStep = data.length > 20 ? 5 : data.length > 12 ? 2 : 1

  const ttW = 40 + series.length * 100
  const ttH = 28 + series.length * 19

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }} onMouseLeave={() => setHoverIdx(null)}>
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={padL} y1={yPos(tick).toFixed(1)} x2={W - padR} y2={yPos(tick).toFixed(1)}
            style={{ stroke: tick === 0 ? 'var(--border)' : 'var(--border-subtle)', strokeWidth: tick === 0 ? 1 : 0.5 }}
          />
          <text x={padL - 6} y={(yPos(tick) + 4).toFixed(1)} textAnchor="end" fontSize={9} style={{ fill: 'var(--text-muted)' }}>
            {formatValue(tick)}
          </text>
        </g>
      ))}

      {data.map((d, i) => i % xStep === 0 && (
        <text key={i} x={xPos(i).toFixed(1)} y={H - padB + 14} textAnchor="middle" fontSize={9} style={{ fill: 'var(--text-muted)' }}>
          {d.label}
        </text>
      ))}

      {series.map(s => (
        <path key={`fill-${String(s.key)}`}
          d={`${makePath(s.key)} L${(padL + chartW).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL},${(padT + chartH).toFixed(1)} Z`}
          style={{ fill: s.color, opacity: 0.04 }}
        />
      ))}

      {series.map(s => (
        <path key={`line-${String(s.key)}`} d={makePath(s.key)}
          style={{ fill: 'none', stroke: s.color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: s.dashed ? '5 3' : 'none' }}
        />
      ))}

      {data.map((_, i) => {
        const zoneW = data.length > 1 ? chartW / data.length : chartW
        return (
          <rect key={i}
            x={(xPos(i) - zoneW / 2).toFixed(1)} y={padT} width={zoneW.toFixed(1)} height={chartH}
            style={{ fill: 'transparent', cursor: 'crosshair' }}
            onMouseEnter={() => setHoverIdx(i)}
          />
        )
      })}

      {hoverIdx !== null && (() => {
        const d = data[hoverIdx]
        const x = xPos(hoverIdx)
        const ttX = x + ttW + 14 > W - padR ? x - ttW - 10 : x + 10
        const ttY = padT + 8
        return (
          <g>
            <line x1={x.toFixed(1)} y1={padT} x2={x.toFixed(1)} y2={(padT + chartH).toFixed(1)}
              style={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '3 3' }} />
            {series.map(s => (
              <circle key={`dot-${String(s.key)}`} cx={x.toFixed(1)} cy={yPos(Number(d[s.key])).toFixed(1)} r={4} style={{ fill: s.color }} />
            ))}
            <rect x={ttX} y={ttY} width={ttW} height={ttH} rx={7} style={{ fill: 'var(--bg-surface-2)', stroke: 'var(--border)', strokeWidth: 1 }} />
            <text x={ttX + 10} y={ttY + 17} fontSize={10} fontWeight={700} style={{ fill: 'var(--text-primary)' }}>{d.label}</text>
            {series.map((s, i) => (
              <g key={`ttrow-${String(s.key)}`}>
                <circle cx={ttX + 12} cy={ttY + 33 + i * 19} r={3} style={{ fill: s.color }} />
                <text x={ttX + 21} y={ttY + 37 + i * 19} fontSize={9} style={{ fill: 'var(--text-secondary)' }}>
                  {s.label}: {formatValue(Number(d[s.key]))}
                </text>
              </g>
            ))}
          </g>
        )
      })()}
    </svg>
  )
}
