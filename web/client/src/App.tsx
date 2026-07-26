import { useState } from 'react'
import { useAppSelector } from './store/hooks'
import Sidebar, { Page } from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Printers from './pages/Printers'
import Materials from './pages/Materials'
import Pesanan from './pages/Pesanan'

export default function App() {
  const token = useAppSelector((s) => s.auth.token)
  const [page, setPage] = useState<Page>('dashboard')

  if (!token) return <Login />

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage} />
      <main className="app-main">
        {page === 'dashboard' && <Dashboard />}
        {page === 'printers' && <Printers />}
        {page === 'materials' && <Materials />}
        {page === 'pesanan' && <Pesanan />}
      </main>
    </div>
  )
}
