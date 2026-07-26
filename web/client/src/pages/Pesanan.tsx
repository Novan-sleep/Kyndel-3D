import { FormEvent, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPesanan, createPesanan, mulaiPrinting, selesaikanPesanan, batalkanPesanan, hapusPesanan } from '../store/pesananSlice'
import { fetchPrinters } from '../store/printersSlice'
import { fetchMaterials } from '../store/materialsSlice'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

function formatRupiah(n: number): string {
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`
}

export default function Pesanan() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((s) => s.pesanan)
  const printers = useAppSelector((s) => s.printers.items)
  const materials = useAppSelector((s) => s.materials.items)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [form, setForm] = useState({
    nama: '', klien: '', printerId: '', materialId: '',
    beratMaterial: 0.1, estimasiJam: 1, markup: 30, nilaiJual: 0, deadline: '',
  })

  useEffect(() => {
    dispatch(fetchPesanan())
    dispatch(fetchPrinters())
    dispatch(fetchMaterials())
  }, [dispatch])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      await dispatch(createPesanan(form)).unwrap()
      setShowForm(false)
      setForm({ nama: '', klien: '', printerId: '', materialId: '', beratMaterial: 0.1, estimasiJam: 1, markup: 30, nilaiJual: 0, deadline: '' })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal membuat pesanan')
    }
  }

  async function runAction(id: string, action: (id: string) => Promise<unknown>) {
    setBusyId(id)
    try {
      await action(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Aksi gagal')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pesanan</h1>
          <p>Kelola antrian dan status pesanan cetak</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Pesanan Baru</button>
      </div>

      {status === 'loading' && items.length === 0 ? (
        <div className="page-loading"><span className="spinner" /> Memuat…</div>
      ) : error ? (
        <div className="error-text">{error}</div>
      ) : items.length === 0 ? (
        <div className="empty-state">Belum ada pesanan</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Pesanan</th><th>Klien</th><th>Printer</th><th>Harga Final</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.nama}</td>
                  <td>{p.klien}</td>
                  <td>{p.printerNama ?? '-'}</td>
                  <td>{formatRupiah(p.hargaFinal)}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.status === 'Antrian' && (
                        <button className="btn btn-ghost btn-sm" disabled={busyId === p.id} onClick={() => runAction(p.id, (id) => dispatch(mulaiPrinting(id)).unwrap())}>Mulai</button>
                      )}
                      {p.status === 'Printing' && (
                        <button className="btn btn-ghost btn-sm" disabled={busyId === p.id} onClick={() => runAction(p.id, (id) => dispatch(selesaikanPesanan(id)).unwrap())}>Selesai</button>
                      )}
                      {(p.status === 'Antrian' || p.status === 'Printing') && (
                        <button className="btn btn-danger btn-sm" disabled={busyId === p.id} onClick={() => runAction(p.id, (id) => dispatch(batalkanPesanan(id)).unwrap())}>Batal</button>
                      )}
                      {(p.status === 'Selesai' || p.status === 'Dibatalkan') && (
                        <button className="btn btn-danger btn-sm" disabled={busyId === p.id} onClick={() => { if (confirm('Hapus pesanan ini?')) runAction(p.id, (id) => dispatch(hapusPesanan(id)).unwrap()) }}>Hapus</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Pesanan Baru" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="field">
                <label>Nama Pesanan</label>
                <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required autoFocus />
              </div>
              <div className="field">
                <label>Klien</label>
                <input value={form.klien} onChange={(e) => setForm({ ...form, klien: e.target.value })} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Printer</label>
                <select value={form.printerId} onChange={(e) => setForm({ ...form, printerId: e.target.value })} required>
                  <option value="">Pilih printer</option>
                  {printers.filter((p) => p.status === 'Idle').map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Material</label>
                <select value={form.materialId} onChange={(e) => setForm({ ...form, materialId: e.target.value })} required>
                  <option value="">Pilih material</option>
                  {materials.map((m) => <option key={m.id} value={m.id}>{m.nama} ({m.stok} kg)</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Berat Material (kg)</label>
                <input type="number" step="0.001" min={0} value={form.beratMaterial} onChange={(e) => setForm({ ...form, beratMaterial: Number(e.target.value) })} required />
              </div>
              <div className="field">
                <label>Estimasi Jam</label>
                <input type="number" step="0.5" min={0} value={form.estimasiJam} onChange={(e) => setForm({ ...form, estimasiJam: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Markup (%)</label>
                <input type="number" min={0} value={form.markup} onChange={(e) => setForm({ ...form, markup: Number(e.target.value) })} required />
              </div>
              <div className="field">
                <label>Nilai Jual (Rp)</label>
                <input type="number" min={0} value={form.nilaiJual} onChange={(e) => setForm({ ...form, nilaiJual: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="field">
              <label>Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            {formError && <div className="error-text">{formError}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Buat Pesanan</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
