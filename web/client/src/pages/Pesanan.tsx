import { useState, useEffect, useRef, useMemo, Fragment } from 'react'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPesanan, createPesanan, updatePesanan, updateMetaPesanan, mulaiPrinting, selesaikanPesanan, batalkanPesanan, hapusPesanan } from '../store/pesananSlice'
import { fetchPrinters } from '../store/printersSlice'
import { fetchMaterials } from '../store/materialsSlice'
import { fetchSetting } from '../store/settingSlice'
import { api, formatRp, formatTgl, downloadBlob } from '../lib/api'
import { Pesanan, ColorEntry } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import DataRow from '../components/ui/DataRow'
import FormField from '../components/ui/FormField'
import Modal from '../components/ui/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'

function MatInfo({ mat }: { mat: { hargaJualPerGram: number; hargaBeliPerGram: number; marginPerGram: number } | undefined }) {
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
  const SectionHead = ({ children }: { children: string }) => (
    <div className="section-label" style={{ marginTop: 16 }}>{children}</div>
  )
  return (
    <Modal width={520}>
      <div className="modal-header">
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '3px', fontFamily: "'Manrope', sans-serif" }}>{pesanan.nama}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pesanan.klien}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StatusBadge status={pesanan.status} />
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
        <SectionHead>Detail Order</SectionHead>
        {pesanan.tipe && <DataRow label="Tipe" value={pesanan.tipe} />}
        <DataRow label="Printer" value={pesanan.printerNama} />
        {pesanan.multiColorData && pesanan.multiColorData.length > 0 ? (
          <div>
            <DataRow label="Mode" value={<span style={{ fontWeight: 600, color: 'var(--accent)' }}>Multi Color ({pesanan.multiColorData.length} warna)</span>} />
            {pesanan.multiColorData.map((entry, i) => (
              <DataRow key={i} indent label={`Warna ${i + 1} — ${entry.materialNama}`} value={`${entry.beratGram} g`} />
            ))}
            <DataRow label="Total Berat" value={`${(pesanan.beratMaterial * 1000).toFixed(0)} g`} />
          </div>
        ) : (
          <>
            <DataRow label="Material" value={pesanan.materialNama} />
            <DataRow label="Berat" value={`${(pesanan.beratMaterial * 1000).toFixed(0)} g`} />
          </>
        )}
        <DataRow label="Estimasi Waktu" value={`${pesanan.estimasiJam} jam`} />
        <DataRow label="Markup" value={`${pesanan.markup}%`} />
        {pesanan.deadline && <DataRow label="Deadline" value={formatTgl(pesanan.deadline)} />}
        {pesanan.catatan && <DataRow label="Catatan" value={pesanan.catatan} />}

        <SectionHead>Harga</SectionHead>
        <DataRow label="HPP" value={formatRp(pesanan.hpp)} />
        <DataRow label="Harga Rekomendasi" value={<span style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatRp(pesanan.hargaRekomendasi)}</span>} />
        <DataRow label="Nilai Jual" value={<span style={{ fontWeight: 700 }}>{formatRp(pesanan.nilaiJual)}</span>} />
        {pesanan.diskonTipe && (
          <DataRow label="Diskon" value={(
            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
              −{formatRp(pesanan.nilaiJual - pesanan.hargaFinal)}
              {' '}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({pesanan.diskonTipe === 'persen' ? `${pesanan.diskonNilai}%` : 'nominal'})
              </span>
            </span>
          )} />
        )}
        {pesanan.diskonTipe && <DataRow label="Harga Final" value={<span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatRp(pesanan.hargaFinal)}</span>} />}
        <DataRow label="Estimasi Profit" value={(() => {
          const p = pesanan.hargaFinal - pesanan.hpp
          return <span style={{ color: p >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{formatRp(p)}</span>
        })()} />

        <SectionHead>Waktu</SectionHead>
        <DataRow label="Dibuat" value={formatTgl(pesanan.createdAt)} />
        {pesanan.printingAt && <DataRow label="Mulai Print" value={formatTgl(pesanan.printingAt)} />}
        {pesanan.completedAt && <DataRow label="Selesai" value={formatTgl(pesanan.completedAt)} />}
        {pesanan.cancelledAt && <DataRow label="Dibatalkan" value={formatTgl(pesanan.cancelledAt)} last />}
      </div>
    </Modal>
  )
}

export default function PesananPage() {
  const dispatch = useAppDispatch()
  const { items: pesanans, status } = useAppSelector((s) => s.pesanan)
  const printers = useAppSelector((s) => s.printers.items)
  const materials = useAppSelector((s) => s.materials.items)
  const setting = useAppSelector((s) => s.setting.data)
  const [klienNama, setKlienNama] = useState<string[]>([])
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
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    dispatch(fetchPesanan())
    dispatch(fetchPrinters())
    dispatch(fetchMaterials())
    dispatch(fetchSetting())
    api.get<string[]>('/klien/names').then(setKlienNama).catch(() => {})
  }, [dispatch])

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
    try {
      const html = await api.post<string>('/nota/invoice-html', { ids: [...invoiceSelected], tagihanKepada: defaultNama })
      setIframeReady(false); setInvoiceHtml(html); setShowInvoicePreview(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat preview invoice')
    }
    setInvoiceLoading(false)
  }

  const handleRefreshInvoice = async () => {
    setInvoiceLoading(true)
    try {
      const html = await api.post<string>('/nota/invoice-html', { ids: [...invoiceSelected], tagihanKepada })
      setIframeReady(false); setIframeKey(k => k + 1); setInvoiceHtml(html)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat preview invoice')
    }
    setInvoiceLoading(false)
  }

  const handlePrintInvoice = () => {
    iframeRef.current?.contentWindow?.print()
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
    try {
      await dispatch(createPesanan(payload)).unwrap()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat pesanan')
    }
  }

  const openEdit = (p: Pesanan) => {
    setEditPesanan(p)
    setEditForm({ nama: p.nama, klien: p.klien, tipe: p.tipe ?? '', nilaiJual: String(p.nilaiJual), diskonTipe: p.diskonTipe ?? '', diskonNilai: p.diskonNilai ? String(p.diskonNilai) : '', deadline: p.deadline ?? '', catatan: p.catatan ?? '' })
    setEditError('')
  }

  const handleEditSave = async () => {
    if (!editPesanan) return
    setEditError('')
    try {
      if (editPesanan.status === 'Antrian') {
        await dispatch(updatePesanan({
          id: editPesanan.id, payload: {
            nama: editForm.nama.trim(),
            klien: editForm.klien.trim(),
            tipe: editForm.tipe.trim() || undefined,
            nilaiJual: +editForm.nilaiJual,
            diskonTipe: editForm.diskonTipe || undefined,
            diskonNilai: +editForm.diskonNilai || 0,
            deadline: editForm.deadline || undefined,
            catatan: editForm.catatan.trim() || undefined,
          }
        })).unwrap()
      } else {
        await dispatch(updateMetaPesanan({
          id: editPesanan.id, payload: {
            catatan: editForm.catatan.trim() || undefined,
            deadline: editForm.deadline || undefined,
          }
        })).unwrap()
      }
      setEditPesanan(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan')
    }
  }

  const handleAction = async () => {
    if (!confirm) return
    setError('')
    try {
      if (confirm.action === 'mulai') await dispatch(mulaiPrinting(confirm.item.id)).unwrap()
      else if (confirm.action === 'selesai') await dispatch(selesaikanPesanan(confirm.item.id)).unwrap()
      else if (confirm.action === 'batal') await dispatch(batalkanPesanan(confirm.item.id)).unwrap()
      else if (confirm.action === 'hapus') await dispatch(hapusPesanan(confirm.item.id)).unwrap()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aksi gagal')
    }
    setConfirm(null)
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

  if (status === 'loading' && pesanans.length === 0) return <div className="page-loading"><div className="spinner" /><span>Memuat pesanan...</span></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Row 1: filter tabs + primary action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
              <button className="btn btn-secondary btn-sm" onClick={() => downloadBlob('/pesanan/export/csv', `pesanan-${new Date().toISOString().slice(0, 10)}.csv`).catch(err => setError(err.message))} title="Export ke CSV">
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
        <LazyMotion features={domAnimation} strict>
        <div className="card" style={{ overflow: 'hidden' }}>
          <Table>
            <TableHeader>
              <TableRow>
                {invoiceMode && <TableHead style={{ width: 32 }} />}
                <TableHead>Pesanan</TableHead>
                <TableHead>Printer</TableHead>
                <TableHead>Material</TableHead>
                <TableHead align="right">Berat</TableHead>
                <TableHead align="right">Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p, i) => {
                const isSelectable = invoiceMode && p.status === 'Selesai'
                const isChecked = invoiceSelected.has(p.id)
                const isDimmed = invoiceMode && p.status !== 'Selesai'
                return (
                  <m.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: isDimmed ? 0.4 : 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(i, 12) * 0.015, ease: 'easeOut' }}
                    onClick={() => {
                      if (invoiceMode) { if (isSelectable) toggleInvoiceItem(p.id) }
                      else setSelected(p)
                    }}
                    style={{
                      background: isChecked ? 'var(--accent-light)' : undefined,
                      cursor: invoiceMode ? (isSelectable ? 'pointer' : 'default') : 'pointer',
                    }}
                  >
                    {invoiceMode && (
                      <TableCell style={{ pointerEvents: 'none' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          style={{ width: '16px', height: '16px', cursor: 'inherit', accentColor: 'var(--accent)' }}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{p.nama}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{p.klien}</div>
                      {p.deadline && (
                        <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600, marginTop: 2 }}>
                          ⏰ {formatTgl(p.deadline)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell data-label="Printer">
                      <span style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: '5px', padding: '1px 7px', fontSize: '11px', whiteSpace: 'nowrap' }}>{p.printerNama}</span>
                    </TableCell>
                    <TableCell data-label="Material">
                      {p.multiColorData
                        ? <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '5px', padding: '1px 7px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>Multi Color ({p.multiColorData.length})</span>
                        : <span style={{ background: 'var(--teal-light)', color: 'var(--teal)', borderRadius: '5px', padding: '1px 7px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>{p.materialNama}</span>
                      }
                    </TableCell>
                    <TableCell align="right" data-label="Berat" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{(p.beratMaterial * 1000).toFixed(0)} g</TableCell>
                    <TableCell align="right" data-label="Harga" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {p.diskonTipe && <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: '4px' }}>{formatRp(p.nilaiJual)}</span>}
                      {formatRp(p.hargaFinal)}
                    </TableCell>
                    <TableCell data-label="Status"><StatusBadge status={p.status} /></TableCell>
                    <TableCell align="right" data-label="Aksi" onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
                    </TableCell>
                  </m.tr>
                )
              })}
            </TableBody>
          </Table>
        </div>
        </LazyMotion>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <Modal width={560}>
          <div className="modal-header">
            <h3>Buat Pesanan Baru</h3>
            <button className="modal-close" onClick={resetForm}>✕</button>
          </div>
          <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
              <datalist id="klien-names">
                {klienNama.map(n => <option key={n} value={n} />)}
              </datalist>
              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {[
                  { label: 'Nama Pesanan', key: 'nama', required: true, placeholder: 'Nama pesanan' },
                  { label: 'Tipe', key: 'tipe', placeholder: 'Opsional' },
                ].map(({ label, key, required, placeholder }) => (
                  <FormField key={key} label={label} required={required}>
                    <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
                  </FormField>
                ))}
                <FormField label="Klien" required>
                  <input
                    list="klien-names"
                    value={form.klien}
                    onChange={e => setForm(f => ({ ...f, klien: e.target.value }))}
                    placeholder="Nama klien (atau pilih dari daftar)"
                  />
                </FormField>
                <FormField label="Deadline">
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                </FormField>
                <FormField label="Printer" required>
                  <select value={form.printerId} onChange={e => setForm(f => ({ ...f, printerId: e.target.value }))}>
                    <option value="">Pilih printer...</option>
                    {printers.filter(p => p.status === 'Idle').map(p =>
                      <option key={p.id} value={p.id}>{p.nama} ({p.watt}W)</option>
                    )}
                    {printers.filter(p => p.status === 'Maintenance' || p.status === 'Rusak').map(p =>
                      <option key={p.id} value="" disabled>⛔ {p.nama} — {p.status}</option>
                    )}
                  </select>
                </FormField>
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
                  <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <FormField label="Material" required>
                      <select value={form.materialId} onChange={e => setForm(f => ({ ...f, materialId: e.target.value }))}>
                        <option value="">Pilih material...</option>
                        {materials.map(m => <option key={m.id} value={m.id}>{m.nama} (stok: {m.stok} kg)</option>)}
                      </select>
                    </FormField>
                    <FormField label="Berat Material (g)" required>
                      <input type="number" step="1" placeholder="0" value={form.beratMaterial} onChange={e => setForm(f => ({ ...f, beratMaterial: e.target.value }))} />
                    </FormField>
                  </div>
                  <MatInfo mat={materials.find(m => m.id === form.materialId)} />
                </div>
              ) : (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label">Material per Warna</label>
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

              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {[
                  { label: 'Estimasi Jam', key: 'estimasiJam', type: 'number', step: '0.5', placeholder: '0', required: true },
                  { label: 'Markup (%)', key: 'markup', type: 'number' },
                  { label: 'Nilai Jual (Rp)', key: 'nilaiJual', type: 'number', required: true },
                ].map(({ label, key, type, step, placeholder, required }) => (
                  <FormField key={key} label={label} required={required}>
                    <input type={type} step={step} value={(form as any)[key]} placeholder={placeholder} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </FormField>
                ))}
              </div>

              {/* Diskon */}
              <FormField label="Diskon">
                <div style={{ marginBottom: '12px' }}>
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                    <div style={{ marginTop: '5px', padding: '5px 10px', background: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', fontSize: '12px', display: 'flex', gap: '16px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Diskon: <strong style={{ color: 'var(--danger)' }}>−{formatRp(diskon)}</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>Harga Final: <strong style={{ color: 'var(--success)' }}>{formatRp(final)}</strong></span>
                    </div>
                  )
                })()}
                </div>
              </FormField>

              <FormField label="Catatan">
                <div style={{ marginBottom: '12px' }}>
                <textarea value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
                </div>
              </FormField>
              <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '12px', justifyContent: 'center' }} onClick={handlePreview}>
                Hitung Preview HPP
              </button>
              {preview && (
                <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '12px', fontSize: '13px', border: '1px solid var(--border)' }}>
                  <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
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
        </Modal>
      )}

      {showInvoicePreview && (
        <Modal width={760}>
          <div style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '14px 20px', flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: "'Manrope', sans-serif", marginBottom: '8px' }}>Preview Invoice</div>
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
                  onClick={handlePrintInvoice}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2v8M5 7l3 3 3-3M3 13h10"/>
                  </svg>
                  Cetak / Simpan PDF
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
                ref={iframeRef}
                key={iframeKey}
                srcDoc={invoiceHtml}
                style={{ width: '100%', minHeight: '700px', border: 'none', borderRadius: '8px', background: '#fff', display: 'block', opacity: iframeReady ? 1 : 0 }}
                sandbox="allow-same-origin allow-modals"
                title="Preview Invoice"
                onLoad={() => setIframeReady(true)}
              />
            </div>
          </div>
        </Modal>
      )}

      {editPesanan && (
        <Modal width={480}>
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
              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {editPesanan.status === 'Antrian' && (<>
                  {([
                    { label: 'Nama Pesanan', key: 'nama', required: true },
                    { label: 'Klien', key: 'klien', required: true },
                    { label: 'Tipe', key: 'tipe' },
                  ] as { label: string; key: string; required?: boolean }[]).map(({ label, key, required }) => (
                    <FormField key={key} label={label} required={required}>
                      <input value={(editForm as any)[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} />
                    </FormField>
                  ))}
                  <FormField label="Nilai Jual (Rp)" required>
                    <input type="number" value={editForm.nilaiJual} onChange={e => setEditForm(f => ({ ...f, nilaiJual: e.target.value }))} />
                  </FormField>
                  <FormField label="Diskon">
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <select value={editForm.diskonTipe} onChange={e => setEditForm(f => ({ ...f, diskonTipe: e.target.value, diskonNilai: '' }))}>
                        <option value="">Tidak ada</option>
                        <option value="persen">Persen (%)</option>
                        <option value="rupiah">Nominal (Rp)</option>
                      </select>
                      <input type="number" disabled={!editForm.diskonTipe} value={editForm.diskonNilai} onChange={e => setEditForm(f => ({ ...f, diskonNilai: e.target.value }))} style={{ opacity: editForm.diskonTipe ? 1 : 0.4 }} />
                    </div>
                  </FormField>
                </>)}
                <FormField label="Deadline">
                  <input type="date" value={editForm.deadline} onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))} />
                </FormField>
                <div style={{ gridColumn: editPesanan.status !== 'Antrian' ? '1/-1' : undefined }}>
                  <FormField label="Catatan">
                    <input value={editForm.catatan} onChange={e => setEditForm(f => ({ ...f, catatan: e.target.value }))} placeholder="Opsional" />
                  </FormField>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditPesanan(null)}>Batal</button>
                <button className="btn btn-primary btn-sm" onClick={handleEditSave}>Simpan Perubahan</button>
              </div>
            </div>
        </Modal>
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
