import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchMaterials, createMaterial, updateMaterial, restockMaterial, deleteMaterial } from '../store/materialsSlice'
import { formatRp } from '../lib/api'
import { Material } from '../types'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

export default function MaterialPage() {
  const dispatch = useAppDispatch()
  const { items: materials, status } = useAppSelector((s) => s.materials)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Material | null>(null)
  const [confirm, setConfirm] = useState<Material | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nama: '', tipe: '', warna: '', stok: '', hargaBeliPerGram: '', hargaJualPerGram: '', stokMinimum: '' })
  const [restockItem, setRestockItem] = useState<Material | null>(null)
  const [restockForm, setRestockForm] = useState({ jumlahKg: '', hargaBeliPerGram: '', catatan: '' })
  const [restockError, setRestockError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { dispatch(fetchMaterials()) }, [dispatch])

  const openEdit = (m: Material) => {
    setEditItem(m)
    setForm({ nama: m.nama, tipe: m.tipe ?? '', warna: m.warna ?? '', stok: String(m.stok), hargaBeliPerGram: String(m.hargaBeliPerGram), hargaJualPerGram: String(m.hargaJualPerGram), stokMinimum: m.stokMinimum != null ? String(m.stokMinimum) : '' })
    setShowForm(true)
  }

  const openAdd = () => {
    setEditItem(null)
    setForm({ nama: '', tipe: '', warna: '', stok: '', hargaBeliPerGram: '', hargaJualPerGram: '', stokMinimum: '' })
    setShowForm(true)
  }

  const openRestock = (m: Material) => {
    setRestockItem(m)
    setRestockForm({ jumlahKg: '', hargaBeliPerGram: String(m.hargaBeliPerGram), catatan: '' })
    setRestockError('')
  }

  const handleRestock = async () => {
    setRestockError('')
    if (!restockItem) return
    try {
      await dispatch(restockMaterial({
        id: restockItem.id,
        jumlahKg: +restockForm.jumlahKg,
        hargaBeliPerGram: +restockForm.hargaBeliPerGram,
        catatan: restockForm.catatan.trim() || undefined,
      })).unwrap()
      setRestockItem(null)
    } catch (err) {
      setRestockError(err instanceof Error ? err.message : 'Gagal restock material')
    }
  }

  const handleSubmit = async () => {
    setError('')
    const payload = { nama: form.nama, tipe: form.tipe || undefined, warna: form.warna || undefined, stok: +form.stok, hargaBeliPerGram: +form.hargaBeliPerGram, hargaJualPerGram: +form.hargaJualPerGram, stokMinimum: form.stokMinimum ? +form.stokMinimum : undefined }
    try {
      if (editItem) await dispatch(updateMaterial({ id: editItem.id, payload })).unwrap()
      else await dispatch(createMaterial(payload)).unwrap()
      setShowForm(false)
      setEditItem(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan material')
    }
  }

  if (status === 'loading' && materials.length === 0) return <div className="page-loading"><div className="spinner" /><span>Memuat material...</span></div>

  return (
    <div>
      <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '320px' }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
            <circle cx="6.5" cy="6.5" r="4.5"/><line x1="10" y1="10" x2="14" y2="14"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama / tipe / warna..."
            style={{ paddingLeft: '28px', paddingRight: search ? '28px' : undefined, width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, fontSize: '13px', lineHeight: 1 }}>✕</button>
          )}
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
          Tambah Material
        </button>
      </div>
      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--spacing-md)' }}>{error}</div>}

      {(() => {
        const q = search.toLowerCase()
        const filtered = q ? materials.filter(m =>
          m.nama.toLowerCase().includes(q) ||
          (m.tipe ?? '').toLowerCase().includes(q) ||
          (m.warna ?? '').toLowerCase().includes(q)
        ) : materials
        return filtered.length === 0 ? <EmptyState message={search ? 'Tidak ada hasil' : 'Belum ada material'} icon="material" /> : (
        <div className="animate-fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
          {filtered.map(m => {
            const isLow = m.stokMinimum != null && m.stok <= m.stokMinimum
            return (
              <div key={m.id} className="card card-hover" style={{ border: `1px solid ${isLow ? 'var(--warning)' : 'var(--border)'}`, padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '3px', fontSize: '14px' }}>{m.nama}</div>
                    {(m.tipe || m.warna) && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{[m.tipe, m.warna].filter(Boolean).join(' · ')}</div>
                    )}
                  </div>
                  {isLow && (
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px', fontWeight: 700, background: 'var(--warning-light)', color: 'var(--warning)' }}>Hampir Habis</span>
                  )}
                </div>

                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  {[
                    ['Stok', <span style={{ fontWeight: 700, color: isLow ? 'var(--warning)' : 'inherit' }}>{m.stok} kg{m.stokMinimum != null ? <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> / min {m.stokMinimum}</span> : ''}</span>],
                    ['Harga Beli', `${formatRp(m.hargaBeliPerGram)}/g`],
                    ['Harga Jual', `${formatRp(m.hargaJualPerGram)}/g`],
                    ['Margin', <span style={{ color: 'var(--success)', fontWeight: 700 }}>{formatRp(m.marginPerGram)}/g</span>],
                  ].map(([label, val], i, arr) => (
                    <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(m)}>Edit</button>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--success-light)', color: 'var(--success)', fontWeight: 600 }}
                    onClick={() => openRestock(m)}
                  >+ Restock</button>
                  <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }} onClick={() => setConfirm(m)}>Hapus</button>
                </div>
              </div>
            )
          })}
        </div>
        )
      })()}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '440px' }}>
            <div className="modal-header">
              <h3>{editItem ? 'Edit Material' : 'Tambah Material'}</h3>
              <button className="modal-close" onClick={() => { setShowForm(false); setError('') }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Nama <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
                </div>
                {[
                  { label: 'Tipe', key: 'tipe', placeholder: 'PLA, ABS...' },
                  { label: 'Warna', key: 'warna' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
                  </div>
                ))}
                {[
                  { label: 'Stok (kg)', key: 'stok', required: true },
                  { label: 'Stok Min (kg)', key: 'stokMinimum' },
                  { label: 'Harga Beli/gram', key: 'hargaBeliPerGram', required: true },
                  { label: 'Harga Jual/gram', key: 'hargaJualPerGram', required: true },
                ].map(({ label, key, required }) => (
                  <div key={key}>
                    <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}</label>
                    <input type="number" step="0.01" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setError('') }}>Batal</button>
                <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {restockItem && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '420px' }}>
            <div className="modal-header">
              <h3>Restock — {restockItem.nama}</h3>
              <button className="modal-close" onClick={() => setRestockItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              {restockError && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{restockError}</div>}
              <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Stok saat ini: <strong>{restockItem.stok} kg</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 'var(--spacing-lg)' }}>
                <div>
                  <label className="form-label">Jumlah Tambah (kg) <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    type="number" step="0.1" min="0.001"
                    value={restockForm.jumlahKg}
                    onChange={e => setRestockForm(f => ({ ...f, jumlahKg: e.target.value }))}
                    placeholder="Contoh: 1.5"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="form-label">Harga Beli / gram (Rp) <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    type="number" step="1"
                    value={restockForm.hargaBeliPerGram}
                    onChange={e => setRestockForm(f => ({ ...f, hargaBeliPerGram: e.target.value }))}
                    placeholder="Harga beli per gram"
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Jika harga berubah, nilai ini akan diperbarui di data material.
                  </div>
                </div>
                {restockForm.jumlahKg && restockForm.hargaBeliPerGram && +restockForm.jumlahKg > 0 && +restockForm.hargaBeliPerGram > 0 && (
                  <div style={{ padding: '10px 14px', background: 'var(--success-light)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--success)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Total biaya yang akan dicatat sebagai pengeluaran</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--success)', fontFamily: "'Sora', sans-serif" }}>
                      {formatRp(Math.round(+restockForm.jumlahKg * 1000 * +restockForm.hargaBeliPerGram))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="form-label">Catatan</label>
                  <input
                    value={restockForm.catatan}
                    onChange={e => setRestockForm(f => ({ ...f, catatan: e.target.value }))}
                    placeholder="Opsional — nama supplier, nomor nota, dll."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setRestockItem(null)}>Batal</button>
                <button className="btn btn-primary btn-sm" onClick={handleRestock}>Konfirmasi Restock</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirm && <ConfirmDialog title="Hapus Material" message={`Hapus material "${confirm.nama}"?`} onConfirm={async () => { await dispatch(deleteMaterial(confirm.id)); setConfirm(null) }} onCancel={() => setConfirm(null)} confirmLabel="Hapus" danger />}
    </div>
  )
}
