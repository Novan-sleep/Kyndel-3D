import { getDb } from '../db'
import { generateId, nowIso } from '../utils'
import { Aktivitas, AktivitasModul } from '../types'

function rowToAktivitas(row: any): Aktivitas {
  return { id: row.id, modul: row.modul, aksi: row.aksi, refId: row.ref_id, deskripsi: row.deskripsi, user: row.user, createdAt: row.created_at }
}

export const aktivitasRepository = {
  findAll(limit = 100): Aktivitas[] { return getDb().prepare('SELECT * FROM aktivitas ORDER BY created_at DESC LIMIT ?').all(limit).map(rowToAktivitas) },
  findTerbaru(limit = 10): Aktivitas[] { return getDb().prepare('SELECT * FROM aktivitas ORDER BY created_at DESC LIMIT ?').all(limit).map(rowToAktivitas) },
  catat(modul: AktivitasModul, aksi: string, deskripsi: string, refId?: string): void {
    const id = generateId(); const now = nowIso()
    getDb().prepare('INSERT INTO aktivitas (id, modul, aksi, ref_id, deskripsi, user, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?)').run(id, modul, aksi, refId ?? null, deskripsi, now)
  }
}
