import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPesanan } from '../store/pesananSlice'
import { fetchKliens } from '../store/klienSlice'
import { fetchPrinters } from '../store/printersSlice'
import { formatRp } from '../lib/api'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import LineChart, { LineSeries } from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

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

export default function StatistikPage() {
  const dispatch = useAppDispatch()
  const pesanans = useAppSelector((s) => s.pesanan.items)
  const kliens = useAppSelector((s) => s.klien.items)
  const printers = useAppSelector((s) => s.printers.items)
  const loading = useAppSelector((s) => s.pesanan.status === 'loading' && s.pesanan.items.length === 0)

  useEffect(() => {
    dispatch(fetchPesanan())
    dispatch(fetchKliens())
    dispatch(fetchPrinters())
  }, [dispatch])

  const selesai = useMemo(() => pesanans.filter(p => p.status === 'Selesai'), [pesanans])
  const totalRevenue = useMemo(() => selesai.reduce((a, p) => a + p.hargaFinal, 0), [selesai])
  const rataRata = selesai.length > 0 ? Math.round(totalRevenue / selesai.length) : 0

  const monthlyData = useMemo<RevenuePoint[]>(() => {
    const map: Record<string, RevenuePoint> = {}
    for (const p of selesai) {
      const raw = (p.createdAt ?? '').substring(0, 7)
      if (raw.length < 7) continue
      if (!map[raw]) {
        const [y, m] = raw.split('-')
        map[raw] = { label: `${MONTHS[+m - 1]} '${y.slice(2)}`, revenue: 0 }
      }
      map[raw].revenue += p.hargaFinal
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-8).map(([, v]) => v)
  }, [selesai])

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

  const statusData = useMemo(() => {
    const c = { Antrian: 0, Printing: 0, Selesai: 0, Dibatalkan: 0 }
    for (const p of pesanans) c[p.status as keyof typeof c]++
    return (Object.entries(c) as [keyof typeof c, number][])
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({ label, value, color: statusColor[label] }))
  }, [pesanans])

  if (loading) return <div className="page-loading"><div className="spinner" /><span>Memuat statistik...</span></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>

      <div className="animate-fade-up rgrid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)' }}>
        <KpiCard
          label="Pesanan Selesai" value={selesai.length} sub={`dari ${pesanans.length} total order`}
          color="var(--success)" accent="var(--success)" accentLight="var(--success-light)"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4L6.5 11 3 7.5" /></svg>}
        />
        <KpiCard
          label="Total Klien" value={kliens.length} sub="klien terdaftar"
          color="var(--accent)" accent="var(--accent)" accentLight="var(--accent-light)"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="5.5" r="2.5" /><path d="M1 14c0-2.8 2.2-5 5-5 1.2 0 2.3.4 3.2 1" /><circle cx="12" cy="5" r="2" /><path d="M10.5 12.5c.6-1.6 2.4-1.8 4-.5" /></svg>}
        />
        <KpiCard
          label="Total Revenue" value={formatRp(totalRevenue)} sub="dari order selesai"
          color="var(--teal)" accent="var(--teal)" accentLight="var(--teal-light)"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><path d="M8 4.5v1M8 10.5v1" /><path d="M5.8 6.5c0-.8.9-1.5 2.2-1.5s2.2.7 2.2 1.5-1 1-2.2 1.3c-1.3.3-2.2.8-2.2 1.7 0 .8 1 1.5 2.2 1.5s2.2-.7 2.2-1.5" /></svg>}
        />
        <KpiCard
          label="Rata-rata / Order" value={formatRp(rataRata)} sub="nilai rata-rata"
          color="var(--violet)" accent="var(--violet)" accentLight="var(--violet-light)"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,12 4.5,8 7.5,10 12,4.5" /><polyline points="10,4.5 12,4.5 12,6.5" /></svg>}
        />
      </div>

      <div className="animate-fade-up-1 rgrid-main-side" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 'var(--spacing-md)' }}>
        <ChartCard title="Tren Revenue Bulanan" badge={monthlyData.length > 0 ? `${monthlyData.length} bulan` : undefined} accent="var(--accent)">
          <div style={{ height: 220 }}>
            <LineChart data={monthlyData} series={revenueSeries} formatValue={formatRp} emptyMessage="Belum cukup data untuk tren revenue" />
          </div>
        </ChartCard>

        <ChartCard title="Status Pesanan" badge={`${pesanans.length} total`} accent="var(--warning)">
          <DonutChart data={statusData} centerValue={pesanans.length} centerLabel="Total" />
        </ChartCard>
      </div>

      <div className="animate-fade-up-2 rgrid-wide-3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
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
    </div>
  )
}
