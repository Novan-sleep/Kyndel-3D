import { getDb } from '../db'
import { generateId, nowIso } from '../utils'
import { Material } from '../types'

function rowToMaterial(row: any): Material {
  return { id: row.id, nama: row.nama, tipe: row.tipe, warna: row.warna, stok: row.stok, hargaBeliPerGram: row.harga_beli_per_gram, hargaJualPerGram: row.harga_jual_per_gram, marginPerGram: row.harga_jual_per_gram - row.harga_beli_per_gram, stokMinimum: row.stok_minimum, createdAt: row.created_at }
}

export const materialRepository = {
  findAll(): Material[] { return getDb().prepare('SELECT * FROM materials ORDER BY nama ASC').all().map(rowToMaterial) },
  findById(id: string): Material | null { const row = getDb().prepare('SELECT * FROM materials WHERE id = ?').get(id); return row ? rowToMaterial(row) : null },
  findHampirHabis(): Material[] { return getDb().prepare('SELECT * FROM materials WHERE stok_minimum IS NOT NULL AND stok <= stok_minimum ORDER BY stok ASC').all().map(rowToMaterial) },
  create(payload: Partial<Material>): Material | null {
    const id = generateId(); const now = nowIso()
    getDb().prepare('INSERT INTO materials (id, nama, tipe, warna, stok, harga_beli_per_gram, harga_jual_per_gram, stok_minimum, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, payload.nama, payload.tipe ?? null, payload.warna ?? null, payload.stok, payload.hargaBeliPerGram, payload.hargaJualPerGram, payload.stokMinimum ?? null, now)
    return this.findById(id)
  },
  update(id: string, payload: Partial<Material>): Material | null {
    const existing = this.findById(id); if (!existing) return null
    getDb().prepare('UPDATE materials SET nama = ?, tipe = ?, warna = ?, stok = ?, harga_beli_per_gram = ?, harga_jual_per_gram = ?, stok_minimum = ? WHERE id = ?')
      .run(payload.nama ?? existing.nama, payload.tipe ?? existing.tipe ?? null, payload.warna ?? existing.warna ?? null, payload.stok ?? existing.stok, payload.hargaBeliPerGram ?? existing.hargaBeliPerGram, payload.hargaJualPerGram ?? existing.hargaJualPerGram, payload.stokMinimum ?? existing.stokMinimum ?? null, id)
    return this.findById(id)
  },
  kurangiStok(id: string, beratKg: number): void { getDb().prepare('UPDATE materials SET stok = stok - ? WHERE id = ?').run(beratKg, id) },
  delete(id: string): boolean { return (getDb().prepare('DELETE FROM materials WHERE id = ?').run(id) as any).changes > 0 }
}
