import { getDb } from '../db'
import { generateId, nowIso } from '../utils'
import { Pesanan, PesananStatus } from '../types'

function rowToPesanan(row: any): Pesanan {
  const diskonTipe: 'persen' | 'rupiah' | undefined = row.diskon_tipe ?? undefined
  const diskonNilai: number = row.diskon_nilai ?? 0
  const diskonAktual = diskonTipe === 'persen'
    ? Math.round(row.nilai_jual * diskonNilai / 100)
    : diskonTipe === 'rupiah' ? diskonNilai : 0
  return {
    id: row.id, nama: row.nama, klien: row.klien, tipe: row.tipe,
    printerId: row.printer_id, materialId: row.material_id,
    beratMaterial: row.berat_material, estimasiJam: row.estimasi_jam,
    markup: row.markup, hpp: row.hpp, hargaRekomendasi: row.harga_rekomendasi,
    nilaiJual: row.nilai_jual, diskonTipe, diskonNilai, hargaFinal: row.nilai_jual - diskonAktual,
    hargaBeliPerGramSnapshot: row.harga_beli_per_gram_snapshot,
    hargaJualPerGramSnapshot: row.harga_jual_per_gram_snapshot,
    wattSnapshot: row.watt_snapshot, tarifListrikSnapshot: row.tarif_listrik_snapshot,
    status: row.status, deadline: row.deadline, catatan: row.catatan,
    createdAt: row.created_at, printingAt: row.printing_at,
    completedAt: row.completed_at, cancelledAt: row.cancelled_at,
    printerNama: row.printer_nama, materialNama: row.material_nama,
    multiColorData: row.multi_color_data ? JSON.parse(row.multi_color_data) : undefined
  }
}

const SELECT_WITH_JOIN = `
  SELECT p.*,
    pr.nama as printer_nama,
    m.nama as material_nama
  FROM pesanan p
  LEFT JOIN printers pr ON p.printer_id = pr.id
  LEFT JOIN materials m ON p.material_id = m.id
`

export const pesananRepository = {
  findAll(): Pesanan[] {
    return getDb().prepare(`${SELECT_WITH_JOIN} ORDER BY p.created_at DESC`).all().map(rowToPesanan)
  },
  findById(id: string): Pesanan | null {
    const row = getDb().prepare(`${SELECT_WITH_JOIN} WHERE p.id = ?`).get(id)
    return row ? rowToPesanan(row as any) : null
  },
  create(payload: any, hpp: number, hargaRekomendasi: number, hargaBeli: number, hargaJual: number, watt: number, tarifListrik: number): Pesanan | null {
    const id = generateId(); const now = nowIso()
    const multiColorJson = payload.multiColorData && payload.multiColorData.length > 0 ? JSON.stringify(payload.multiColorData) : null
    getDb().prepare(`
      INSERT INTO pesanan (id, nama, klien, tipe, printer_id, material_id, berat_material, estimasi_jam, markup, hpp, harga_rekomendasi, nilai_jual, diskon_tipe, diskon_nilai, harga_beli_per_gram_snapshot, harga_jual_per_gram_snapshot, watt_snapshot, tarif_listrik_snapshot, status, deadline, catatan, multi_color_data, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Antrian', ?, ?, ?, ?)
    `).run(id, payload.nama, payload.klien, payload.tipe ?? null, payload.printerId, payload.materialId, payload.beratMaterial, payload.estimasiJam, payload.markup, hpp, hargaRekomendasi, payload.nilaiJual, payload.diskonTipe ?? null, payload.diskonNilai ?? 0, hargaBeli, hargaJual, watt, tarifListrik, payload.deadline ?? null, payload.catatan ?? null, multiColorJson, now)
    return this.findById(id)
  },
  update(id: string, payload: Partial<Pesanan>): Pesanan | null {
    const existing = this.findById(id); if (!existing) return null
    getDb().prepare(`UPDATE pesanan SET nama = ?, klien = ?, tipe = ?, deadline = ?, catatan = ?, nilai_jual = ?, diskon_tipe = ?, diskon_nilai = ? WHERE id = ?`)
      .run(
        payload.nama ?? existing.nama,
        payload.klien ?? existing.klien,
        payload.tipe ?? existing.tipe ?? null,
        payload.deadline !== undefined ? payload.deadline || null : existing.deadline ?? null,
        payload.catatan ?? existing.catatan ?? null,
        payload.nilaiJual ?? existing.nilaiJual,
        payload.diskonTipe !== undefined ? payload.diskonTipe || null : existing.diskonTipe ?? null,
        payload.diskonNilai ?? existing.diskonNilai ?? 0,
        id
      )
    return this.findById(id)
  },
  setStatus(id: string, status: PesananStatus, timestamp: string | null): void {
    const col = status === 'Printing' ? 'printing_at' : status === 'Selesai' ? 'completed_at' : status === 'Dibatalkan' ? 'cancelled_at' : null
    if (col) {
      getDb().prepare(`UPDATE pesanan SET status = ?, ${col} = ? WHERE id = ?`).run(status, timestamp, id)
    } else {
      getDb().prepare('UPDATE pesanan SET status = ? WHERE id = ?').run(status, id)
    }
  },
  delete(id: string): boolean {
    getDb().prepare('DELETE FROM transaksi WHERE pesanan_id = ?').run(id)
    return (getDb().prepare('DELETE FROM pesanan WHERE id = ?').run(id) as any).changes > 0
  },
  countByStatus(status: PesananStatus): number {
    return (getDb().prepare('SELECT COUNT(*) as cnt FROM pesanan WHERE status = ?').get(status) as any).cnt
  },
  countSelesaiBulanIni(): number {
    const month = new Date().toISOString().slice(0, 7)
    return (getDb().prepare("SELECT COUNT(*) as cnt FROM pesanan WHERE status = 'Selesai' AND completed_at LIKE ?").get(`${month}%`) as any).cnt
  },
  countDibatalkanBulanIni(): number {
    const month = new Date().toISOString().slice(0, 7)
    return (getDb().prepare("SELECT COUNT(*) as cnt FROM pesanan WHERE status = 'Dibatalkan' AND cancelled_at LIKE ?").get(`${month}%`) as any).cnt
  },
  findMendekatiDeadline(hariKe = 3): Pesanan[] {
    const batas = new Date(); batas.setDate(batas.getDate() + hariKe)
    return getDb().prepare(`
      ${SELECT_WITH_JOIN}
      WHERE p.status IN ('Antrian','Printing') AND p.deadline IS NOT NULL AND p.deadline <= ?
      ORDER BY p.deadline ASC
    `).all(batas.toISOString().split('T')[0]).map(rowToPesanan)
  }
}
