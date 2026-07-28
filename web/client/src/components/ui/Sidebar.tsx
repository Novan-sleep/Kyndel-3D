import { useState, useEffect } from 'react'
import { Page } from '../../App'
import { api } from '../../lib/api'
import { Setting } from '../../types'
import logoImg from '../../assets/logo.png'

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
  mobileOpen?: boolean
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="1.5" width="5" height="5" rx="1.2"/><rect x="1.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.2"/></svg> },
  { id: 'pesanan', label: 'Pesanan',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 1H5a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 00-2-2z"/><line x1="5.5" y1="6" x2="10.5" y2="6"/><line x1="5.5" y1="9" x2="10.5" y2="9"/><line x1="5.5" y1="12" x2="8" y2="12"/></svg> },
  { id: 'klien', label: 'Klien',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg> },
  { id: 'printer', label: 'Printer',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V3a1 1 0 011-1h6a1 1 0 011 1v4"/><path d="M2 7h12a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1V8a1 1 0 011-1z"/><path d="M4.5 14v-3h7v3"/></svg> },
  { id: 'material', label: 'Material',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1L2 4.5l6 3 6-3L8 1z"/><path d="M2 8l6 3 6-3"/><path d="M2 11.5l6 3 6-3"/></svg> },
  { id: 'keuangan', label: 'Keuangan',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,12 4.5,8 7.5,10 12,4.5"/><polyline points="10,4.5 12,4.5 12,6.5"/></svg> },
  { id: 'statistik', label: 'Statistik',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="9" width="3" height="5" rx="0.8"/><rect x="6.5" y="5" width="3" height="9" rx="0.8"/><rect x="11" y="2" width="3" height="12" rx="0.8"/></svg> },
  { id: 'aktivitas', label: 'Aktivitas',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><polyline points="8,5 8,8 10,9.5"/></svg> },
  { id: 'setting', label: 'Setting',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/><circle cx="5.5" cy="4" r="1.5" fill="var(--bg-sidebar)"/><circle cx="10.5" cy="8" r="1.5" fill="var(--bg-sidebar)"/><circle cx="5.5" cy="12" r="1.5" fill="var(--bg-sidebar)"/></svg> },
]

function getInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

export default function Sidebar({ currentPage, onNavigate, mobileOpen }: Props) {
  const [namaToko, setNamaToko] = useState('...')
  const [version, setVersion] = useState('')

  useEffect(() => {
    api.get<Setting>('/setting').then((data) => setNamaToko(data.namaToko)).catch(() => {})
    api.get<string>('/app/version').then((data) => setVersion(`v${data}`)).catch(() => {})
  }, [])

  return (
    <aside className={`app-sidebar${mobileOpen ? ' mobile-open' : ''}`} style={{
      width: 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--bg-sidebar) 0%, var(--bg-sidebar) 100%)',
      borderRight: '1px solid var(--border)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: '0',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={logoImg}
          alt="KYndel 3D"
          className="sidebar-logo"
          style={{ maxWidth: 160, maxHeight: 64, width: '100%', objectFit: 'contain' }}
        />
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '0 14px 8px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div style={{ height: 1, background: 'var(--border)', margin: '0 14px 10px' }} />

      {/* Footer */}
      <div style={{ padding: '0 10px 18px' }}>
        <div style={{
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 800, color: '#fff',
              fontFamily: "'Sora', sans-serif", flexShrink: 0,
            }}>{getInitials(namaToko)}</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{namaToko}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{version}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
