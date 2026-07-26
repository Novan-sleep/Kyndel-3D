import { getDb } from '../db'
import { generateId, nowIso } from '../utils'
import { Klien } from '../types'

function rowToKlien(row: any): Klien {
  return {
    id: row.id,
    nama: row.nama,
    telepon: row.telepon ?? undefined,
    email: row.email ?? undefined,
    alamat: row.alamat ?? undefined,
    catatan: row.catatan ?? undefined,
    createdAt: row.created_at,
    totalPesanan: row.total_pesanan ?? 0,
    totalNilai: row.total_nilai ?? 0,
  }
}

const WITH_STATS = `
  SELECT k.*,
    COUNT(p.id) AS total_pesanan,
    COALESCE(SUM(CASE WHEN p.status = 'Selesai' THEN p.harga_final ELSE 0 END), 0) AS total_nilai
  FROM klien k
  LEFT JOIN pesanan p ON p.klien = k.nama
`

export const klienRepository = {
  findAll(): Klien[] {
    return getDb().prepare(`${WITH_STATS} GROUP BY k.id ORDER BY k.nama ASC`).all().map(rowToKlien)
  },
  findById(id: string): Klien | null {
    const row = getDb().prepare(`${WITH_STATS} WHERE k.id = ? GROUP BY k.id`).get(id)
    return row ? rowToKlien(row) : null
  },
  findAllNama(): string[] {
    return (getDb().prepare('SELECT nama FROM klien ORDER BY nama ASC').all() as any[]).map(r => r.nama)
  },
  create(payload: Partial<Klien>): Klien | null {
    const id = generateId()
    getDb().prepare(
      'INSERT INTO klien (id, nama, telepon, email, alamat, catatan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, payload.nama, payload.telepon ?? null, payload.email ?? null, payload.alamat ?? null, payload.catatan ?? null, nowIso())
    return this.findById(id)
  },
  update(id: string, payload: Partial<Klien>): Klien | null {
    const existing = this.findById(id)
    if (!existing) return null
    getDb().prepare(
      'UPDATE klien SET nama = ?, telepon = ?, email = ?, alamat = ?, catatan = ? WHERE id = ?'
    ).run(
      payload.nama ?? existing.nama,
      'telepon' in payload ? (payload.telepon ?? null) : (existing.telepon ?? null),
      'email' in payload ? (payload.email ?? null) : (existing.email ?? null),
      'alamat' in payload ? (payload.alamat ?? null) : (existing.alamat ?? null),
      'catatan' in payload ? (payload.catatan ?? null) : (existing.catatan ?? null),
      id
    )
    return this.findById(id)
  },
  delete(id: string): boolean {
    return (getDb().prepare('DELETE FROM klien WHERE id = ?').run(id) as any).changes > 0
  },
}
