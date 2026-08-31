import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchKPI } from '../store/dashboardSlice'
import { fetchPesanan } from '../store/pesananSlice'
import { fetchKliens } from '../store/klienSlice'
import { fetchPrinters } from '../store/printersSlice'
import { formatRp, formatTgl } from '../lib/api'
import { pctChange } from '../lib/trend'
import { DashboardKPI } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import TrendChip from '../components/ui/TrendChip'
import LineChart, { LineSeries } from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'

// ── Icons ──────────────────────────────────────────────────────────────────

const IcOrderAktif = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 1H5a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 00-2-2z"/>
    <line x1="5.5" y1="5.5" x2="10.5" y2="5.5"/><line x1="5.5" y1="8" x2="10.5" y2="8"/><line x1="5.5" y1="10.5" x2="8" y2="10.5"/>
  </svg>
)
const IcAntrian = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6"/><polyline points="8,5 8,8 10,9.5"/>
  </svg>
)
const IcPrinting = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7V3a1 1 0 011-1h6a1 1 0 011 1v4"/>
    <path d="M2 7h12a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1V8a1 1 0 011-1z"/>
    <path d="M4.5 14v-3h7v3"/>
  </svg>
)
const IcSelesai = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6"/><polyline points="5.5,8 7,9.5 10.5,6"/>
  </svg>
)
const IcPendapatan = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1.5,11.5 5,7 8,9 12.5,3.5"/><polyline points="10.5,3.5 12.5,3.5 12.5,5.5"/>
  </svg>
)
const IcPengeluaran = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1.5,4.5 5,9 8,7 12.5,12.5"/><polyline points="10.5,12.5 12.5,12.5 12.5,10.5"/>
  </svg>
)
const IcProfit = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="9" width="3" height="5" rx="0.8"/><rect x="6.5" y="6" width="3" height="8" rx="0.8"/><rect x="11" y="3" width="3" height="11" rx="0.8"/>
  </svg>
)
const IcPrinterIdle = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7V3a1 1 0 011-1h6a1 1 0 011 1v4"/>
    <path d="M2 7h12a1 1 0 011 1v4a1 1 0 01-1 1H2a1 1 0 01-1-1V8a1 1 0 011-1z"/>
    <path d="M4.5 14v-2h7v2"/><circle cx="12.5" cy="9.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
)
const IcMaterial = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1L2 4.5l6 3 6-3L8 1z"/><path d="M2 8l6 3 6-3"/><path d="M2 11.5l6 3 6-3"/>
  </svg>
)

// Module icons for timeline
const modulIcon: Record<string, React.ReactNode> = {
  Pesanan: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 1H5a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 00-2-2z"/><line x1="5.5" y1="6" x2="10.5" y2="6"/><line x1="5.5" y1="9" x2="10.5" y2="9"/></svg>,
  Printer: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V3a1 1 0 011-1h6a1 1 0 011 1v4"/><path d="M2 7h12a1 1 0 011 1v4a1 1 0 01-1 1H2a1 1 0 01-1-1V8a1 1 0 011-1z"/><path d="M4.5 14v-2h7v2"/></svg>,
  Material: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1L2 4.5l6 3 6-3L8 1z"/><path d="M2 8l6 3 6-3"/></svg>,
  Keuangan: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,11.5 5,7 8,9 12.5,3.5"/></svg>,
  Sistem: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg>,
}
const modulColor: Record<string, { color: string; light: string }> = {
  Pesanan:  { color: 'var(--accent)',   light: 'var(--accent-light)' },
  Printer:  { color: 'var(--violet)',   light: 'var(--violet-light)' },
  Material: { color: 'var(--teal)',     light: 'var(--teal-light)' },
  Keuangan: { color: 'var(--success)',  light: 'var(--success-light)' },
  Sistem:   { color: 'var(--text-muted)', light: 'var(--bg-surface-2)' },
}

// ── Statistik constants (moved from the old Statistik tab) ──────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

function monthKey(iso?: string): string {
  return (iso ?? '').substring(0, 7)
}

interface RevenuePoint {
  label: string
  revenue: number
}

const revenueSeries: LineSeries<RevenuePoint>[] = [
  { key: 'revenue', label: 'Revenue', color: 'var(--accent)' },
]

const statusColor: Record<string, string> = {
  Antrian: 'var(--status-antrian)',
  Printing: 'var(--status-printing)',
  Selesai: 'var(--status-selesai)',
  Dibatalkan: 'var(--status-batal)',
}

const printerStatusColor: Record<string, string> = {
  Idle: 'var(--status-idle)',
  Printing: 'var(--status-printing)',
  Maintenance: 'var(--status-maintenance)',
  Rusak: 'var(--status-rusak)',
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
    </div>
  )
}

function ActivityTimeline({ items }: { items: DashboardKPI['aktivitasTerbaru'] }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        Belum ada aktivitas
      </div>
    )
  }
  return (
    <div style={{ padding: '8px var(--spacing-lg) var(--spacing-md)' }}>
      {items.map((a, i) => {
        const cfg = modulColor[a.modul] ?? { color: 'var(--text-muted)', light: 'var(--bg-surface-2)' }
        const isLast = i === items.length - 1
        return (
          <div key={a.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
            {!isLast && (
              <div style={{
                position: 'absolute', left: 14, top: 32, bottom: 0,
                width: 1, background: 'var(--border)',
              }} />
            )}
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: cfg.light,
              border: `1.5px solid ${cfg.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: '10px', color: cfg.color, zIndex: 1,
            }}>
              {modulIcon[a.modul]}
            </div>
            <div style={{
              flex: 1, padding: '10px 0',
              borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
              minWidth: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{a.deskripsi}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '1px' }}>{formatTgl(a.createdAt)}</span>
              </div>
              <span style={{
                display: 'inline-block', marginTop: '4px',
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '1px 7px', borderRadius: '4px',
                background: cfg.light, color: cfg.color,
              }}>{a.modul}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const { kpi, status } = useAppSelector((s) => s.dashboard)
  const pesanans = useAppSelector((s) => s.pesanan.items)
  const kliens = useAppSelector((s) => s.klien.items)
  const printers = useAppSelector((s) => s.printers.items)
  const pesananLoading = useAppSelector((s) => s.pesanan.status === 'loading' && s.pesanan.items.length === 0)

  useEffect(() => {
    dispatch(fetchKPI())
    dispatch(fetchPesanan())
    dispatch(fetchKliens())
    dispatch(fetchPrinters())
  }, [dispatch])

  // ── Statistik computations (moved from the old Statistik tab) ─────────────

  const selesai = useMemo(() => pesanans.filter(p => p.status === 'Selesai'), [pesanans])
  const totalRevenue = useMemo(() => selesai.reduce((a, p) => a + p.hargaFinal, 0), [selesai])

  const monthlyAll = useMemo(() => {
    const map: Record<string, RevenuePoint & { pesanan: number }> = {}
    for (const p of selesai) {
      const raw = monthKey(p.createdAt)
      if (raw.length < 7) continue
      if (!map[raw]) {
        const [y, m] = raw.split('-')
        map[raw] = { label: `${MONTHS[+m - 1]} '${y.slice(2)}`, revenue: 0, pesanan: 0 }
      }
      map[raw].revenue += p.hargaFinal
      map[raw].pesanan++
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
  }, [selesai])

  const monthlyData = useMemo<RevenuePoint[]>(() => monthlyAll.slice(-8).map(({ label, revenue }) => ({ label, revenue })), [monthlyAll])
  const thisMonth = monthlyAll[monthlyAll.length - 1]
  const lastMonth = monthlyAll[monthlyAll.length - 2]

  const klienMonthlyAll = useMemo(() => {
    const map: Record<string, number> = {}
    for (const k of kliens) {
      const raw = monthKey(k.createdAt)
      if (raw.length < 7) continue
      map[raw] = (map[raw] ?? 0) + 1
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
  }, [kliens])
  const thisKlienBaru = klienMonthlyAll[klienMonthlyAll.length - 1] ?? 0
  const lastKlienBaru = klienMonthlyAll[klienMonthlyAll.length - 2] ?? 0

  const klienData = useMemo(() =>
    [...kliens].filter(k => k.totalNilai > 0).sort((a, b) => b.totalNilai - a.totalNilai).slice(0, 7)
      .map(k => ({ label: k.nama.length > 18 ? k.nama.slice(0, 16) + '…' : k.nama, value: k.totalNilai }))
  , [kliens])

  const materialData = useMemo(() => {
    const map: Record<string, { label: string; value: number }> = {}
    for (const p of selesai) {
      if (p.multiColorData?.length) {
        for (const e of p.multiColorData) {
          if (!map[e.materialNama]) map[e.materialNama] = { label: e.materialNama, value: 0 }
          map[e.materialNama].value += e.beratGram
        }
      } else {
        const key = p.materialNama ?? 'Unknown'
        if (!map[key]) map[key] = { label: key, value: 0 }
        map[key].value += p.beratMaterial * 1000
      }
    }
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 6)
      .map(m => ({ ...m, label: m.label.length > 18 ? m.label.slice(0, 16) + '…' : m.label }))
  }, [selesai])

  const printerData = useMemo(() => {
    const cnt: Record<string, number> = {}
    for (const p of selesai) cnt[p.printerId] = (cnt[p.printerId] ?? 0) + 1
    return [...printers]
      .map(pr => ({ label: pr.nama.length > 16 ? pr.nama.slice(0, 14) + '…' : pr.nama, value: pr.totalJam, color: printerStatusColor[pr.status] ?? 'var(--text-muted)' }))
      .sort((a, b) => b.value - a.value)
  }, [printers, selesai])

  const statusCounts = useMemo(() => {
    const c = { Antrian: 0, Printing: 0, Selesai: 0, Dibatalkan: 0 }
    for (const p of pesanans) c[p.status as keyof typeof c]++
    return c
  }, [pesanans])
  const statusData = useMemo(() =>
    (Object.entries(statusCounts) as [keyof typeof statusCounts, number][])
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({ label, value, color: statusColor[label] }))
  , [statusCounts])
  const resolvedCount = statusCounts.Selesai + statusCounts.Dibatalkan
  const completionRate = resolvedCount > 0 ? (statusCounts.Selesai / resolvedCount) * 100 : 0

  if ((status === 'loading' && !kpi) || pesananLoading) return <div className="page-loading"><div className="spinner" /><span>Memuat dashboard...</span></div>
  if (!kpi) return <div className="alert alert-danger">Gagal memuat data dashboard.</div>

  const profit = kpi.profitBulanIni
  const profitColor = profit >= 0 ? 'var(--success)' : 'var(--danger)'
  const profitLight = profit >= 0 ? 'var(--success-light)' : 'var(--danger-light)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>

      {/* Refresh */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => dispatch(fetchKPI())} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 8A6.5 6.5 0 0114 5M14.5 8A6.5 6.5 0 012 11"/><polyline points="12,3 14,5 12,7"/><polyline points="4,9 2,11 4,13"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Section: Order */}
      <SectionLabel>Performa Order</SectionLabel>
      <div className="animate-fade-up rgrid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)' }}>
        <KpiCard label="Order Aktif"        value={kpi.totalOrderAktif}           color="var(--accent)"          accent="var(--accent)"          accentLight="var(--accent-light)"  icon={<IcOrderAktif />} />
        <KpiCard label="Antrian"            value={kpi.totalOrderAntrian}         color="var(--status-antrian)"  accent="var(--status-antrian)"  accentLight="var(--status-antrian-bg)" icon={<IcAntrian />} />
        <KpiCard label="Sedang Print"       value={kpi.totalOrderPrinting}        color="var(--status-printing)" accent="var(--status-printing)" accentLight="var(--status-printing-bg)" icon={<IcPrinting />} />
        <KpiCard label="Selesai Bulan Ini"  value={kpi.totalOrderSelesaiBulanIni} color="var(--status-selesai)"  accent="var(--status-selesai)"  accentLight="var(--status-selesai-bg)"  icon={<IcSelesai />} trend={kpi.trendOrderSelesaiPct} />
      </div>

      {/* Section: Keuangan */}
      <SectionLabel>Keuangan Bulan Ini</SectionLabel>
      <div className="animate-fade-up-1 rgrid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
        <KpiCard label="Pendapatan"  value={formatRp(kpi.totalPendapatanBulanIni)}  color="var(--success)" accent="var(--success)" accentLight="var(--success-light)" icon={<IcPendapatan />} trend={kpi.trendPendapatanPct} />
        <KpiCard label="Pengeluaran" value={formatRp(kpi.totalPengeluaranBulanIni)} color="var(--danger)"  accent="var(--danger)"  accentLight="var(--danger-light)"  icon={<IcPengeluaran />} trend={kpi.trendPengeluaranPct} invertTrend />
        <KpiCard label="Profit"      value={formatRp(profit)}                        color={profitColor}    accent={profitColor}    accentLight={profitLight}           icon={<IcProfit />} trend={kpi.trendProfitPct} />
      </div>

      {/* Section: Tren & Performa (moved from Statistik) */}
      <SectionLabel>Tren & Performa</SectionLabel>
      <div className="animate-fade-up-1 rgrid-main-side" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-md)', alignItems: 'stretch' }}>

        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>Revenue Bulan Ini</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {formatRp(thisMonth?.revenue ?? 0)}
            </span>
            <TrendChip change={pctChange(thisMonth?.revenue ?? 0, lastMonth?.revenue ?? 0)} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>vs bulan lalu</span>
          </div>
          <div style={{ height: 220 }}>
            <LineChart data={monthlyData} series={revenueSeries} formatValue={formatRp} emptyMessage="Belum cukup data untuk tren revenue" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', height: '100%' }}>

          {/* Goal card — tingkat penyelesaian pesanan */}
          <div style={{
            flex: 1, borderRadius: 'var(--radius-lg)', padding: '20px 22px',
            background: 'linear-gradient(160deg,var(--bg-surface-3),var(--bg-surface))',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 8 }}>
                Kualitas Pengerjaan
              </div>
              <div style={{ fontSize: 15, fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: 'var(--text-primary)' }}>Tingkat Penyelesaian</div>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  {resolvedCount > 0 ? `${completionRate.toFixed(0)}%` : '–'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{statusCounts.Selesai} dari {resolvedCount} order</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${completionRate}%`, background: 'linear-gradient(90deg,var(--success),var(--teal))', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>
          </div>

          {/* Insight card — pertumbuhan klien */}
          <div className="card" style={{
            flex: 1, padding: '18px 22px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="5.5" r="2.5" /><path d="M1 14c0-2.8 2.2-5 5-5 1.2 0 2.3.4 3.2 1" /><circle cx="12" cy="5" r="2" /><path d="M10.5 12.5c.6-1.6 2.4-1.8 4-.5" />
                </svg>
              </div>
              <span style={{ fontSize: 14, fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: 'var(--text-primary)' }}>Pertumbuhan Klien</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {thisKlienBaru > 0 ? (
                <>Klien baru bulan ini <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{thisKlienBaru} klien</span></>
              ) : (
                <>Belum ada klien baru bulan ini</>
              )}
              {' '}
              <TrendChip change={pctChange(thisKlienBaru, lastKlienBaru)} />
              {' '}dibanding bulan lalu.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Printer & Material */}
      <SectionLabel>Status Printer & Material</SectionLabel>
      <div className="animate-fade-up-2 rgrid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
        <KpiCard label="Printer Idle"          value={kpi.totalPrinterIdle}     color="var(--status-idle)"    accentLight="var(--status-selesai-bg)" icon={<IcPrinterIdle />} />
        <KpiCard label="Printer Printing"      value={kpi.totalPrinterPrinting} color="var(--status-printing)" accentLight="var(--status-printing-bg)" icon={<IcPrinting />} />
        <KpiCard
          label="Material Hampir Habis"
          value={kpi.totalMaterialHampirHabis}
          color={kpi.totalMaterialHampirHabis > 0 ? 'var(--warning)' : 'var(--text-secondary)'}
          accent={kpi.totalMaterialHampirHabis > 0 ? 'var(--warning)' : undefined}
          accentLight={kpi.totalMaterialHampirHabis > 0 ? 'var(--warning-light)' : 'var(--bg-surface-2)'}
          icon={<IcMaterial />}
        />
      </div>

      {/* Alert: Deadline */}
      {kpi.orderMendekatiDeadline.length > 0 && (
        <div className="animate-fade-up-2 card" style={{ border: '1px solid var(--warning)', overflow: 'hidden' }}>
          <div style={{ padding: '11px var(--spacing-lg)', background: 'var(--warning-light)', borderBottom: '1px solid var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1L1 14h14L8 1z"/><line x1="8" y1="6" x2="8" y2="9"/><circle cx="8" cy="12" r="0.5" fill="var(--warning)"/>
            </svg>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mendekati Deadline</span>
          </div>
          {kpi.orderMendekatiDeadline.map((p, i) => (
            <div key={p.id} className="row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px var(--spacing-lg)', borderBottom: i < kpi.orderMendekatiDeadline.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{p.nama}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}> — {p.klien}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {p.deadline && <span style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 600 }}>{formatTgl(p.deadline)}</span>}
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert: Material */}
      {kpi.materialHampirHabis.length > 0 && (
        <div className="animate-fade-up-2 card" style={{ border: '1px solid var(--warning)', overflow: 'hidden' }}>
          <div style={{ padding: '11px var(--spacing-lg)', background: 'var(--warning-light)', borderBottom: '1px solid var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IcMaterial />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stok Material Hampir Habis</span>
          </div>
          {kpi.materialHampirHabis.map((m, i) => (
            <div key={m.id} className="row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px var(--spacing-lg)', borderBottom: i < kpi.materialHampirHabis.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <span style={{ fontWeight: 500, fontSize: '13px' }}>
                {m.nama}{m.warna ? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {m.warna}</span> : null}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 700 }}>Sisa {m.stok} kg</span>
            </div>
          ))}
        </div>
      )}

      {/* Section: Analisis (moved from Statistik) */}
      <SectionLabel>Analisis</SectionLabel>
      <div className="animate-fade-up-2 rgrid-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
        <ChartCard title="Status Pesanan" badge={`${pesanans.length} total`} accent="var(--warning)">
          <DonutChart data={statusData} centerValue={pesanans.length} centerLabel="Total" />
        </ChartCard>

        <ChartCard title="Top Klien by Revenue" badge={klienData.length > 0 ? `${klienData.length} klien` : undefined} accent="var(--teal)">
          <BarChart data={klienData} color="var(--teal)" formatValue={formatRp} />
        </ChartCard>

        <ChartCard title="Material Terpakai" badge="gram · selesai" accent="var(--violet)">
          <BarChart data={materialData} color="var(--violet)" formatValue={v => v >= 1000 ? `${(v / 1000).toFixed(1)}kg` : `${v}g`} />
        </ChartCard>

        <ChartCard title="Utilisasi Printer" badge="jam terpakai" accent="var(--success)">
          <BarChart data={printerData} formatValue={v => `${v}j`} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, justifyContent: 'center' }}>
            {(Object.entries(printerStatusColor) as [string, string][]).map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0 }} />{label}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Activity Timeline */}
      <div className="animate-fade-up-3 card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px var(--spacing-lg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>Aktivitas Terbaru</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{kpi.aktivitasTerbaru.length} entri</span>
        </div>
        <ActivityTimeline items={kpi.aktivitasTerbaru} />
      </div>

    </div>
  )
}
