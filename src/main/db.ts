import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

let db: Database.Database | null = null
let dbPath_: string | null = null

export function getDb(): Database.Database {
  if (!db) throw new Error('Database belum diinisialisasi.')
  return db
}

export function getDbPath(): string {
  if (!dbPath_) throw new Error('Database path tidak tersedia')
  return dbPath_
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS printers (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  model TEXT,
  tipe TEXT CHECK (tipe IN ('FDM', 'Resin', 'SLA', 'SLS')),
  watt REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Idle' CHECK (status IN ('Idle', 'Printing', 'Maintenance', 'Rusak')),
  current_pesanan_id TEXT,
  total_jam REAL NOT NULL DEFAULT 0,
  catatan TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  tipe TEXT,
  warna TEXT,
  stok REAL NOT NULL DEFAULT 0,
  harga_beli_per_gram REAL NOT NULL DEFAULT 0,
  harga_jual_per_gram REAL NOT NULL DEFAULT 0,
  stok_minimum REAL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pesanan (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  klien TEXT NOT NULL,
  tipe TEXT,
  printer_id TEXT NOT NULL,
  material_id TEXT NOT NULL,
  berat_material REAL NOT NULL,
  estimasi_jam REAL NOT NULL DEFAULT 0,
  markup REAL NOT NULL DEFAULT 0,
  hpp REAL NOT NULL DEFAULT 0,
  harga_rekomendasi REAL NOT NULL DEFAULT 0,
  nilai_jual REAL NOT NULL DEFAULT 0,
  harga_beli_per_gram_snapshot REAL NOT NULL DEFAULT 0,
  harga_jual_per_gram_snapshot REAL NOT NULL DEFAULT 0,
  watt_snapshot REAL NOT NULL DEFAULT 0,
  tarif_listrik_snapshot REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Antrian' CHECK (status IN ('Antrian', 'Printing', 'Selesai', 'Dibatalkan')),
  deadline TEXT,
  catatan TEXT,
  created_at TEXT NOT NULL,
  printing_at TEXT,
  completed_at TEXT,
  cancelled_at TEXT,
  FOREIGN KEY (printer_id) REFERENCES printers(id),
  FOREIGN KEY (material_id) REFERENCES materials(id)
);

CREATE TABLE IF NOT EXISTS transaksi (
  id TEXT PRIMARY KEY,
  jenis TEXT NOT NULL CHECK (jenis IN ('pendapatan', 'pengeluaran')),
  nama TEXT NOT NULL,
  kategori TEXT,
  jumlah REAL NOT NULL,
  tanggal TEXT NOT NULL,
  pesanan_id TEXT,
  source_type TEXT CHECK (source_type IN ('pesanan', 'manual')),
  source_id TEXT,
  is_auto_generated INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (pesanan_id) REFERENCES pesanan(id)
);

CREATE TABLE IF NOT EXISTS aktivitas (
  id TEXT PRIMARY KEY,
  modul TEXT NOT NULL CHECK (modul IN ('Pesanan', 'Printer', 'Material', 'Keuangan', 'Sistem')),
  aksi TEXT NOT NULL,
  ref_id TEXT,
  deskripsi TEXT NOT NULL,
  user TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS klien (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  telepon TEXT,
  email TEXT,
  alamat TEXT,
  catatan TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS setting (
  id TEXT PRIMARY KEY DEFAULT 'global',
  tarif_listrik REAL NOT NULL DEFAULT 1500,
  markup_default REAL NOT NULL DEFAULT 30
);

INSERT OR IGNORE INTO setting (id, tarif_listrik, markup_default)
VALUES ('global', 1500, 30);
`

const MIGRATIONS = [
  `ALTER TABLE materials ADD COLUMN harga_beli_per_gram REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE materials ADD COLUMN harga_jual_per_gram REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE pesanan ADD COLUMN harga_beli_per_gram_snapshot REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE pesanan ADD COLUMN harga_jual_per_gram_snapshot REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE pesanan ADD COLUMN multi_color_data TEXT`,
  `ALTER TABLE setting ADD COLUMN nama_toko TEXT NOT NULL DEFAULT 'KYndel 3D'`,
  `ALTER TABLE setting ADD COLUMN alamat TEXT NOT NULL DEFAULT 'Jl. Kedurus Dukuh 1 No. 62'`,
  `ALTER TABLE setting ADD COLUMN telepon TEXT NOT NULL DEFAULT '083122750082'`,
  `ALTER TABLE transaksi ADD COLUMN hpp_snapshot REAL`,
  `ALTER TABLE pesanan ADD COLUMN diskon_tipe TEXT CHECK (diskon_tipe IN ('persen', 'rupiah'))`,
  `ALTER TABLE pesanan ADD COLUMN diskon_nilai REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE setting ADD COLUMN bank_nama TEXT`,
  `ALTER TABLE setting ADD COLUMN bank_no_rekening TEXT`,
  `ALTER TABLE setting ADD COLUMN bank_atas_nama TEXT`,
  `ALTER TABLE setting ADD COLUMN logo_base64 TEXT`
]

export function initDb(): void {
  const dbPath = app.isPackaged
    ? join(app.getPath('userData'), 'printlab.db')
    : join(app.getPath('userData'), 'printlab-dev.db')

  dbPath_ = dbPath
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  try {
    db.exec(SCHEMA)
    for (const migration of MIGRATIONS) {
      try { db.exec(migration) } catch { /* already migrated */ }
    }
    try {
      db.exec(`
        UPDATE materials
        SET harga_beli_per_gram = harga_per_gram,
            harga_jual_per_gram = harga_per_gram
        WHERE harga_beli_per_gram = 0 AND harga_per_gram > 0
      `)
    } catch { /* column may not exist */ }
    console.log('[DB] Migration selesai')
  } catch (err) {
    console.error('[DB] Migration gagal:', err)
    throw err
  }
  console.log(`[DB] Database connected: ${dbPath}`)
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
    console.log('[DB] Database ditutup')
  }
}
