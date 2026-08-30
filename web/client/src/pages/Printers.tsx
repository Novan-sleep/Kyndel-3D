import { useState, useEffect, useRef } from 'react'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPrinters, createPrinter, updatePrinter, setPrinterStatus, deletePrinter } from '../store/printersSlice'
import { Printer } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import DataRow from '../components/ui/DataRow'
import FormField from '../components/ui/FormField'
import Modal from '../components/ui/Modal'
import { useClickOutside } from '../hooks/useClickOutside'

export default function PrinterPage() {
  const dispatch = useAppDispatch()
  const { items: printers, status } = useAppSelector((s) => s.printers)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Printer | null>(null)
  const [confirm, setConfirm] = useState<Printer | null>(null)
  const [statusMenu, setStatusMenu] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nama: '', model: '', tipe: '', watt: '', catatan: '' })
  const statusMenuRef = useRef<HTMLDivElement>(null)

  useClickOutside(statusMenuRef, () => setStatusMenu(null))

  useEffect(() => { dispatch(fetchPrinters()) }, [dispatch])

  const openEdit = (p: Printer) => {
    setEditItem(p)
    setForm({ nama: p.nama, model: p.model ?? '', tipe: p.tipe ?? '', watt: String(p.watt), catatan: p.catatan ?? '' })
    setShowForm(true)
  }

  const openAdd = () => {
    setEditItem(null)
    setForm({ nama: '', model: '', tipe: '', watt: '', catatan: '' })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    setError('')
    const payload = { nama: form.nama, model: form.model || undefined, tipe: (form.tipe || undefined) as Printer['tipe'], watt: +form.watt, catatan: form.catatan || undefined }
    try {
      if (editItem) await dispatch(updatePrinter({ id: editItem.id, payload })).unwrap()
      else await dispatch(createPrinter(payload)).unwrap()
      setShowForm(false)
      setEditItem(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan printer')
    }
  }

  const handleSetStatus = async (id: string, status: string) => {
    setStatusMenu(null)
    try {
      await dispatch(setPrinterStatus({ id, status })).unwrap()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status printer')
    }
  }

  const handleDelete = async () => {
    if (!confirm) return
    try {
      await dispatch(deletePrinter(confirm.id)).unwrap()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus printer')
    }
    setConfirm(null)
  }

  const statusDot: Record<string, string> = {
    Idle: 'var(--status-idle)', Printing: 'var(--status-printing)',
    Maintenance: 'var(--status-maintenance)', Rusak: 'var(--status-rusak)',
  }

  const statusBorder: Record<string, string> = {
    Idle: 'var(--success)', Printing: 'var(--accent)',
    Maintenance: 'var(--warning)', Rusak: 'var(--danger)',
  }

  const statusNotice: Record<string, { bg: string; color: string; text: string } | null> = {
    Idle: null, Printing: null,
    Maintenance: { bg: 'var(--warning-light)', color: 'var(--warning)', text: 'Dalam pemeliharaan — tidak bisa digunakan untuk pesanan' },
    Rusak:       { bg: 'var(--danger-light)',  color: 'var(--danger)',  text: 'Printer rusak — tidak bisa digunakan untuk pesanan' },
  }

  if (status === 'loading' && printers.length === 0) return <div className="page-loading"><div className="spinner" /><span>Memuat printer...</span></div>

  return (
    <div>
      <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-lg)' }}>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
          Tambah Printer
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--spacing-md)' }}>{error}</div>}

      {printers.length === 0 ? <EmptyState message="Belum ada printer" icon="printer" /> : (
        <LazyMotion features={domAnimation} strict>
        <div className="animate-fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
          {printers.map(p => (
            <m.div key={p.id} className="card" whileHover={{ y: -3 }} transition={{ duration: 0.15, ease: 'easeOut' }} style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', borderLeft: `3px solid ${statusBorder[p.status] ?? 'var(--border)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: statusDot[p.status] ?? 'var(--text-muted)',
                      display: 'inline-block', flexShrink: 0,
                      ...(p.status === 'Printing' ? { animation: 'pulse 2s ease-in-out infinite' } : {})
                    }} />
                    {p.nama}
                  </div>
                  {(p.tipe || p.model) && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '16px' }}>
                      {p.tipe}{p.model ? ` · ${p.model}` : ''}
                    </div>
                  )}
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <DataRow label="Konsumsi" value={`${p.watt} W`} />
                <DataRow label="Total Jam" value={`${p.totalJam.toFixed(1)} jam`} />
                {p.catatan && (
                  <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '11px', fontStyle: 'italic' }}>{p.catatan}</div>
                )}
                {statusNotice[p.status] && (
                  <div style={{
                    marginTop: '8px', padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                    background: statusNotice[p.status]!.bg, color: statusNotice[p.status]!.color,
                    fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 2L1.5 13h13L8 2z"/><line x1="8" y1="7" x2="8" y2="10"/><circle cx="8" cy="12.5" r="0.5" fill="currentColor"/>
                    </svg>
                    {statusNotice[p.status]!.text}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(p)}>Edit</button>
                {p.status !== 'Printing' && (
                  <div ref={statusMenu === p.id ? statusMenuRef : undefined} style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setStatusMenu(statusMenu === p.id ? null : p.id)}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Status ▾
                    </button>
                    {statusMenu === p.id && (
                      <div style={{
                        position: 'absolute', bottom: 'calc(100% + 6px)', right: 0,
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        minWidth: '130px', zIndex: 50, overflow: 'hidden',
                      }}>
                        {(['Idle', 'Maintenance', 'Rusak'] as const)
                          .filter(s => s !== p.status)
                          .map(s => (
                            <button
                              key={s}
                              onClick={() => handleSetStatus(p.id, s)}
                              style={{
                                display: 'block', width: '100%', padding: '8px 14px',
                                textAlign: 'left', background: 'none', border: 'none',
                                cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                                color: s === 'Rusak' ? 'var(--danger)' : s === 'Maintenance' ? 'var(--warning)' : 'var(--success)',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                            >
                              → {s}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
                {p.status !== 'Printing' && (
                  <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }} onClick={() => setConfirm(p)}>Hapus</button>
                )}
              </div>
            </m.div>
          ))}
        </div>
        </LazyMotion>
      )}

      {showForm && (
        <Modal width={440}>
          <div className="modal-header">
            <h3>{editItem ? 'Edit Printer' : 'Tambah Printer'}</h3>
            <button className="modal-close" onClick={() => { setShowForm(false); setError('') }}>✕</button>
          </div>
          <div className="modal-body">
              {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 'var(--spacing-lg)' }}>
                {[
                  { label: 'Nama', key: 'nama', required: true },
                  { label: 'Model', key: 'model' },
                ].map(({ label, key, required }) => (
                  <FormField key={key} label={label} required={required}>
                    <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </FormField>
                ))}
                <FormField label="Tipe">
                  <select value={form.tipe} onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}>
                    <option value="">Pilih...</option>
                    {['FDM', 'Resin', 'SLA', 'SLS'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <FormField label="Watt" required>
                  <input type="number" value={form.watt} onChange={e => setForm(f => ({ ...f, watt: e.target.value }))} />
                </FormField>
                <FormField label="Catatan">
                  <textarea value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} rows={2} />
                </FormField>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setError('') }}>Batal</button>
                <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Simpan</button>
              </div>
          </div>
        </Modal>
      )}

      {confirm && <ConfirmDialog title="Hapus Printer" message={`Hapus printer "${confirm.nama}"?`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} confirmLabel="Hapus" danger />}
    </div>
  )
}
