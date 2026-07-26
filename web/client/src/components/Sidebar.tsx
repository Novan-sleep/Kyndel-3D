import { useAppDispatch } from '../store/hooks'
import { logout } from '../store/authSlice'

export type Page = 'dashboard' | 'printers' | 'materials' | 'pesanan'

const NAV: { key: Page; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '▦' },
  { key: 'pesanan', label: 'Pesanan', icon: '☷' },
  { key: 'printers', label: 'Printer', icon: '⚙' },
  { key: 'materials', label: 'Material', icon: '◆' },
]

export default function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  const dispatch = useAppDispatch()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-title">KYNDEL 3D</div>
        <div className="sidebar-brand-sub">Web Dashboard</div>
      </div>
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.key}
            className={`sidebar-link${page === item.key ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => dispatch(logout())}>
          Keluar
        </button>
      </div>
    </aside>
  )
}
