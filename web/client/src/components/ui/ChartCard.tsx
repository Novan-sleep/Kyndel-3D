import type { ReactNode } from 'react'

interface Props {
  title: string
  badge?: string
  accent?: string
  children: ReactNode
}

export default function ChartCard({ title, badge, accent = 'var(--accent)', children }: Props) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '13px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: accent, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
        </div>
        {badge && (
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', background: 'var(--bg-surface-2)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', fontWeight: 500 }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  )
}
