import { useState, useEffect, useCallback, useMemo, Fragment } from 'react'
import { api, formatRp, formatTgl } from '../lib/api'
import { Pesanan, Printer, Material, Setting, ColorEntry } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="form-label">
      {children}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
    </label>
  )
}

function MatInfo({ mat }: { mat: { hargaJualPerGram: number; hargaBeliPerGram: number; marginPerGram: number } | undefined; }) {
  if (!mat) return null
  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  return (
    <div style={{ marginTop: '5px', padding: '5px 10px', background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', fontSize: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>Jual: <strong style={{ color: 'var(--accent)' }}>{fmt(mat.hargaJualPerGram)}/g</strong></span>
      <span style={{ color: 'var(--text-muted)' }}>Beli: <strong style={{ color: 'var(--text-primary)' }}>{fmt(mat.hargaBeliPerGram)}/g</strong></span>
      <span style={{ color: 'var(--text-muted)' }}>Margin: <strong style={{ color: 'var(--success)' }}>{fmt(mat.marginPerGram)}/g</strong></span>
    </div>
  )
}

function DetailModal({ pesanan, onClose }: { pesanan: Pesanan; onClose: () => void }) {
  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value ?? '—'}</span>
    </div>
  )
  const SectionHead = ({ children }: { children: string }) => (
    <div className="section-label" style={{ marginTop: 16 }}>{children}</div>
  )
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: '520px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '3px', fontFamily: "'Sora', sans-serif" }}>{pesanan.nama}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pesanan.klien}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <StatusBadge status={pesanan.status} />
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <SectionHead>Detail Order</SectionHead>
          {pesanan.tipe && row('Tipe', pesanan.tipe)}
          {row('Printer', pesanan.printerNama)}
          {pesanan.multiColorData && pesanan.multiColorData.length > 0 ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mode</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Multi Color ({pesanan.multiColorData.length} warna)</span>
              </div>
              {pesanan.multiColorData.map((entry, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 6px 12px', borderBottom: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Warna {i + 1} — {entry.materialNama}</span>
                  <span style={{ fontWeight: 500 }}>{entry.beratGram} g</span>
                </div>
              ))}
              {row('Total Berat', `${(pesanan.beratMaterial * 1000).toFixed(0)} g`)}
            </div>
          ) : (
            <>
              {row('Material', pesanan.materialNama)}
              {row('Berat', `${(pesanan.beratMaterial * 1000).toFixed(0)} g`)}
            </>
          )}
          {row('Estimasi Waktu', `${pesanan.estimasiJam} jam`)}
          {row('Markup', `${pesanan.markup}%`)}
          {pesanan.deadline && row('Deadline', formatTgl(pesanan.deadline))}
          {pesanan.catatan && row('Catatan', pesanan.catatan)}

          <SectionHead>Harga</SectionHead>
          {row('HPP', formatRp(pesanan.hpp))}
          {row('Harga Rekomendasi', <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatRp(pesanan.hargaRekomendasi)}</span>)}
          {row('Nilai Jual', <span style={{ fontWeight: 700 }}>{formatRp(pesanan.nilaiJual)}</span>)}
          {pesanan.diskonTipe && row('Diskon', (
            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
              −{formatRp(pesanan.nilaiJual - pesanan.hargaFinal)}
              {' '}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({pesanan.diskonTipe === 'persen' ? `${pesanan.diskonNilai}%` : 'nominal'})
              </span>
            </span>
          ))}
          {pesanan.diskonTipe && row('Harga Final', <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatRp(pesanan.hargaFinal)}</span>)}
          {row('Estimasi Profit', (() => {
            const p = pesanan.hargaFinal - pesanan.hpp
            return <span style={{ color: p >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{formatRp(p)}</span>
          })())}

          <SectionHead>Waktu</SectionHead>
          {row('Dibuat', formatTgl(pesanan.createdAt))}
          {pesanan.printingAt && row('Mulai Print', formatTgl(pesanan.printingAt))}
          {pesanan.completedAt && row('Selesai', formatTgl(pesanan.completedAt))}
          {pesanan.cancelledAt && row('Dibatalkan', formatTgl(pesanan.cancelledAt))}
        </div>
      </div>
    </div>
  )
}

export default function PesananPage() {
  const [pesanans, setPesanans] = useState<Pesanan[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [setting, setSetting] = useState<Setting | null>(null)
  const [klienNama, setKlienNama] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Pesanan | null>(null)
  const [confirm, setConfirm] = useState<{ action: string; item: Pesanan } | null>(null)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('semua')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('newest')
  const [form, setForm] = useState({ nama: '', klien: '', tipe: '', printerId: '', materialId: '', beratMaterial: '', estimasiJam: '', markup: '0', nilaiJual: '', diskonTipe: '', diskonNilai: '', deadline: '', catatan: '' })
  const [isMultiColor, setIsMultiColor] = useState(false)
  const [colorEntries, setColorEntries] = useState<{ materialId: string; beratGram: string }[]>([{ materialId: '', beratGram: '' }, { materialId: '', beratGram: '' }])
  const [preview, setPreview] = useState<any>(null)
  const [editPesanan, setEditPesanan] = useState<Pesanan | null>(null)
  const [editForm, setEditForm] = useState({ nama: '', klien: '', tipe: '', nilaiJual: '', diskonTipe: '', diskonNilai: '', deadline: '', catatan: '' })
  const [editError, setEditError] = useState('')
  const [invoiceMode, setInvoiceMode] = useState(false)
  const [invoiceSelected, setInvoiceSelected] = useState<Set<string>>(new Set())
  const [showInvoicePreview, setShowInvoicePreview] = useState(false)
  const [invoiceHtml, setInvoiceHtml] = useState('')
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [tagihanKepada, setTagihanKepada] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [p, pr, m, s, kn] = await Promise.all([api.pesanan.getAll(), api.printer.getAll(), api.material.getAll(), api.setting.get(), api.klien.getAllNama()])
    if (p.success) setPesanans(p.data)
    if (pr.success) setPrinters(pr.data)
    if (m.success) setMaterials(m.data)
    if (s.success) setSetting(s.data)
    if (kn.success) setKlienNama(kn.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])


  const computeDiskon = (nilaiJual: number, tipe: string, nilai: string) => {
    if (!tipe || !nilai || +nilai <= 0) return 0
    if (tipe === 'persen') return Math.round(nilaiJual * +nilai / 100)
    if (tipe === 'rupiah') return +nilai
    return 0
  }

  const handlePreview = () => {
    setError('')
    const { estimasiJam, markup, nilaiJual, printerId, beratMaterial, materialId, diskonTipe, diskonNilai } = form
    const printer = printers.find(p => p.id === printerId)
    if (!printer) { setError('Pilih printer terlebih dahulu'); return }
    if (!estimasiJam || +estimasiJam <= 0) { setError('Isi estimasi jam terlebih dahulu'); return }
    if (!setting) return

    const biayaListrik = (printer.watt / 1000) * +estimasiJam * setting.tarifListrik
    const diskonAktual = computeDiskon(+nilaiJual, diskonTipe, diskonNilai)
    const hargaFinal = +nilaiJual - diskonAktual

    if (isMultiColor) {
      const resolvedEntries = colorEntries
        .filter(e => e.materialId && +e.beratGram > 0)
        .map(e => {
          const mat = materials.find(m => m.id === e.materialId)
          if (!mat) return null
          return { nama: mat.nama, beratGram: +e.beratGram, hargaBeliPerGram: mat.hargaBeliPerGram, hargaJualPerGram: mat.hargaJualPerGram }
        })
        .filter((x): x is { nama: string; beratGram: number; hargaBeliPerGram: number; hargaJualPerGram: number } => x !== null)
      if (resolvedEntries.length === 0) { setError('Isi minimal satu warna dengan material dan berat'); return }
      const perMaterial = resolvedEntries.map((e, i) => ({ label: `Material ${i + 1} — ${e.nama} (${e.beratGram}g)`, biaya: e.beratGram * e.hargaBeliPerGram }))
      const biayaMaterial = perMaterial.reduce((s, m) => s + m.biaya, 0)
      const hargaJualMaterial = resolvedEntries.reduce((s, e) => s + e.beratGram * e.hargaJualPerGram, 0)
      const hpp = biayaMaterial + biayaListrik
      const hargaRekomendasi = (hargaJualMaterial + biayaListrik) * (1 + +markup / 100)
      setPreview({ biayaMaterial, biayaListrik, hpp, hargaRekomendasi, diskonAktual, hargaFinal, profitEstimasi: hargaFinal - hpp, perMaterial })
    } else {
      const material = materials.find(m => m.id === materialId)
      if (!material) { setError('Pilih material terlebih dahulu'); return }
      if (!beratMaterial || +beratMaterial <= 0) { setError('Isi berat material terlebih dahulu'); return }
      const beratGram = +beratMaterial
      const biayaMaterial = beratGram * material.hargaBeliPerGram
      const hargaJualMaterial = beratGram * material.hargaJualPerGram
      const hpp = biayaMaterial + biayaListrik
      const hargaRekomendasi = (hargaJualMaterial + biayaListrik) * (1 + +markup / 100)
      setPreview({ biayaMaterial, biayaListrik, hpp, hargaRekomendasi, diskonAktual, hargaFinal, profitEstimasi: hargaFinal - hpp })
    }
  }

  const toggleInvoiceItem = (id: string) => {
    setInvoiceSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const enterInvoiceMode = () => { setInvoiceMode(true); setInvoiceSelected(new Set()) }
  const exitInvoiceMode = () => { setInvoiceMode(false); setInvoiceSelected(new Set()) }

  const handlePreviewInvoice = async () => {
    if (invoiceSelected.size === 0) return
    const defaultNama = [...new Set(
      pesanans.filter(p => invoiceSelected.has(p.id)).map(p => p.klien)
    )].join(', ')
    setTagihanKepada(defaultNama)
    setInvoiceLoading(true)
    const res = await api.nota.getInvoiceHTML([...invoiceSelected], defaultNama)
    setInvoiceLoading(false)
    if (res.success) { setIframeReady(false); setInvoiceHtml(res.data); setShowInvoicePreview(true) }
    else setError(res.error)
  }

  const handleRefreshInvoice = async () => {
    setInvoiceLoading(true)
    const res = await api.nota.getInvoiceHTML([...invoiceSelected], tagihanKepada)
    setInvoiceLoading(false)
    if (res.success) { setIframeReady(false); setIframeKey(k => k + 1); setInvoiceHtml(res.data) }
    else setError(res.error)
  }

  const handleExportInvoicePDF = async () => {
    const res = await api.nota.exportInvoicePDF([...invoiceSelected], tagihanKepada)
    if (!res.success) setError(res.error)
  }

  const resetForm = () => {
    setShowForm(false); setError(''); setPreview(null)
    setIsMultiColor(false)
    setColorEntries([{ materialId: '', beratGram: '' }, { materialId: '', beratGram: '' }])
    setForm({ nama: '', klien: '', tipe: '', printerId: '', materialId: '', beratMaterial: '', estimasiJam: '', markup: '0', nilaiJual: '', diskonTipe: '', diskonNilai: '', deadline: '', catatan: '' })
  }

  const handleSubmit = async () => {
    setError('')
    let payload: any
    if (isMultiColor) {
      const validEntries = colorEntries.filter(e => e.materialId && e.beratGram && +e.beratGram > 0)
      if (validEntries.length < 2) { setError('Multi color membutuhkan minimal 2 warna'); return }
      const multiColorData: ColorEntry[] = validEntries.map(e => ({
        materialId: e.materialId,
        materialNama: materials.find(m => m.id === e.materialId)?.nama ?? '',
        beratGram: +e.beratGram
      }))
      const totalKg = validEntries.reduce((s, e) => s + +e.beratGram / 1000, 0)
      payload = { nama: form.nama, klien: form.klien, tipe: form.tipe || undefined, printerId: form.printerId, materialId: validEntries[0].materialId, beratMaterial: totalKg, estimasiJam: +form.estimasiJam, markup: +form.markup, nilaiJual: +form.nilaiJual, diskonTipe: form.diskonTipe || undefined, diskonNilai: +form.diskonNilai || 0, deadline: form.deadline || undefined, catatan: form.catatan || undefined, multiColorData }
    } else {
      payload = { nama: form.nama, klien: form.klien, tipe: form.tipe || undefined, printerId: form.printerId, materialId: form.materialId, beratMaterial: +form.beratMaterial / 1000, estimasiJam: +form.estimasiJam, markup: +form.markup, nilaiJual: +form.nilaiJual, diskonTipe: form.diskonTipe || undefined, diskonNilai: +form.diskonNilai || 0, deadline: form.deadline || undefined, catatan: form.catatan || undefined }
    }
    const res = await api.pesanan.create(payload)
    if (res.success) { resetForm(); load() }
    else setError(res.error)
  }

  const openEdit = (p: Pesanan) => {
    setEditPesanan(p)
    setEditForm({ nama: p.nama, klien: p.klien, tipe: p.tipe ?? '', nilaiJual: String(p.nilaiJual), diskonTipe: p.diskonTipe ?? '', diskonNilai: p.diskonNilai ? String(p.diskonNilai) : '', deadline: p.deadline ?? '', catatan: p.catatan ?? '' })
    setEditError('')
  }

  const handleEditSave = async () => {
    if (!editPesanan) return
    setEditError('')
    let res: any
    if (editPesanan.status === 'Antrian') {
      res = await api.pesanan.update(editPesanan.id, {
        nama: editForm.nama.trim(),
        klien: editForm.klien.trim(),
        tipe: editForm.tipe.trim() || undefined,
        nilaiJual: +editForm.nilaiJual,
        diskonTipe: editForm.diskonTipe || undefined,
        diskonNilai: +editForm.diskonNilai || 0,
        deadline: editForm.deadline || undefined,
        catatan: editForm.catatan.trim() || undefined,
      })
    } else {
      res = await api.pesanan.updateMeta(editPesanan.id, {
        catatan: editForm.catatan.trim() || undefined,
        deadline: editForm.deadline || undefined,
      })
    }
    if (res.success) { setEditPesanan(null); load() }
    else setEditError(res.error)
  }

  const handleAction = async () => {
    if (!confirm) return
    setError('')
    let res: any
    if (confirm.action === 'mulai') res = await api.pesanan.mulaiPrinting(confirm.item.id)
    else if (confirm.action === 'selesai') res = await api.pesanan.selesaikan(confirm.item.id)
    else if (confirm.action === 'batal') res = await api.pesanan.batalkan(confirm.item.id)
    else if (confirm.action === 'hapus') res = await api.pesanan.hapus(confirm.item.id)
    if (res?.success === false) setError(res.error)
    setConfirm(null); load()
  }

  const countByStatus = (s: string) => s === 'semua' ? pesanans.length : pesanans.filter(p => p.status === s).length
  const q = search.toLowerCase()
  const filtered = pesanans.filter(p =>
    (filterStatus === 'semua' || p.status === filterStatus) &&
    (!q || p.nama.toLowerCase().includes(q) || p.klien.toLowerCase().includes(q))
  )
  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sortKey) {
      case 'oldest':     return arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      case 'klien':      return arr.sort((a, b) => a.klien.localeCompare(b.klien))
      case 'harga_desc': return arr.sort((a, b) => b.hargaFinal - a.hargaFinal)
      case 'harga_asc':  return arr.sort((a, b) => a.hargaFinal - b.hargaFinal)
      case 'deadline':   return arr.sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))
      default:           return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }
  }, [filtered, sortKey])
  const filterLabels: [string, string][] = [['semua', 'Semua'], ['Antrian', 'Antrian'], ['Printing', 'Printing'], ['Selesai', 'Selesai'], ['Dibatalkan', 'Dibatalkan']]

  if (loading) return <div className="page-loading"><div className="spinner" /><span>Memuat pesanan...</span></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Row 1: filter tabs + primary action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div className="filter-tabs">
            {filterLabels.map(([s, label]) => (
              <button key={s} className={`filter-tab${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
                {label}
                <span className="filter-tab-count">{countByStatus(s)}</span>
              </button>
            ))}
          </div>
          {invoiceMode ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{invoiceSelected.size} dipilih</span>
              <button className="btn btn-secondary btn-sm" onClick={exitInvoiceMode}>Batalkan</button>
              <button
                className="btn btn-primary btn-sm"
                disabled={invoiceSelected.size === 0 || invoiceLoading}
                onClick={handlePreviewInvoice}
                style={{ opacity: invoiceSelected.size === 0 ? 0.5 : 1 }}
              >
                {invoiceLoading ? 'Memuat...' : `Preview Invoice (${invoiceSelected.size})`}
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
              Buat Pesanan
            </button>
          )}
        </div>

        {/* Row 2: sort + search + utilities (hidden in invoice mode) */}
        {!invoiceMode && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={sortKey} onChange={e => setSortKey(e.target.value)} style={{ fontSize: '12px', height: '32px', padding: '0 10px', width: 'auto', minWidth: '130px' }}>
              <option value="newest">↓ Terbaru</option>
              <option value="oldest">↑ Terlama</option>
              <option value="klien">A–Z Klien</option>
              <option value="harga_desc">Harga Tertinggi</option>
              <option value="harga_asc">Harga Terendah</option>
              <option value="deadline">Deadline Terdekat</option>
            </select>
            <div style={{ position: 'relative', flex: 1, maxWidth: '240px' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                <circle cx="6.5" cy="6.5" r="4.5"/><line x1="10" y1="10" x2="14" y2="14"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama / klien..."
                style={{ paddingLeft: '30px', paddingRight: search ? '28px' : undefined }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, fontSize: '13px', lineHeight: 1 }}>✕</button>
              )}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => api.export.pesanan()} title="Export ke CSV">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2v8M5 7l3 3 3-3M3 13h10"/>
                </svg>
                CSV
              </button>
              <button className="btn btn-secondary btn-sm" onClick={enterInvoiceMode}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="12" height="12" rx="1.5"/>
                  <line x1="5" y1="6" x2="11" y2="6"/>
                  <line x1="5" y1="9" x2="11" y2="9"/>
                  <line x1="5" y1="12" x2="8" y2="12"/>
                </svg>
                Invoice
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {sorted.length === 0 ? <EmptyState message="Belum ada pesanan" icon="order" /> : (
        <div className="animate-fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sorted.map(p => {
            const isSelectable = invoiceMode && p.status === 'Selesai'
            const isChecked = invoiceSelected.has(p.id)
            const isDimmed = invoiceMode && p.status !== 'Selesai'
            return (
              <div
                key={p.id}
                className={invoiceMode ? '' : 'row-hover'}
                onClick={() => {
                  if (invoiceMode) { if (isSelectable) toggleInvoiceItem(p.id) }
                  else setSelected(p)
                }}
                style={{
                  background: isChecked ? 'var(--accent-light)' : 'var(--bg-surface)',
                  border: isChecked ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '13px var(--spacing-lg)', cursor: invoiceMode ? (isSelectable ? 'pointer' : 'default') : 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  opacity: isDimmed ? 0.4 : 1,
                  transition: 'border-color 0.15s, background 0.15s, opacity 0.15s',
                }}
              >
                {invoiceMode && (
                  <div style={{ marginRight: '12px', flexShrink: 0, pointerEvents: 'none' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      style={{ width: '16px', height: '16px', cursor: 'inherit', accentColor: 'var(--accent)' }}
                    />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                    <span className="truncate" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.nama}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 400, flexShrink: 0 }}>{p.klien}</span>
                    {p.deadline && (
                      <span style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600, flexShrink: 0, marginLeft: 'auto' }}>
                        ⏰ {formatTgl(p.deadline)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: '5px', padding: '1px 7px', fontSize: '11px' }}>{p.printerNama}</span>
                    {p.multiColorData
                      ? <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '5px', padding: '1px 7px', fontSize: '11px', fontWeight: 600 }}>Multi Color ({p.multiColorData.length})</span>
                      : <span style={{ background: 'var(--teal-light)', color: 'var(--teal)', borderRadius: '5px', padding: '1px 7px', fontSize: '11px', fontWeight: 600 }}>{p.materialNama}</span>
                    }
                    <span style={{ color: 'var(--text-muted)' }}>{(p.beratMaterial * 1000).toFixed(0)} g</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', textAlign: 'right' }}>
                      {p.diskonTipe && <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: '4px' }}>{formatRp(p.nilaiJual)}</span>}
                      {formatRp(p.hargaFinal)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <StatusBadge status={p.status} />
                  {!invoiceMode && (
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                  )}
                  {!invoiceMode && p.status === 'Antrian' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setConfirm({ action: 'mulai', item: p })}>Mulai</button>
                  )}
                  {!invoiceMode && p.status === 'Printing' && (
                    <button className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff' }} onClick={() => setConfirm({ action: 'selesai', item: p })}>Selesai</button>
                  )}
                  {!invoiceMode && ['Antrian', 'Printing'].includes(p.status) && (
                    <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }} onClick={() => setConfirm({ action: 'batal', item: p })}>Batal</button>
                  )}
                  {!invoiceMode && ['Selesai', 'Dibatalkan'].includes(p.status) && (
                    <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }} onClick={() => setConfirm({ action: 'hapus', item: p })}>Hapus</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Buat Pesanan Baru</h3>
              <button className="modal-close" onClick={resetForm}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
              <datalist id="klien-names">
                {klienNama.map(n => <option key={n} value={n} />)}
              </datalist>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {[
                  { label: 'Nama Pesanan', key: 'nama', required: true, placeholder: 'Nama pesanan' },
                  { label: 'Tipe', key: 'tipe', placeholder: 'Opsional' },
                ].map(({ label, key, required, placeholder }) => (
                  <div key={key}>
                    <FormLabel required={required}>{label}</FormLabel>
                    <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
                  </div>
                ))}
                <div>
                  <FormLabel required>Klien</FormLabel>
                  <input
                    list="klien-names"
                    value={form.klien}
                    onChange={e => setForm(f => ({ ...f, klien: e.target.value }))}
                    placeholder="Nama klien (atau pilih dari daftar)"
                  />
                </div>
                <div>
                  <FormLabel>Deadline</FormLabel>
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
                <div>
                  <FormLabel required>Printer</FormLabel>
                  <select value={form.printerId} onChange={e => setForm(f => ({ ...f, printerId: e.target.value }))}>
                    <option value="">Pilih printer...</option>
                    {printers.filter(p => p.status === 'Idle').map(p =>
                      <option key={p.id} value={p.id}>{p.nama} ({p.watt}W)</option>
                    )}
                    {printers.filter(p => p.status === 'Maintenance' || p.status === 'Rusak').map(p =>
                      <option key={p.id} value="" disabled>⛔ {p.nama} — {p.status}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Toggle Multi Color */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '10px 12px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => { setIsMultiColor(false); setPreview(null) }}
                  style={{ flex: 1, padding: '6px 0', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', background: !isMultiColor ? 'var(--accent)' : 'transparent', color: !isMultiColor ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}
                >
                  Single Color
                </button>
                <button
                  type="button"
                  onClick={() => { setIsMultiColor(true); setPreview(null) }}
                  style={{ flex: 1, padding: '6px 0', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', background: isMultiColor ? 'var(--accent)' : 'transparent', color: isMultiColor ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}
                >
                  Multi Color
                </button>
              </div>

              {!isMultiColor ? (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <FormLabel required>Material</FormLabel>
                      <select value={form.materialId} onChange={e => setForm(f => ({ ...f, materialId: e.target.value }))}>
                        <option value="">Pilih material...</option>
                        {materials.map(m => <option key={m.id} value={m.id}>{m.nama} (stok: {m.stok} kg)</option>)}
                      </select>
                    </div>
                    <div>
                      <FormLabel required>Berat Material (g)</FormLabel>
                      <input type="number" step="1" placeholder="0" value={form.beratMaterial} onChange={e => setForm(f => ({ ...f, beratMaterial: e.target.value }))} />
                    </div>
                  </div>
                  <MatInfo mat={materials.find(m => m.id === form.materialId)} />
                </div>
              ) : (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <FormLabel>Material per Warna</FormLabel>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Total: {colorEntries.reduce((s, e) => s + (+e.beratGram || 0), 0)} g
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {colorEntries.map((entry, i) => (
                      <div key={i}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 32px', gap: '6px', alignItems: 'center' }}>
                          <select
                            value={entry.materialId}
                            onChange={e => setColorEntries(prev => prev.map((v, idx) => idx === i ? { ...v, materialId: e.target.value } : v))}
                          >
                            <option value="">Warna {i + 1} — pilih material...</option>
                            {materials.map(m => <option key={m.id} value={m.id}>{m.nama} (stok: {m.stok} kg)</option>)}
                          </select>
                          <input
                            type="number" step="1" placeholder="gram"
                            value={entry.beratGram}
                            onChange={e => setColorEntries(prev => prev.map((v, idx) => idx === i ? { ...v, beratGram: e.target.value } : v))}
                          />
                          <button
                            type="button"
                            disabled={colorEntries.length <= 2}
                            onClick={() => setColorEntries(prev => prev.filter((_, idx) => idx !== i))}
                            style={{ height: '32px', background: colorEntries.length <= 2 ? 'var(--border)' : 'var(--danger-light)', color: colorEntries.length <= 2 ? 'var(--text-muted)' : 'var(--danger)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: colorEntries.length <= 2 ? 'default' : 'pointer', fontWeight: 700, fontSize: '14px' }}
                          >✕</button>
                        </div>
                        <MatInfo mat={materials.find(m => m.id === entry.materialId)} />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setColorEntries(prev => [...prev, { materialId: '', beratGram: '' }])}
                    style={{ marginTop: '8px', width: '100%', padding: '6px', background: 'var(--bg-surface-2)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    + Tambah Warna
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {[
                  { label: 'Estimasi Jam', key: 'estimasiJam', type: 'number', step: '0.5', placeholder: '0', required: true },
                  { label: 'Markup (%)', key: 'markup', type: 'number' },
                  { label: 'Nilai Jual (Rp)', key: 'nilaiJual', type: 'number', required: true },
                ].map(({ label, key, type, step, placeholder, required }) => (
                  <div key={key}>
                    <FormLabel required={required}>{label}</FormLabel>
                    <input type={type} step={step} value={(form as any)[key]} placeholder={placeholder} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>

              {/* Diskon */}
              <div style={{ marginBottom: '12px' }}>
                <FormLabel>Diskon</FormLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <select value={form.diskonTipe} onChange={e => setForm(f => ({ ...f, diskonTipe: e.target.value, diskonNilai: '' }))}>
                    <option value="">Tidak ada</option>
                    <option value="persen">Persentase (%)</option>
                    <option value="rupiah">Nominal (Rp)</option>
                  </select>
                  <input
                    type="number"
                    placeholder={form.diskonTipe === 'persen' ? 'Contoh: 10' : form.diskonTipe === 'rupiah' ? 'Jumlah diskon' : '—'}
                    value={form.diskonNilai}
                    disabled={!form.diskonTipe}
                    onChange={e => setForm(f => ({ ...f, diskonNilai: e.target.value }))}
                    style={{ opacity: form.diskonTipe ? 1 : 0.4 }}
                  />
                </div>
                {form.diskonTipe && form.diskonNilai && +form.diskonNilai > 0 && form.nilaiJual && +form.nilaiJual > 0 && (() => {
                  const diskon = computeDiskon(+form.nilaiJual, form.diskonTipe, form.diskonNilai)
                  const final = +form.nilaiJual - diskon
                  return (
                    <div style={{ marginTop: '5px', padding: '5px 10px', background: 'var(--warning-light, #fff7ed)', border: '1px solid var(--warning, #f59e0b)', borderRadius: 'var(--radius-sm)', fontSize: '12px', display: 'flex', gap: '16px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Diskon: <strong style={{ color: 'var(--danger)' }}>−{formatRp(diskon)}</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>Harga Final: <strong style={{ color: 'var(--success)' }}>{formatRp(final)}</strong></span>
                    </div>
                  )
                })()}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <FormLabel>Catatan</FormLabel>
                <textarea value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '12px', justifyContent: 'center' }} onClick={handlePreview}>
                Hitung Preview HPP
              </button>
              {preview && (
                <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '12px', fontSize: '13px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                    {preview.perMaterial ? (
                      <>
                        {(preview.perMaterial as { label: string; biaya: number }[]).map((m, i) => (
                          <Fragment key={i}>
                            <span style={{ color: 'var(--text-muted)', paddingLeft: '8px', fontSize: '12px' }}>{m.label}</span>
                            <span style={{ fontWeight: 500, fontSize: '12px' }}>{formatRp(m.biaya)}</span>
                          </Fragment>
                        ))}
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600, borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>Total Biaya Material</span>
                        <span style={{ fontWeight: 700, borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
                          {formatRp((preview.perMaterial as { biaya: number }[]).reduce((s, m) => s + m.biaya, 0))}
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{ color: 'var(--text-muted)' }}>Biaya Material</span>
                        <span style={{ fontWeight: 600 }}>{formatRp(preview.biayaMaterial)}</span>
                      </>
                    )}
                    {[
                      ['Biaya Listrik', formatRp(preview.biayaListrik), ''],
                      ['HPP', formatRp(preview.hpp), 'var(--text-primary)'],
                      ['Harga Rekomendasi', formatRp(preview.hargaRekomendasi), 'var(--accent)'],
                      ...(preview.diskonAktual > 0 ? [
                        ['Diskon', `−${formatRp(preview.diskonAktual)}`, 'var(--danger)'],
                        ['Harga Final', formatRp(preview.hargaFinal), 'var(--text-primary)'],
                      ] : []),
                      ['Estimasi Profit', formatRp(preview.profitEstimasi), preview.profitEstimasi >= 0 ? 'var(--success)' : 'var(--danger)'],
                    ].map(([label, val, color]) => (
                      <Fragment key={label as string}>
                        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                        <span style={{ fontWeight: 600, color: (color as string) || 'inherit' }}>{val}</span>
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={resetForm}>Batal</button>
                <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Buat Pesanan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoicePreview && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '760px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '14px 20px', flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: "'Sora', sans-serif", marginBottom: '8px' }}>Preview Invoice</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>Tagihan kepada:</span>
                  <input
                    value={tagihanKepada}
                    onChange={e => setTagihanKepada(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRefreshInvoice()}
                    style={{ flex: 1, fontSize: '12px', padding: '4px 8px', height: '28px' }}
                    placeholder="Nama klien..."
                  />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleRefreshInvoice}
                    disabled={invoiceLoading}
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 4.5A7 7 0 0 1 13.5 2.5"/><path d="M15 11.5A7 7 0 0 1 2.5 13.5"/>
                      <polyline points="1 1 1 4.5 4.5 4.5"/><polyline points="15 15 15 11.5 11.5 11.5"/>
                    </svg>
                    Terapkan
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexShrink: 0 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleExportInvoicePDF}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2v8M5 7l3 3 3-3M3 13h10"/>
                  </svg>
                  Cetak PDF
                </button>
                <button className="modal-close" onClick={() => setShowInvoicePreview(false)}>✕</button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', background: '#f0f0f0', padding: '16px', position: 'relative' }}>
              {!iframeReady && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#f0f0f0', zIndex: 1 }}>
                  <div className="spinner" />
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Memuat preview...</span>
                </div>
              )}
              <iframe
                key={iframeKey}
                srcDoc={invoiceHtml}
                style={{ width: '100%', minHeight: '700px', border: 'none', borderRadius: '8px', background: '#fff', display: 'block', opacity: iframeReady ? 1 : 0 }}
                sandbox="allow-same-origin"
                title="Preview Invoice"
                onLoad={() => setIframeReady(true)}
              />
            </div>
          </div>
        </div>
      )}

      {editPesanan && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '480px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ marginBottom: '2px' }}>Edit Pesanan</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{editPesanan.nama} — {editPesanan.klien}</div>
              </div>
              <button className="modal-close" onClick={() => setEditPesanan(null)}>✕</button>
            </div>
            <div className="modal-body">
              {editError && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{editError}</div>}
              {editPesanan.status !== 'Antrian' && (
                <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent)' }}>
                  Pesanan berstatus <strong>{editPesanan.status}</strong> — hanya catatan dan deadline yang dapat diubah.
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {editPesanan.status === 'Antrian' && (<>
                  {([
                    { label: 'Nama Pesanan', key: 'nama', required: true },
                    { label: 'Klien', key: 'klien', required: true },
                    { label: 'Tipe', key: 'tipe' },
                  ] as { label: string; key: string; required?: boolean }[]).map(({ label, key, required }) => (
                    <div key={key}>
                      <FormLabel required={required}>{label}</FormLabel>
                      <input value={(editForm as any)[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <FormLabel required>Nilai Jual (Rp)</FormLabel>
                    <input type="number" value={editForm.nilaiJual} onChange={e => setEditForm(f => ({ ...f, nilaiJual: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <FormLabel>Diskon</FormLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <select value={editForm.diskonTipe} onChange={e => setEditForm(f => ({ ...f, diskonTipe: e.target.value, diskonNilai: '' }))}>
                        <option value="">Tidak ada</option>
                        <option value="persen">Persen (%)</option>
                        <option value="rupiah">Nominal (Rp)</option>
                      </select>
                      <input type="number" disabled={!editForm.diskonTipe} value={editForm.diskonNilai} onChange={e => setEditForm(f => ({ ...f, diskonNilai: e.target.value }))} style={{ opacity: editForm.diskonTipe ? 1 : 0.4 }} />
                    </div>
                  </div>
                </>)}
                <div>
                  <FormLabel>Deadline</FormLabel>
                  <input type="date" value={editForm.deadline} onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
                <div style={{ gridColumn: editPesanan.status !== 'Antrian' ? '1/-1' : undefined }}>
                  <FormLabel>Catatan</FormLabel>
                  <input value={editForm.catatan} onChange={e => setEditForm(f => ({ ...f, catatan: e.target.value }))} placeholder="Opsional" />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditPesanan(null)}>Batal</button>
                <button className="btn btn-primary btn-sm" onClick={handleEditSave}>Simpan Perubahan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && <DetailModal pesanan={selected} onClose={() => setSelected(null)} />}

      {confirm && (
        <ConfirmDialog
          title={`Konfirmasi ${confirm.action.charAt(0).toUpperCase() + confirm.action.slice(1)}`}
          message={`Yakin ingin ${confirm.action} pesanan "${confirm.item.nama}"?`}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          danger={confirm.action === 'hapus' || confirm.action === 'batal'}
          confirmLabel={confirm.action.charAt(0).toUpperCase() + confirm.action.slice(1)}
        />
      )}
    </div>
  )
}
