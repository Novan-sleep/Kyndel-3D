import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchKPI } from '../store/dashboardSlice'
import { formatRp, formatTgl } from '../lib/api'
import { DashboardKPI } from '../types'
import StatusBadge from '../components/ui/StatusBadge'

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

interface KpiCardProps {
  label: string
  value: string | number
  color?: string
  accent?: string
  accentLight?: string
  icon?: React.ReactNode
}

function KpiCard({ label, value, color, accent, accentLight, icon }: KpiCardProps) {
  return (
    <div className="kpi-card">
      {accent && <div className="kpi-card-accent" style={{ background: accent }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div className="kpi-label">{label}</div>
        {icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: accentLight ?? 'var(--bg-surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color ?? 'var(--text-secondary)', flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
      <div className="kpi-value" style={{ color: color ?? 'var(--text-primary)' }}>{value}</div>
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

  useEffect(() => { dispatch(fetchKPI()) }, [dispatch])

  if (status === 'loading' && !kpi) return <div className="page-loading"><div className="spinner" /><span>Memuat dashboard...</span></div>
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
        <KpiCard label="Selesai Bulan Ini"  value={kpi.totalOrderSelesaiBulanIni} color="var(--status-selesai)"  accent="var(--status-selesai)"  accentLight="var(--status-selesai-bg)"  icon={<IcSelesai />} />
      </div>

      {/* Section: Keuangan */}
      <SectionLabel>Keuangan Bulan Ini</SectionLabel>
      <div className="animate-fade-up-1 rgrid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
        <KpiCard label="Pendapatan"  value={formatRp(kpi.totalPendapatanBulanIni)}  color="var(--success)" accent="var(--success)" accentLight="var(--success-light)" icon={<IcPendapatan />} />
        <KpiCard label="Pengeluaran" value={formatRp(kpi.totalPengeluaranBulanIni)} color="var(--danger)"  accent="var(--danger)"  accentLight="var(--danger-light)"  icon={<IcPengeluaran />} />
        <KpiCard label="Profit"      value={formatRp(profit)}                        color={profitColor}    accent={profitColor}    accentLight={profitLight}           icon={<IcProfit />} />
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

      {/* Activity Timeline */}
      <div className="animate-fade-up-3 card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px var(--spacing-lg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Sora', sans-serif" }}>Aktivitas Terbaru</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{kpi.aktivitasTerbaru.length} entri</span>
        </div>
        <ActivityTimeline items={kpi.aktivitasTerbaru} />
      </div>

    </div>
  )
}
