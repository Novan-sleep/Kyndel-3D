import { FormEvent, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPrinters, createPrinter, deletePrinter } from '../store/printersSlice'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { PrinterTipe } from '../types'

const TIPE_OPTIONS: PrinterTipe[] = ['FDM', 'Resin', 'SLA', 'SLS']

export default function Printers() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((s) => s.printers)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', model: '', tipe: 'FDM' as PrinterTipe, watt: 200, catatan: '' })
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => { dispatch(fetchPrinters()) }, [dispatch])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      await dispatch(createPrinter(form)).unwrap()
      setShowForm(false)
      setForm({ nama: '', model: '', tipe: 'FDM', watt: 200, catatan: '' })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan printer')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus printer ini?')) return
    try {
      await dispatch(deletePrinter(id)).unwrap()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus printer')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Printer</h1>
          <p>Kelola armada printer workshop</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Tambah Printer</button>
      </div>

      {status === 'loading' && items.length === 0 ? (
        <div className="page-loading"><span className="spinner" /> Memuat…</div>
      ) : error ? (
        <div className="error-text">{error}</div>
      ) : items.length === 0 ? (
        <div className="empty-state">Belum ada printer</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Nama</th><th>Tipe</th><th>Watt</th><th>Status</th><th>Total Jam</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.nama}{p.model ? <span className="text-muted"> · {p.model}</span> : null}</td>
                  <td>{p.tipe ?? '-'}</td>
                  <td>{p.watt} W</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>{p.totalJam.toFixed(1)} jam</td>
                  <td>
                    <button className="btn btn-danger btn-sm" disabled={p.status === 'Printing'} onClick={() => handleDelete(p.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Tambah Printer" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate}>
            <div className="field">
              <label>Nama</label>
              <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required autoFocus />
            </div>
            <div className="field">
              <label>Model</label>
              <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <div className="field">
              <label>Tipe</label>
              <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value as PrinterTipe })}>
                {TIPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Watt</label>
              <input type="number" min={0} value={form.watt} onChange={(e) => setForm({ ...form, watt: Number(e.target.value) })} required />
            </div>
            <div className="field">
              <label>Catatan</label>
              <input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
            </div>
            {formError && <div className="error-text">{formError}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
