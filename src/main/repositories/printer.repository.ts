import { getDb } from '../db'
import { generateId, nowIso } from '../utils'
import { Printer, PrinterStatus } from '../types'

function rowToPrinter(row: any): Printer {
  return { id: row.id, nama: row.nama, model: row.model, tipe: row.tipe, watt: row.watt, status: row.status, currentPesananId: row.current_pesanan_id, totalJam: row.total_jam, catatan: row.catatan, createdAt: row.created_at }
}

export const printerRepository = {
  findAll(): Printer[] { return getDb().prepare('SELECT * FROM printers ORDER BY created_at ASC').all().map(rowToPrinter) },
  findById(id: string): Printer | null { const row = getDb().prepare('SELECT * FROM printers WHERE id = ?').get(id); return row ? rowToPrinter(row) : null },
  findIdle(): Printer[] { return getDb().prepare("SELECT * FROM printers WHERE status = 'Idle' ORDER BY nama ASC").all().map(rowToPrinter) },
  create(payload: Partial<Printer>): Printer | null {
    const id = generateId(); const now = nowIso()
    getDb().prepare("INSERT INTO printers (id, nama, model, tipe, watt, status, current_pesanan_id, total_jam, catatan, created_at) VALUES (?, ?, ?, ?, ?, 'Idle', NULL, 0, ?, ?)")
      .run(id, payload.nama, payload.model ?? null, payload.tipe ?? null, payload.watt, payload.catatan ?? null, now)
    return this.findById(id)
  },
  update(id: string, payload: Partial<Printer>): Printer | null {
    const existing = this.findById(id); if (!existing) return null
    getDb().prepare('UPDATE printers SET nama = ?, model = ?, tipe = ?, watt = ?, status = ?, catatan = ? WHERE id = ?')
      .run(payload.nama ?? existing.nama, payload.model ?? existing.model ?? null, payload.tipe ?? existing.tipe ?? null, payload.watt ?? existing.watt, payload.status ?? existing.status, payload.catatan ?? existing.catatan ?? null, id)
    return this.findById(id)
  },
  setStatus(id: string, status: PrinterStatus, pesananId: string | null): void {
    getDb().prepare('UPDATE printers SET status = ?, current_pesanan_id = ? WHERE id = ?').run(status, pesananId, id)
  },
  addTotalJam(id: string, jam: number): void { getDb().prepare('UPDATE printers SET total_jam = total_jam + ? WHERE id = ?').run(jam, id) },
  delete(id: string): boolean { return (getDb().prepare('DELETE FROM printers WHERE id = ?').run(id) as any).changes > 0 }
}
