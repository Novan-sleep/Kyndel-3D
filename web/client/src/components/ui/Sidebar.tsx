import { useState, useEffect } from 'react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'motion/react'
import { Page, navItems } from '../../lib/navigation'
import { api } from '../../lib/api'
import { Setting } from '../../types'
import { getInitials } from '../../lib/initials'
import logoImg from '../../assets/logo.png'

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
  mobileOpen?: boolean
}

export default function Sidebar({ currentPage, onNavigate, mobileOpen }: Props) {
  const [namaToko, setNamaToko] = useState('...')
  const [version, setVersion] = useState('')
  const [hovered, setHovered] = useState(false)

  const expanded = mobileOpen || hovered

  useEffect(() => {
    api.get<Setting>('/setting').then((data) => setNamaToko(data.namaToko)).catch(() => {})
    api.get<string>('/app/version').then((data) => setVersion(`v${data}`)).catch(() => {})
  }, [])

  return (
    <aside
      className={`app-sidebar${mobileOpen ? ' mobile-open' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: expanded ? 'var(--sidebar-width-expanded)' : 'var(--sidebar-width-collapsed)',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--bg-sidebar) 0%, var(--bg-sidebar) 100%)',
        borderRight: '1px solid var(--border)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        padding: '0',
        overflow: 'hidden',
      }}
    >
      <LazyMotion features={domAnimation} strict>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 68 }}>
          <img
            src={logoImg}
            alt="KYndel 3D"
            className="sidebar-logo"
            style={{ maxWidth: expanded ? 160 : 32, maxHeight: 64, width: '100%', objectFit: 'contain', transition: `max-width var(--motion-base) var(--motion-ease)` }}
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
                title={item.label}
                className={`nav-item${isActive ? ' active' : ''}`}
                style={{ whiteSpace: 'nowrap' }}
              >
                <span className="nav-icon">{item.icon}</span>
                <AnimatePresence>
                  {expanded && (
                    <m.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                      {item.label}
                    </m.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </nav>

        <div style={{ height: 1, background: 'var(--border)', margin: '0 14px 10px' }} />

        {/* Footer */}
        <div style={{ padding: '0 10px 18px' }}>
          <div style={{
            padding: expanded ? '8px 12px' : '8px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: expanded ? 'space-between' : 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 800, color: '#fff',
                fontFamily: "'Manrope', sans-serif", flexShrink: 0,
              }}>{getInitials(namaToko)}</div>
              <AnimatePresence>
                {expanded && (
                  <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ minWidth: 0 }}>
                    <div className="truncate" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{namaToko}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{version}</div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </LazyMotion>
    </aside>
  )
}
