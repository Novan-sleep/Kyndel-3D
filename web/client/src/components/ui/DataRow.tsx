import type { ReactNode, CSSProperties } from 'react'

interface Props {
  label: ReactNode
  value: ReactNode
  variant?: 'divider' | 'chip'
  last?: boolean
  indent?: boolean
  valueStyle?: CSSProperties
}

export default function DataRow({ label, value, variant = 'divider', last = false, indent = false, valueStyle }: Props) {
  if (variant === 'chip') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif", ...valueStyle }}>{value}</span>
      </div>
    )
  }
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: indent ? '6px 0 6px 12px' : '8px 0',
      borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
      fontSize: '13px',
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%', ...valueStyle }}>{value ?? '—'}</span>
    </div>
  )
}
