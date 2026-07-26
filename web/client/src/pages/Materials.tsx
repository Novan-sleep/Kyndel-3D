import { FormEvent, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchMaterials, createMaterial, deleteMaterial } from '../store/materialsSlice'
import Modal from '../components/Modal'

export default function Materials() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((s) => s.materials)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', tipe: '', warna: '', stok: 1, hargaBeliPerGram: 0, hargaJualPerGram: 0, stokMinimum: 0.5 })
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => { dispatch(fetchMaterials()) }, [dispatch])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      await dispatch(createMaterial(form)).unwrap()
      setShowForm(false)
      setForm({ nama: '', tipe: '', warna: '', stok: 1, hargaBeliPerGram: 0, hargaJualPerGram: 0, stokMinimum: 0.5 })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan material')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus material ini?')) return
    try {
      await dispatch(deleteMaterial(id)).unwrap()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus material')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Material</h1>
          <p>Kelola stok dan harga material cetak</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Tambah Material</button>
      </div>

      {status === 'loading' && items.length === 0 ? (
        <div className="page-loading"><span className="spinner" /> Memuat…</div>
      ) : error ? (
        <div className="error-text">{error}</div>
      ) : items.length === 0 ? (
        <div className="empty-state">Belum ada material</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Nama</th><th>Stok</th><th>Beli/g</th><th>Jual/g</th><th>Margin/g</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>{m.nama}{m.warna ? <span className="text-muted"> · {m.warna}</span> : null}</td>
                  <td className={m.stokMinimum != null && m.stok <= m.stokMinimum ? 'text-danger' : undefined}>{m.stok} kg</td>
                  <td>Rp{m.hargaBeliPerGram}</td>
                  <td>Rp{m.hargaJualPerGram}</td>
                  <td className="text-success">Rp{m.marginPerGram}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Tambah Material" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate}>
            <div className="field">
              <label>Nama</label>
              <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required autoFocus />
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Tipe</label>
                <input value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} placeholder="PLA, PETG, dll" />
              </div>
              <div className="field">
                <label>Warna</label>
                <input value={form.warna} onChange={(e) => setForm({ ...form, warna: e.target.value })} />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Stok (kg)</label>
                <input type="number" step="0.01" min={0} value={form.stok} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} required />
              </div>
              <div className="field">
                <label>Stok Minimum (kg)</label>
                <input type="number" step="0.01" min={0} value={form.stokMinimum} onChange={(e) => setForm({ ...form, stokMinimum: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Harga Beli / gram</label>
                <input type="number" min={0} value={form.hargaBeliPerGram} onChange={(e) => setForm({ ...form, hargaBeliPerGram: Number(e.target.value) })} required />
              </div>
              <div className="field">
                <label>Harga Jual / gram</label>
                <input type="number" min={0} value={form.hargaJualPerGram} onChange={(e) => setForm({ ...form, hargaJualPerGram: Number(e.target.value) })} required />
              </div>
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
