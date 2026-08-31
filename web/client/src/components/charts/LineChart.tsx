import { useId, useState } from 'react'
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
  /** Draws a dashed vertical marker at the data point whose `label` matches (e.g. "today"). */
  referenceLabel?: string
}

/** Catmull-Rom -> cubic Bezier smoothing, so lines read as smooth curves instead of straight segments. */
function smoothPath(points: [number, number][]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`
  if (points.length === 2) return `M${points[0][0]},${points[0][1]} L${points[1][0]},${points[1][1]}`

  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

export default function LineChart<T>({
  data, series, loading, emptyMessage = 'Belum ada data untuk periode ini', formatValue = fmtShort, referenceLabel,
}: Props<T>) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const uid = useId()

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

  const seriesPoints = (key: keyof T): [number, number][] =>
    data.map((d, i) => [xPos(i), yPos(Number(d[key]))])

  const makePath = (key: keyof T) => smoothPath(seriesPoints(key))

  // Highlight each series' peak and trough with a slightly bigger, glowing dot.
  const extrema = series.map(s => {
    const vals = data.map(d => Number(d[s.key]))
    let maxI = 0, minI = 0
    vals.forEach((v, i) => { if (v > vals[maxI]) maxI = i; if (v < vals[minI]) minI = i })
    return { series: s, indices: maxI === minI ? [maxI] : [maxI, minI] }
  })

  const referenceIdx = referenceLabel ? data.findIndex(d => d.label === referenceLabel) : -1

  const TICKS = 5
  const yTicks = Array.from({ length: TICKS + 1 }, (_, i) => minVal + (i / TICKS) * range)
  const xStep = data.length > 20 ? 5 : data.length > 12 ? 2 : 1

  const ttW = 40 + series.length * 100
  const ttH = 28 + series.length * 19

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }} onMouseLeave={() => setHoverIdx(null)}>
      <defs>
        <filter id={`dotGlow-${uid}`} x="-150%" y="-150%" width="400%" height="400%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="rgba(0,0,0,0.55)" />
        </filter>
        <filter id={`ttShadow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.45)" />
        </filter>
      </defs>

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

      {referenceIdx >= 0 && (
        <line
          x1={xPos(referenceIdx).toFixed(1)} y1={padT} x2={xPos(referenceIdx).toFixed(1)} y2={(padT + chartH).toFixed(1)}
          style={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.6 }}
        />
      )}

      {series.map(s => (
        <path key={`fill-${String(s.key)}`}
          d={`${makePath(s.key)} L${(padL + chartW).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL},${(padT + chartH).toFixed(1)} Z`}
          style={{ fill: s.color, opacity: 0.05 }}
        />
      ))}

      {series.map(s => (
        <path key={`line-${String(s.key)}`} d={makePath(s.key)}
          style={{ fill: 'none', stroke: s.color, strokeWidth: 2.25, strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: s.dashed ? '5 3' : 'none' }}
        />
      ))}

      {extrema.map(({ series: s, indices }) => indices.map(i => (
        <circle
          key={`extremum-${String(s.key)}-${i}`}
          cx={xPos(i).toFixed(1)} cy={yPos(Number(data[i][s.key])).toFixed(1)} r={4.5}
          style={{ fill: s.color, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
          filter={`url(#dotGlow-${uid})`}
        />
      )))}

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
              <circle key={`dot-${String(s.key)}`} cx={x.toFixed(1)} cy={yPos(Number(d[s.key])).toFixed(1)} r={4.5}
                style={{ fill: s.color, stroke: 'var(--bg-surface)', strokeWidth: 2 }} />
            ))}
            <rect x={ttX} y={ttY} width={ttW} height={ttH} rx={10}
              style={{ fill: 'var(--bg-surface-2)', stroke: 'var(--border)', strokeWidth: 1 }}
              filter={`url(#ttShadow-${uid})`} />
            <text x={ttX + 12} y={ttY + 18} fontSize={10} fontWeight={700} style={{ fill: 'var(--text-primary)' }}>{d.label}</text>
            {series.map((s, i) => (
              <g key={`ttrow-${String(s.key)}`}>
                <circle cx={ttX + 14} cy={ttY + 34 + i * 19} r={3} style={{ fill: s.color }} />
                <text x={ttX + 23} y={ttY + 38 + i * 19} fontSize={9} style={{ fill: 'var(--text-secondary)' }}>
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
