import { useState, useEffect, useCallback } from 'react'
import { api, formatRp, formatTgl } from '../lib/api'
import { Klien } from '../types'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

export default function KlienPage() {
  const [kliens, setKliens] = useState<Klien[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Klien | null>(null)
  const [selected, setSelected] = useState<Klien | null>(null)
  const [confirm, setConfirm] = useState<Klien | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ nama: '', telepon: '', email: '', alamat: '', catatan: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await api.klien.getAll()
    if (res.success) setKliens(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setEditItem(null)
    setForm({ nama: '', telepon: '', email: '', alamat: '', catatan: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (k: Klien) => {
    setEditItem(k)
    setForm({ nama: k.nama, telepon: k.telepon ?? '', email: k.email ?? '', alamat: k.alamat ?? '', catatan: k.catatan ?? '' })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async () => {
    setError('')
    const payload = {
      nama: form.nama.trim(),
      telepon: form.telepon.trim() || undefined,
      email: form.email.trim() || undefined,
      alamat: form.alamat.trim() || undefined,
      catatan: form.catatan.trim() || undefined,
    }
    const res = editItem
      ? await api.klien.update(editItem.id, payload)
      : await api.klien.create(payload)
    if (res.success) { setShowForm(false); setEditItem(null); load() }
    else setError(res.error)
  }

  const handleDelete = async () => {
    if (!confirm) return
    const res = await api.klien.delete(confirm.id)
    if (!res.success) setError(res.error)
    setConfirm(null); load()
  }

  const filtered = kliens.filter(k =>
    !search || k.nama.toLowerCase().includes(search.toLowerCase()) ||
    k.telepon?.includes(search) || k.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="page-loading"><div className="spinner" /><span>Memuat klien...</span></div>

  return (
    <div>
      {/* Toolbar */}
      <div className="animate-fade-up" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, telepon, email..."
          style={{ flex: 1, minWidth: '200px' }}
        />
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
          Tambah Klien
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--spacing-md)' }}>{error}</div>}

      {filtered.length === 0
        ? <EmptyState message={search ? 'Klien tidak ditemukan' : 'Belum ada klien'} icon="user" />
        : (
          <div className="animate-fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 'var(--spacing-md)' }}>
            {filtered.map(k => (
              <div
                key={k.id}
                className="card card-hover"
                style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', cursor: 'pointer', borderLeft: '3px solid var(--accent)' }}
                onClick={() => setSelected(selected?.id === k.id ? null : k)}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 800, color: '#fff', fontFamily: "'Sora', sans-serif",
                    }}>
                      {k.nama.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{k.nama}</div>
                      {k.telepon && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{k.telepon}</div>}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  {[
                    { label: 'Pesanan', val: String(k.totalPesanan) },
                    { label: 'Total Selesai', val: formatRp(k.totalNilai) },
                  ].map(({ label, val }) => (
                    <div key={label} style={{
                      flex: 1, padding: '7px 10px', background: 'var(--bg-surface-2)',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Detail panel */}
                {selected?.id === k.id && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    {k.email && <div><span style={{ color: 'var(--text-muted)' }}>Email: </span>{k.email}</div>}
                    {k.alamat && <div><span style={{ color: 'var(--text-muted)' }}>Alamat: </span>{k.alamat}</div>}
                    {k.catatan && <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{k.catatan}</div>}
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                      Klien sejak {formatTgl(k.createdAt)}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={e => { e.stopPropagation(); openEdit(k) }}>Edit</button>
                  {k.totalPesanan === 0 && (
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                      onClick={e => { e.stopPropagation(); setConfirm(k) }}
                    >Hapus</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '460px' }}>
            <div className="modal-header">
              <h3>{editItem ? 'Edit Klien' : 'Tambah Klien'}</h3>
              <button className="modal-close" onClick={() => { setShowForm(false); setError('') }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 'var(--spacing-lg)' }}>
                <div>
                  <label className="form-label">Nama <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama lengkap klien" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label">Telepon / WhatsApp</label>
                    <input value={form.telepon} onChange={e => setForm(f => ({ ...f, telepon: e.target.value }))} placeholder="08xxxxxxxxxx" />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@contoh.com" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Alamat</label>
                  <input value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} placeholder="Alamat klien (opsional)" />
                </div>
                <div>
                  <label className="form-label">Catatan</label>
                  <textarea value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} rows={2} placeholder="Preferensi, catatan khusus, dll." />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setError('') }}>Batal</button>
                <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title="Hapus Klien"
          message={`Hapus klien "${confirm.nama}"? Tindakan ini tidak bisa dibatalkan.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          confirmLabel="Hapus"
          danger
        />
      )}
    </div>
  )
}
