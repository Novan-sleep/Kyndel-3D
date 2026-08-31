import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
  AreaChart, Area,
} from 'recharts'
import { api, formatRp } from '../lib/api'
import { pctChange, TrendChip, StatTile } from '../lib/trend'
import { Pesanan, Klien, Printer } from '../types'

// ── Palette & constants ───────────────────────────────────────────────────────

const PALETTE = ['#6366f1','#4fd1c5','#f59e0b','#22c55e','#a78bfa','#ef4444','#06b6d4','#84cc16']
const TICK    = { fontSize: 11, fill: '#515878' }
const GRID    = 'rgba(255,255,255,0.05)'
const MONTHS  = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']

function fmtShort(n: number): string {
  const a = Math.abs(n)
  if (a >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`
  if (a >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}jt`
  if (a >= 1_000)         return `${(n / 1_000).toFixed(0)}rb`
  return String(Math.round(n))
}

function monthKey(iso?: string): string {
  return (iso ?? '').substring(0, 7)
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'linear-gradient(145deg,#1e2235f0,#171b27f0)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(99,102,241,0.22)',
      borderRadius: 12, padding: '10px 16px',
      boxShadow: '0 16px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
      minWidth: 160, fontSize: 12,
    }}>
      <div style={{
        fontWeight: 700, color: '#eef0f6', fontSize: 13,
        fontFamily: "'Sora',sans-serif", marginBottom: 8,
        paddingBottom: 7, borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:20, marginTop: i > 0 ? 5 : 0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, color:'#8b91a8' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background: p.color ?? p.fill, display:'inline-block', flexShrink:0, boxShadow:`0 0 5px ${p.color ?? p.fill}` }} />
            {p.name}
          </div>
          <span style={{ fontWeight:700, color:'#eef0f6', fontFamily:"'Sora',sans-serif" }}>
            {fmt ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Chart Card ────────────────────────────────────────────────────────────────

function ChartCard({ title, badge, accent = '#6366f1', children }: {
  title: string; badge?: string; accent?: string; children: React.ReactNode
}) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        padding: '13px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:3, height:16, borderRadius:2, background:accent, boxShadow:`0 0 10px ${accent}90`, flexShrink:0 }} />
          <span style={{ fontSize:13, fontFamily:"'Sora',sans-serif", fontWeight:700, color:'var(--text-primary)' }}>{title}</span>
        </div>
        {badge && (
          <span style={{ fontSize:10.5, color:'var(--text-muted)', background:'var(--bg-surface-2)', padding:'3px 10px', borderRadius:20, border:'1px solid var(--border)', fontWeight:500 }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding:'16px 20px' }}>{children}</div>
    </div>
  )
}

function EmptyChart({ h = 180 }: { h?: number }) {
  return (
    <div style={{ height:h, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, color:'var(--text-muted)' }}>
      <svg width="40" height="40" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity={0.3}>
        <rect x="2" y="9" width="3" height="5" rx="0.8"/><rect x="6.5" y="5" width="3" height="9" rx="0.8"/><rect x="11" y="2" width="3" height="12" rx="0.8"/>
      </svg>
      <span style={{ fontSize:12, fontWeight:500, opacity:0.5 }}>Belum ada data</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StatistikPage() {
  const [pesanans, setPesanans] = useState<Pesanan[]>([])
  const [kliens,   setKliens]   = useState<Klien[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([api.pesanan.getAll(), api.klien.getAll(), api.printer.getAll()]).then(([p, k, pr]) => {
      if (p.success)  setPesanans(p.data)
      if (k.success)  setKliens(k.data)
      if (pr.success) setPrinters(pr.data)
      setLoading(false)
    })
  }, [])

  const selesai      = useMemo(() => pesanans.filter(p => p.status === 'Selesai'), [pesanans])
  const totalRevenue = useMemo(() => selesai.reduce((a, p) => a + p.hargaFinal, 0), [selesai])

  // Monthly revenue/pesanan buckets (semua bulan, terurut)
  const monthlyAll = useMemo(() => {
    const map: Record<string, { label: string; revenue: number; pesanan: number }> = {}
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

  const monthlyData = useMemo(() => monthlyAll.slice(-8), [monthlyAll])
  const thisMonth = monthlyAll[monthlyAll.length - 1]
  const lastMonth = monthlyAll[monthlyAll.length - 2]
  const thisAvg = thisMonth && thisMonth.pesanan > 0 ? thisMonth.revenue / thisMonth.pesanan : 0
  const lastAvg = lastMonth && lastMonth.pesanan > 0 ? lastMonth.revenue / lastMonth.pesanan : 0

  // Klien baru per bulan
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

  // Top klien
  const klienData = useMemo(() =>
    [...kliens].filter(k => k.totalNilai > 0).sort((a, b) => b.totalNilai - a.totalNilai).slice(0, 7)
      .map(k => ({ name: k.nama.length > 18 ? k.nama.slice(0, 16) + '…' : k.nama, value: k.totalNilai, pesanan: k.totalPesanan }))
  , [kliens])

  // Material usage
  const materialData = useMemo(() => {
    const map: Record<string, { name: string; gram: number; pesanan: number }> = {}
    for (const p of selesai) {
      if (p.multiColorData?.length) {
        for (const e of p.multiColorData) {
          if (!map[e.materialNama]) map[e.materialNama] = { name: e.materialNama, gram: 0, pesanan: 0 }
          map[e.materialNama].gram += e.beratGram
          map[e.materialNama].pesanan++
        }
      } else {
        const key = p.materialNama ?? 'Unknown'
        if (!map[key]) map[key] = { name: key, gram: 0, pesanan: 0 }
        map[key].gram += p.beratMaterial * 1000
        map[key].pesanan++
      }
    }
    return Object.values(map).sort((a, b) => b.gram - a.gram).slice(0, 6)
      .map(m => ({ ...m, name: m.name.length > 18 ? m.name.slice(0, 16) + '…' : m.name }))
  }, [selesai])

  // Printer utilization
  const printerData = useMemo(() => {
    const cnt: Record<string, number> = {}
    for (const p of selesai) cnt[p.printerId] = (cnt[p.printerId] ?? 0) + 1
    return [...printers]
      .map(pr => ({ name: pr.nama.length > 16 ? pr.nama.slice(0, 14) + '…' : pr.nama, jam: pr.totalJam, selesai: cnt[pr.id] ?? 0, status: pr.status }))
      .sort((a, b) => b.jam - a.jam)
  }, [printers, selesai])

  // Status distribution + tingkat penyelesaian
  const statusCounts = useMemo(() => {
    const c = { Antrian: 0, Printing: 0, Selesai: 0, Dibatalkan: 0 }
    for (const p of pesanans) c[p.status as keyof typeof c]++
    return c
  }, [pesanans])
  const statusData = useMemo(() => [
    { name: 'Antrian',    value: statusCounts.Antrian,    color: '#f59e0b' },
    { name: 'Printing',   value: statusCounts.Printing,   color: '#6366f1' },
    { name: 'Selesai',    value: statusCounts.Selesai,    color: '#22c55e' },
    { name: 'Dibatalkan', value: statusCounts.Dibatalkan, color: '#6b7280' },
  ].filter(d => d.value > 0), [statusCounts])
  const resolvedCount = statusCounts.Selesai + statusCounts.Dibatalkan
  const completionRate = resolvedCount > 0 ? (statusCounts.Selesai / resolvedCount) * 100 : 0

  if (loading) return <div className="page-loading"><div className="spinner" /><span>Memuat statistik...</span></div>

  const klienH = Math.max(200, klienData.length * 46 + 40)
  const matH   = Math.max(180, materialData.length * 46 + 40)
  const prH    = Math.max(160, printerData.length * 46 + 40)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── Shared gradient defs (referenced by all charts via url(#id)) ── */}
      <svg width="0" height="0" aria-hidden="true" style={{ position:'absolute', overflow:'hidden' }}>
        <defs>
          {PALETTE.map((c, i) => (
            <linearGradient key={i} id={`s3b${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c} stopOpacity={0.42}/>
              <stop offset="100%" stopColor={c} stopOpacity={1}/>
            </linearGradient>
          ))}
          <linearGradient id="s3area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.38}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
          </linearGradient>
        </defs>
      </svg>

      {/* ── Hero: Revenue chart + Goal/Insight column ────────────────────── */}
      <div className="animate-fade-up" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, alignItems:'stretch' }}>

        <div style={{
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
          overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', padding: '20px 22px',
        }}>
          <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, marginBottom:6 }}>Revenue Bulan Ini</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap', marginBottom:16 }}>
            <span style={{ fontFamily:"'Sora',sans-serif", fontSize:30, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.03em' }}>
              {formatRp(thisMonth?.revenue ?? 0)}
            </span>
            <TrendChip change={pctChange(thisMonth?.revenue ?? 0, lastMonth?.revenue ?? 0)} />
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>vs bulan lalu</span>
          </div>

          {monthlyData.length < 2 ? <EmptyChart h={220} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top:10, right:10, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false}/>
                <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false}/>
                <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={52}/>
                <Tooltip content={<Tip fmt={formatRp}/>} cursor={{ stroke:'rgba(99,102,241,0.15)', strokeWidth:1 }}/>
                <Area
                  type="monotone" dataKey="revenue" name="Revenue"
                  stroke="#6366f1" strokeWidth={2.5} fill="url(#s3area)"
                  dot={{ fill:'#6366f1', stroke:'#171b27', strokeWidth:2.5, r:4 }}
                  activeDot={{ r:6, stroke:'#6366f1', strokeWidth:2, fill:'#171b27' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>

          {/* Goal card — tingkat penyelesaian pesanan */}
          <div style={{
            flex:1, borderRadius:'var(--radius-lg)', padding:'20px 22px',
            background:'linear-gradient(160deg,var(--bg-surface-3),var(--bg-surface))',
            border:'1px solid var(--border)', boxShadow:'0 4px 24px rgba(0,0,0,0.25)',
            display:'flex', flexDirection:'column', justifyContent:'space-between',
          }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--text-muted)', marginBottom:8 }}>
                Kualitas Pengerjaan
              </div>
              <div style={{ fontSize:15, fontFamily:"'Sora',sans-serif", fontWeight:700, color:'var(--text-primary)' }}>Tingkat Penyelesaian</div>
            </div>
            <div style={{ marginTop:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.03em' }}>
                  {resolvedCount > 0 ? `${completionRate.toFixed(0)}%` : '–'}
                </span>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{statusCounts.Selesai} dari {resolvedCount} order</span>
              </div>
              <div style={{ width:'100%', height:6, background:'var(--bg-surface-2)', borderRadius:'var(--radius-full)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${completionRate}%`, background:'linear-gradient(90deg,var(--success),var(--teal))', borderRadius:'var(--radius-full)' }} />
              </div>
            </div>
          </div>

          {/* Insight card — pertumbuhan klien */}
          <div style={{
            flex:1, borderRadius:'var(--radius-lg)', padding:'18px 22px', background:'var(--bg-surface)',
            border:'1px solid var(--border)', boxShadow:'0 4px 24px rgba(0,0,0,0.2)',
            display:'flex', flexDirection:'column', justifyContent:'center', gap:10,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:10, background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="5.5" r="2.5"/><path d="M1 14c0-2.8 2.2-5 5-5 1.2 0 2.3.4 3.2 1"/><circle cx="12" cy="5" r="2"/><path d="M10.5 12.5c.6-1.6 2.4-1.8 4-.5"/>
                </svg>
              </div>
              <span style={{ fontSize:14, fontFamily:"'Sora',sans-serif", fontWeight:700, color:'var(--text-primary)' }}>Pertumbuhan Klien</span>
            </div>
            <p style={{ fontSize:12.5, color:'var(--text-secondary)', lineHeight:1.5 }}>
              {thisKlienBaru > 0 ? (
                <>Klien baru bulan ini <span style={{ color:'var(--text-primary)', fontWeight:700 }}>{thisKlienBaru} klien</span></>
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

      {/* ── KPI Row (bulan ini vs bulan lalu) ─────────────────────────────── */}
      <div className="animate-fade-up-1" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <StatTile label="Pesanan Selesai Bulan Ini" value={String(thisMonth?.pesanan ?? 0)} change={pctChange(thisMonth?.pesanan ?? 0, lastMonth?.pesanan ?? 0)} />
        <StatTile label="Revenue Bulan Ini" value={formatRp(thisMonth?.revenue ?? 0)} change={pctChange(thisMonth?.revenue ?? 0, lastMonth?.revenue ?? 0)} />
        <StatTile label="Rata-rata Order Bulan Ini" value={formatRp(Math.round(thisAvg))} change={pctChange(thisAvg, lastAvg)} />
        <StatTile label="Total Revenue (Semua Waktu)" value={formatRp(totalRevenue)} change={null} />
      </div>

      {/* ── Status · Top Klien · Material · Printer ───────────────────────── */}
      <div className="animate-fade-up-2" style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr 1fr 1fr', gap:16 }}>

        {/* Status Pesanan */}
        <ChartCard title="Status Pesanan" badge={`${pesanans.length} total`} accent="#f59e0b">
          {statusData.length === 0 ? <EmptyChart h={220} /> : (
            <>
              <div style={{ position:'relative' }}>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={statusData} cx="50%" cy="50%"
                      innerRadius="52%" outerRadius="78%"
                      paddingAngle={4} dataKey="value"
                      startAngle={90} endAngle={-270}
                      labelLine={false}
                    >
                      {statusData.map((d, i) => (
                        <Cell key={i} fill={d.color} stroke="rgba(0,0,0,0.25)" strokeWidth={1}/>
                      ))}
                    </Pie>
                    <Tooltip content={<Tip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
                  <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Sora',sans-serif", lineHeight:1, color:'var(--text-primary)' }}>{pesanans.length}</div>
                  <div style={{ fontSize:9, color:'var(--text-muted)', marginTop:2, textTransform:'uppercase', letterSpacing:'0.06em' }}>Total</div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:10 }}>
                {statusData.map(d => (
                  <div key={d.name} style={{
                    display:'flex', alignItems:'center', gap:8, padding:'5px 10px',
                    borderRadius:9, background:'var(--bg-surface-2)',
                    border:'1px solid var(--border)',
                  }}>
                    <span style={{ width:7, height:7, borderRadius:2, background:d.color, flexShrink:0, boxShadow:`0 0 6px ${d.color}90` }}/>
                    <span style={{ fontSize:11, color:'var(--text-muted)', flex:1 }}>{d.name}</span>
                    <span style={{ fontSize:12, fontWeight:800, color:'var(--text-primary)', fontFamily:"'Sora',sans-serif" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

        {/* Top Klien */}
        <ChartCard title="Top Klien by Revenue" badge={klienData.length > 0 ? `${klienData.length} klien` : undefined} accent="#4fd1c5">
          {klienData.length === 0 ? <EmptyChart h={klienH}/> : (
            <ResponsiveContainer width="100%" height={klienH}>
              <BarChart layout="vertical" data={klienData} margin={{ top:2, right:68, left:4, bottom:2 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false}/>
                <XAxis type="number" tick={TICK} tickFormatter={fmtShort} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" width={116} tick={TICK} axisLine={false} tickLine={false}/>
                <Tooltip content={<Tip fmt={formatRp}/>} cursor={{ fill:'rgba(255,255,255,0.025)' }}/>
                <Bar dataKey="value" name="Revenue" radius={[0,8,8,0]} maxBarSize={20}>
                  {klienData.map((_, i) => <Cell key={i} fill={`url(#s3b${i % PALETTE.length})`}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Material Usage */}
        <ChartCard title="Material Terpakai" badge="gram · selesai" accent="#a78bfa">
          {materialData.length === 0 ? <EmptyChart h={matH}/> : (
            <ResponsiveContainer width="100%" height={matH}>
              <BarChart layout="vertical" data={materialData} margin={{ top:2, right:52, left:4, bottom:2 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false}/>
                <XAxis type="number" tick={TICK} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : `${v}`} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" width={104} tick={TICK} axisLine={false} tickLine={false}/>
                <Tooltip content={<Tip fmt={(v: number) => v >= 1000 ? `${(v/1000).toFixed(2)} kg` : `${v.toFixed(0)} g`}/>} cursor={{ fill:'rgba(255,255,255,0.025)' }}/>
                <Bar dataKey="gram" name="Berat" radius={[0,8,8,0]} maxBarSize={20}>
                  {materialData.map((_, i) => <Cell key={i} fill={`url(#s3b${(i + 2) % PALETTE.length})`}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Printer Utilization */}
        <ChartCard title="Utilisasi Printer" badge="jam terpakai" accent="#22c55e">
          {printerData.length === 0 ? <EmptyChart h={prH}/> : (
            <>
              <ResponsiveContainer width="100%" height={prH}>
                <BarChart layout="vertical" data={printerData} margin={{ top:2, right:42, left:4, bottom:2 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false}/>
                  <XAxis type="number" tick={TICK} tickFormatter={v => `${v}j`} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" width={98} tick={TICK} axisLine={false} tickLine={false}/>
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null
                      const d = printerData.find(p => p.name === label)
                      return (
                        <Tip active={active} label={label}
                          payload={[
                            { name:'Total Jam',    value:`${payload[0].value} jam`, color:'#a78bfa', fill:'#a78bfa' },
                            ...(d ? [{ name:'Order Selesai', value:`${d.selesai}x`, color:'#22c55e', fill:'#22c55e' }] : []),
                          ]}
                        />
                      )
                    }}
                    cursor={{ fill:'rgba(255,255,255,0.025)' }}
                  />
                  <Bar dataKey="jam" name="Total Jam" radius={[0,8,8,0]} maxBarSize={20}>
                    {printerData.map((pr, i) => {
                      const c = pr.status === 'Idle' ? '#22c55e' : pr.status === 'Printing' ? '#6366f1' : pr.status === 'Maintenance' ? '#f59e0b' : '#ef4444'
                      return <Cell key={i} fill={c}/>
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:8, justifyContent:'center' }}>
                {([['#22c55e','Idle'],['#6366f1','Printing'],['#f59e0b','Maintenance'],['#ef4444','Rusak']] as [string,string][]).map(([c, l]) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text-muted)' }}>
                    <span style={{ width:6, height:6, borderRadius:2, background:c, flexShrink:0 }}/>{l}
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

      </div>
    </div>
  )
}
