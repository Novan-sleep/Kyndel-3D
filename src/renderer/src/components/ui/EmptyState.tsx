type EmptyIcon = 'order' | 'printer' | 'material' | 'keuangan' | 'aktivitas' | 'default'

const icons: Record<EmptyIcon, React.ReactNode> = {
  order: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="4" width="24" height="32" rx="3"/>
      <line x1="14" y1="14" x2="26" y2="14"/>
      <line x1="14" y1="20" x2="26" y2="20"/>
      <line x1="14" y1="26" x2="20" y2="26"/>
    </svg>
  ),
  printer: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 18V8a2 2 0 012-2h16a2 2 0 012 2v10"/>
      <path d="M4 18h32a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V20a2 2 0 012-2z"/>
      <path d="M11 36v-7h18v7"/>
    </svg>
  ),
  material: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4L4 12l16 8 16-8L20 4z"/>
      <path d="M4 20l16 8 16-8"/>
      <path d="M4 28l16 8 16-8"/>
    </svg>
  ),
  keuangan: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="32" height="24" rx="3"/>
      <line x1="4" y1="18" x2="36" y2="18"/>
      <line x1="14" y1="26" x2="20" y2="26"/>
      <line x1="22" y1="26" x2="26" y2="26"/>
    </svg>
  ),
  aktivitas: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="16"/>
      <polyline points="20,12 20,20 26,24"/>
    </svg>
  ),
  default: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="28" height="28" rx="4"/>
      <line x1="14" y1="20" x2="26" y2="20"/>
      <line x1="20" y1="14" x2="20" y2="26"/>
    </svg>
  ),
}

interface Props {
  message?: string
  icon?: EmptyIcon | string
}

export default function EmptyState({ message = 'Belum ada data', icon = 'default' }: Props) {
  const svgIcon = icons[icon as EmptyIcon] ?? icons.default
  return (
    <div style={{
      textAlign: 'center', padding: 'var(--spacing-2xl)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
    }}>
      <div style={{ color: 'var(--border)', opacity: 0.8 }}>
        {svgIcon}
      </div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {message}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Data akan tampil di sini setelah ditambahkan.</p>
      </div>
    </div>
  )
}
