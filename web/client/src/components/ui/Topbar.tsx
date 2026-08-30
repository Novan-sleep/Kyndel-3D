import { useState, useEffect, useRef } from 'react'
import { Page, pageTitles } from '../../lib/navigation'
import { api } from '../../lib/api'
import { Pesanan, Material, Printer, DashboardKPI } from '../../types'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useDebounce } from '../../hooks/useDebounce'

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/>
  </svg>
)
const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
)
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="8" cy="8" r="3"/><line x1="8" y1="1" x2="8" y2="2.5"/><line x1="8" y1="13.5" x2="8" y2="15"/>
    <line x1="1" y1="8" x2="2.5" y2="8"/><line x1="13.5" y1="8" x2="15" y2="8"/>
    <line x1="3.05" y1="3.05" x2="4.1" y2="4.1"/><line x1="11.9" y1="11.9" x2="12.95" y2="12.95"/>
    <line x1="3.05" y1="12.95" x2="4.1" y2="11.9"/><line x1="11.9" y1="4.1" x2="12.95" y2="3.05"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 10A6 6 0 016 2.5a6.5 6.5 0 100 11 6 6 0 007.5-3.5z"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 8A6.5 6.5 0 0114 5M14.5 8A6.5 6.5 0 012 11"/><polyline points="12,3 14,5 12,7"/><polyline points="4,9 2,11 4,13"/>
  </svg>
)

type SearchResult = {
  type: 'pesanan' | 'material' | 'printer'
  id: string
  title: string
  subtitle: string
  page: Page
  status?: string
}

type Notif = {
  type: 'deadline' | 'stok' | 'printer'
  title: string
  desc: string
  page: Page
  severity: 'warning' | 'danger'
}

const typeLabel: Record<SearchResult['type'], string> = {
  pesanan: 'Pesanan', material: 'Material', printer: 'Printer'
}
const typeColor: Record<SearchResult['type'], string> = {
  pesanan: 'var(--accent)', material: 'var(--teal)', printer: 'var(--violet)'
}
const typeColorBg: Record<SearchResult['type'], string> = {
  pesanan: 'var(--accent-light)', material: 'var(--teal-light)', printer: 'var(--violet-light)'
}

const statusColor: Record<string, string> = {
  Antrian: 'var(--status-antrian)', Printing: 'var(--status-printing)',
  Selesai: 'var(--status-selesai)', Dibatalkan: 'var(--status-batal)',
  Idle: 'var(--status-idle)', Maintenance: 'var(--status-maintenance)', Rusak: 'var(--status-rusak)'
}

interface Props {
  currentPage: Page
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onNavigate: (page: Page) => void
  onMenuClick?: () => void
}

const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/>
  </svg>
)

export default function Topbar({ currentPage, theme, onToggleTheme, onNavigate, onMenuClick }: Props) {
  const [searchVal, setSearchVal] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const [showNotif, setShowNotif] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [notifRead, setNotifRead] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const cacheRef = useRef<{ pesanan: Pesanan[]; material: Material[]; printer: Printer[] } | null>(null)

  const dateStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date())

  // Invalidate search cache when page changes
  useEffect(() => { cacheRef.current = null }, [currentPage])

  // Load notifications on mount
  useEffect(() => { fetchNotifs() }, [])

  async function fetchNotifs() {
    setNotifLoading(true)
    try {
      const [kpi, printers] = await Promise.all([
        api.get<DashboardKPI>('/dashboard/kpi'),
        api.get<Printer[]>('/printer')
      ])
      const list: Notif[] = []

      for (const p of kpi.orderMendekatiDeadline || []) {
        const daysLeft = Math.ceil((new Date(p.deadline!).getTime() - Date.now()) / 86400000)
        list.push({
          type: 'deadline',
          title: `Deadline: ${p.nama}`,
          desc: daysLeft <= 0 ? `Sudah lewat deadline — ${p.klien}` : `${daysLeft} hari lagi — ${p.klien}`,
          page: 'pesanan',
          severity: daysLeft <= 1 ? 'danger' : 'warning'
        })
      }
      for (const m of kpi.materialHampirHabis || []) {
        list.push({
          type: 'stok',
          title: `Stok Hampir Habis: ${m.nama}`,
          desc: `Sisa ${m.stok} kg${m.stokMinimum ? ` (min. ${m.stokMinimum} kg)` : ''}`,
          page: 'material',
          severity: m.stok <= 0 ? 'danger' : 'warning'
        })
      }
      for (const p of printers) {
        if (p.status === 'Rusak' || p.status === 'Maintenance') {
          list.push({
            type: 'printer',
            title: `Printer ${p.status}: ${p.nama}`,
            desc: p.catatan || 'Printer butuh perhatian',
            page: 'printer',
            severity: p.status === 'Rusak' ? 'danger' : 'warning'
          })
        }
      }
      // danger first
      list.sort((a, b) => (a.severity === 'danger' ? -1 : 1) - (b.severity === 'danger' ? -1 : 1))
      setNotifs(list)
      setNotifRead(false)
    } finally {
      setNotifLoading(false)
    }
  }

  // Search debounce
  const debouncedSearch = useDebounce(searchVal, 300)
  useEffect(() => {
    if (debouncedSearch.length < 2) { setSearchResults([]); return }
    let cancelled = false
    ;(async () => {
      setSearchLoading(true)
      try {
        if (!cacheRef.current) {
          const [pr, mr, tr] = await Promise.all([
            api.get<Pesanan[]>('/pesanan'), api.get<Material[]>('/material'), api.get<Printer[]>('/printer')
          ])
          cacheRef.current = { pesanan: pr, material: mr, printer: tr }
        }
        const q = debouncedSearch.toLowerCase()
        const results: SearchResult[] = []
        for (const p of cacheRef.current.pesanan) {
          if (p.nama.toLowerCase().includes(q) || p.klien.toLowerCase().includes(q)) {
            results.push({ type: 'pesanan', id: p.id, title: p.nama, subtitle: p.klien, page: 'pesanan', status: p.status })
            if (results.length >= 10) break
          }
        }
        for (const m of cacheRef.current.material) {
          if (m.nama.toLowerCase().includes(q)) {
            results.push({ type: 'material', id: m.id, title: m.nama, subtitle: `Stok: ${m.stok}g`, page: 'material' })
          }
        }
        for (const p of cacheRef.current.printer) {
          if (p.nama.toLowerCase().includes(q) || (p.model || '').toLowerCase().includes(q)) {
            results.push({ type: 'printer', id: p.id, title: p.nama, subtitle: p.model || p.tipe || '', page: 'printer', status: p.status })
          }
        }
        if (!cancelled) setSearchResults(results.slice(0, 8))
      } finally {
        if (!cancelled) setSearchLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [debouncedSearch])

  // Click outside to close
  useClickOutside(searchRef, () => setShowSearch(false))
  useClickOutside(notifRef, () => setShowNotif(false))

  function handleSearchSelect(r: SearchResult) {
    setSearchVal('')
    setSearchResults([])
    setShowSearch(false)
    cacheRef.current = null
    onNavigate(r.page)
  }

  function handleBellClick() {
    const opening = !showNotif
    setShowNotif(opening)
    if (opening) { setNotifRead(true); fetchNotifs() }
  }

  const unreadCount = notifRead ? 0 : notifs.length

  const dropdownBase: React.CSSProperties = {
    position: 'absolute', top: 'calc(100% + 8px)', zIndex: 200,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
    animation: 'fadeUp 0.15s ease both',
  }

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 var(--spacing-lg)', flexShrink: 0, zIndex: 10, position: 'relative',
    }}>
      {/* Left: menu toggle + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <button className="hamburger-btn" onClick={onMenuClick} title="Menu">
          <MenuIcon />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
          <span className="topbar-date" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pages</span>
          <span className="topbar-date" style={{ fontSize: '11px', color: 'var(--border-subtle)', opacity: 0.6 }}>/</span>
          <span className="truncate" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
            {pageTitles[currentPage]}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span className="topbar-date" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dateStr}</span>

        {/* Search */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <div className="topbar-search" onClick={() => setShowSearch(true)}>
            <SearchIcon />
            <input
              value={searchVal}
              onChange={e => { setSearchVal(e.target.value); setShowSearch(true) }}
              onFocus={() => setShowSearch(true)}
              placeholder="Cari pesanan, material, printer..."
              style={{ color: 'var(--text-primary)', minWidth: 220 }}
            />
            {searchLoading && <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />}
          </div>

          {showSearch && (searchVal.length >= 2) && (
            <div style={{ ...dropdownBase, left: 0, width: 340 }}>
              {searchResults.length === 0 && !searchLoading ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Tidak ada hasil untuk "{searchVal}"
                </div>
              ) : (
                <div style={{ maxHeight: 360, overflowY: 'auto', padding: '6px' }}>
                  {(['pesanan', 'material', 'printer'] as SearchResult['type'][]).map(type => {
                    const group = searchResults.filter(r => r.type === type)
                    if (!group.length) return null
                    return (
                      <div key={type}>
                        <div style={{
                          fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em',
                          textTransform: 'uppercase', color: 'var(--text-muted)',
                          padding: '8px 10px 4px'
                        }}>{typeLabel[type]}</div>
                        {group.map(r => (
                          <button key={r.id} onClick={() => handleSearchSelect(r)} style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 10px', borderRadius: 'var(--radius-md)',
                            background: 'none', textAlign: 'left', cursor: 'pointer',
                            transition: 'background 0.12s ease',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                            <span style={{
                              fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em',
                              background: typeColorBg[r.type], color: typeColor[r.type],
                              borderRadius: '4px', padding: '2px 6px', flexShrink: 0
                            }}>{typeLabel[r.type]}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.title}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.subtitle}</div>
                            </div>
                            {r.status && (
                              <span style={{
                                fontSize: '10px', fontWeight: 700, flexShrink: 0,
                                color: statusColor[r.status] || 'var(--text-muted)'
                              }}>{r.status}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={handleBellClick}
            title="Notifikasi"
            style={{
              position: 'relative', width: 34, height: 34, borderRadius: 'var(--radius-md)',
              background: showNotif ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', transition: 'background 0.15s ease', flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-3)')}
            onMouseLeave={e => (e.currentTarget.style.background = showNotif ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)')}>
            <BellIcon />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 5, right: 5,
                minWidth: 16, height: 16, borderRadius: '8px',
                background: 'var(--danger)', border: '1.5px solid var(--bg-surface)',
                fontSize: '9px', fontWeight: 800, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px', lineHeight: 1,
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotif && (
            <div style={{ ...dropdownBase, right: 0, width: 320 }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px 10px', borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>
                  Notifikasi
                </span>
                <button
                  onClick={() => fetchNotifs()}
                  disabled={notifLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px', color: 'var(--text-muted)', padding: '3px 7px',
                    borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border)', cursor: 'pointer',
                    opacity: notifLoading ? 0.5 : 1,
                  }}>
                  <RefreshIcon /> Refresh
                </button>
              </div>

              {/* List */}
              <div style={{ maxHeight: 360, overflowY: 'auto', padding: '6px' }}>
                {notifLoading ? (
                  <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
                    <span className="spinner" />
                  </div>
                ) : notifs.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Semua Normal</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Tidak ada peringatan saat ini</div>
                  </div>
                ) : (
                  notifs.map((n, i) => {
                    const isWarn = n.severity === 'warning'
                    const color = isWarn ? 'var(--warning)' : 'var(--danger)'
                    const bgColor = isWarn ? 'var(--warning-light)' : 'var(--danger-light)'
                    const icon = n.type === 'deadline' ? '⏰' : n.type === 'stok' ? '📦' : '🖨️'
                    return (
                      <button key={i} onClick={() => { setShowNotif(false); onNavigate(n.page) }} style={{
                        width: '100%', display: 'flex', gap: '10px', alignItems: 'flex-start',
                        padding: '9px 10px', borderRadius: 'var(--radius-md)', background: 'none',
                        borderLeft: `3px solid ${color}`, textAlign: 'left', cursor: 'pointer',
                        marginBottom: '2px', transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = bgColor)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <span style={{ fontSize: '18px', flexShrink: 0, lineHeight: 1.2 }}>{icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                            {n.desc}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em',
                          color, background: bgColor, borderRadius: '4px', padding: '2px 6px',
                          flexShrink: 0, alignSelf: 'center'
                        }}>{isWarn ? 'PERINGATAN' : 'KRITIS'}</span>
                      </button>
                    )
                  })
                )}
              </div>

              {notifs.length > 0 && (
                <div style={{ padding: '8px 14px 10px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {notifs.length} peringatan aktif — klik untuk navigasi
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          <span>{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
        </button>

      </div>
    </header>
  )
}
