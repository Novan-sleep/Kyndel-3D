import { useState, useEffect } from 'react'

declare const window: Window & { api: any }
import Sidebar from './components/ui/Sidebar'
import Topbar from './components/ui/Topbar'
import DashboardPage from './pages/DashboardPage'
import PesananPage from './pages/PesananPage'
import PrinterPage from './pages/PrinterPage'
import MaterialPage from './pages/MaterialPage'
import KeuanganPage from './pages/KeuanganPage'
import AktivitasPage from './pages/AktivitasPage'
import KlienPage from './pages/KlienPage'
import SettingPage from './pages/SettingPage'
import StatistikPage from './pages/StatistikPage'

export type Page = 'dashboard' | 'pesanan' | 'klien' | 'printer' | 'material' | 'keuangan' | 'statistik' | 'aktivitas' | 'setting'

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard', pesanan: 'Manajemen Pesanan', klien: 'Manajemen Klien',
  printer: 'Manajemen Printer', material: 'Manajemen Material',
  keuangan: 'Keuangan', statistik: 'Statistik', aktivitas: 'Log Aktivitas', setting: 'Pengaturan',
}

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [appVersion, setAppVersion] = useState('')
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(() => {
    window.api.app.getVersion().then((res: any) => {
      if (res.success) setAppVersion(res.data)
    })
  }, [])

  useEffect(() => {
    const prefix = appVersion ? `KYndel 3D v${appVersion}` : 'KYndel 3D'
    window.api.app.setTitle(`${prefix} — ${pageTitles[page]}`)
  }, [page, appVersion])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage />
      case 'pesanan':   return <PesananPage />
      case 'klien':     return <KlienPage />
      case 'printer':   return <PrinterPage />
      case 'material':  return <MaterialPage />
      case 'keuangan':  return <KeuanganPage />
      case 'statistik': return <StatistikPage />
      case 'aktivitas': return <AktivitasPage />
      case 'setting':   return <SettingPage />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar currentPage={page} onNavigate={setPage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar currentPage={page} theme={theme} onToggleTheme={toggleTheme} onNavigate={setPage} />
        <main style={{
          flex: 1, overflow: 'auto',
          padding: 'var(--spacing-lg)',
          background: 'var(--bg-base)',
        }}>
          {/* Page header */}
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
