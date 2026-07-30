import { useState, useEffect } from 'react'
import { useAppSelector } from './store/hooks'
import Sidebar from './components/ui/Sidebar'
import Topbar from './components/ui/Topbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pesanan from './pages/Pesanan'
import Klien from './pages/Klien'
import Printers from './pages/Printers'
import Materials from './pages/Materials'
import Keuangan from './pages/Keuangan'
import Statistik from './pages/Statistik'
import Aktivitas from './pages/Aktivitas'
import Setting from './pages/Setting'

export type Page = 'dashboard' | 'pesanan' | 'klien' | 'printer' | 'material' | 'keuangan' | 'statistik' | 'aktivitas' | 'setting'

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard', pesanan: 'Manajemen Pesanan', klien: 'Manajemen Klien',
  printer: 'Manajemen Printer', material: 'Manajemen Material',
  keuangan: 'Keuangan', statistik: 'Statistik', aktivitas: 'Log Aktivitas', setting: 'Pengaturan',
}

export default function App() {
  const token = useAppSelector((s) => s.auth.token)
  const [page, setPage] = useState<Page>('dashboard')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(() => {
    document.title = `KYndel 3D — ${pageTitles[page]}`
  }, [page])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [page])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (!token) return <Login />

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />
      case 'pesanan':   return <Pesanan />
      case 'klien':     return <Klien />
      case 'printer':   return <Printers />
      case 'material':  return <Materials />
      case 'keuangan':  return <Keuangan />
      case 'statistik': return <Statistik />
      case 'aktivitas': return <Aktivitas />
      case 'setting':   return <Setting />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div className={`sidebar-backdrop${mobileNavOpen ? ' mobile-open' : ''}`} onClick={() => setMobileNavOpen(false)} />
      <Sidebar currentPage={page} onNavigate={setPage} mobileOpen={mobileNavOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar currentPage={page} theme={theme} onToggleTheme={toggleTheme} onNavigate={setPage} onMenuClick={() => setMobileNavOpen(o => !o)} />
        <main className="app-main" style={{
          flex: 1, overflow: 'auto',
          padding: 'var(--spacing-lg)',
          background: 'var(--bg-base)',
        }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">{pageTitles[page]}</h1>
            </div>
          </div>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
