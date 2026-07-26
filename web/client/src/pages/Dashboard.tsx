import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchKPI } from '../store/dashboardSlice'
import StatusBadge from '../components/StatusBadge'

function formatRupiah(n: number): string {
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`
}

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const { kpi, status } = useAppSelector((s) => s.dashboard)

  useEffect(() => {
    dispatch(fetchKPI())
  }, [dispatch])

  if (status === 'loading' && !kpi) {
    return <div className="page-loading"><span className="spinner" /> Memuat dashboard…</div>
  }
  if (!kpi) return null

  const cards = [
    { label: 'Order Aktif', value: kpi.totalOrderAktif, sub: `${kpi.totalOrderAntrian} antrian · ${kpi.totalOrderPrinting} printing`, color: 'var(--accent)' },
    { label: 'Selesai Bulan Ini', value: kpi.totalOrderSelesaiBulanIni, sub: `${kpi.totalOrderDibatalkanBulanIni} dibatalkan`, color: 'var(--success)' },
    { label: 'Printer Idle', value: kpi.totalPrinterIdle, sub: `${kpi.totalPrinterPrinting} sedang printing`, color: 'var(--warning)' },
    { label: 'Material Hampir Habis', value: kpi.totalMaterialHampirHabis, sub: 'Perlu restock', color: 'var(--danger)' },
    { label: 'Pendapatan Bulan Ini', value: formatRupiah(kpi.totalPendapatanBulanIni), sub: `Profit: ${formatRupiah(kpi.profitBulanIni)}`, color: 'var(--accent)' },
    { label: 'Rata-rata Nilai Jual', value: formatRupiah(kpi.rataRataNilaiJual), sub: 'Per pesanan selesai', color: 'var(--success)' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Ringkasan operasional workshop KYndel 3D</p>
        </div>
      </div>

      <div className="kpi-grid">
        {cards.map((c) => (
          <div className="kpi-card" style={{ ['--kpi-color' as string]: c.color }} key={c.label}>
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-value">{c.value}</div>
            <div className="kpi-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">Mendekati Deadline</div>
          {kpi.orderMendekatiDeadline.length === 0 ? (
            <div className="empty-state">Tidak ada pesanan mendekati deadline</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Pesanan</th><th>Klien</th><th>Deadline</th><th>Status</th></tr></thead>
                <tbody>
                  {kpi.orderMendekatiDeadline.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nama}</td>
                      <td>{p.klien}</td>
                      <td>{p.deadline}</td>
                      <td><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title">Aktivitas Terbaru</div>
          {kpi.aktivitasTerbaru.length === 0 ? (
            <div className="empty-state">Belum ada aktivitas</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {kpi.aktivitasTerbaru.map((a) => (
                <div key={a.id} style={{ fontSize: 13 }}>
                  <div>{a.deskripsi}</div>
                  <div className="text-muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                    {a.modul} · {new Date(a.createdAt).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {kpi.materialHampirHabis.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="section-title">Material Hampir Habis</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Material</th><th>Stok</th><th>Stok Minimum</th></tr></thead>
              <tbody>
                {kpi.materialHampirHabis.map((m) => (
                  <tr key={m.id}>
                    <td>{m.nama}</td>
                    <td className="text-danger">{m.stok} kg</td>
                    <td>{m.stokMinimum} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
