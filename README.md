# KYndel 3D — Aplikasi Manajemen Jasa 3D Printing

Aplikasi desktop berbasis **Electron + React + TypeScript** untuk manajemen operasional jasa 3D printing.

**Versi saat ini: 2.0.0** — lihat [CHANGELOG.md](./CHANGELOG.md) untuk riwayat perubahan lengkap.

## Tech Stack

- **Electron** v32 — Desktop app framework
- **React** v18 + **TypeScript** — UI renderer
- **electron-vite** — Build tool
- **better-sqlite3** — Database lokal (SQLite)
- **Recharts** v3 — Library charting untuk halaman Statistik
- **nanoid** — ID generator

## Fitur

- **Dashboard** — KPI operasional & keuangan, alert deadline & stok, aktivitas terbaru
- **Pesanan** — CRUD, workflow status (Antrian → Printing → Selesai), kalkulasi HPP otomatis, multi-color support, search/filter/sort, edit catatan & deadline di semua status, export CSV, export nota & invoice PDF
- **Klien** — Manajemen database klien, riwayat pesanan per klien, statistik total nilai
- **Printer** — Manajemen printer (FDM, Resin, SLA, SLS), tracking jam penggunaan, status gate (Maintenance/Rusak tidak bisa dipakai di pesanan)
- **Material** — Manajemen filament/resin, harga beli/jual, alert stok minimum, search realtime
- **Keuangan** — Pencatatan transaksi manual & otomatis, export CSV, laporan PDF per bulan
- **Statistik** — Dashboard analytics: tren revenue bulanan, distribusi status, top klien, material usage, printer utilization (powered by Recharts)
- **Aktivitas** — Log semua aktivitas sistem
- **Setting** — Nama toko, alamat, telepon, tarif listrik & markup default

## Struktur Project

```
kyndel-3d/
├── src/
│   ├── main/                        # Electron main process
│   │   ├── index.ts                 # Entry point, window, nota, export & laporan IPC
│   │   ├── db.ts                    # Database init & schema + migrations
│   │   ├── ipc.ts                   # IPC handler registrar
│   │   ├── types.ts                 # Shared TypeScript types
│   │   ├── repositories/            # Data access layer (thin SQL wrappers)
│   │   │   ├── pesanan.repository.ts
│   │   │   ├── printer.repository.ts
│   │   │   ├── material.repository.ts
│   │   │   ├── transaksi.repository.ts
│   │   │   ├── aktivitas.repository.ts
│   │   │   ├── klien.repository.ts
│   │   │   └── setting.repository.ts
│   │   └── services/                # Business logic layer
│   │       ├── pesanan.service.ts
│   │       ├── printer.service.ts
│   │       ├── material.service.ts
│   │       ├── transaksi.service.ts
│   │       ├── klien.service.ts
│   │       ├── setting.service.ts
│   │       ├── dashboard.service.ts
│   │       ├── pricing.service.ts
│   │       └── nota.service.ts
│   ├── preload/
│   │   └── index.ts                 # Context bridge API (window.api)
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── main.tsx             # React entry
│           ├── App.tsx              # Root component + routing + title sync
│           ├── types.ts             # Frontend types
│           ├── lib/
│           │   └── api.ts           # API wrapper + helpers (formatRp, formatTgl)
│           ├── assets/
│           │   └── index.css        # Global styles + CSS variables (dark/light)
│           ├── components/
│           │   └── ui/
│           │       ├── Sidebar.tsx
│           │       ├── Topbar.tsx
│           │       ├── StatusBadge.tsx
│           │       ├── EmptyState.tsx
│           │       └── ConfirmDialog.tsx
│           └── pages/
│               ├── DashboardPage.tsx
│               ├── PesananPage.tsx
│               ├── KlienPage.tsx
│               ├── PrinterPage.tsx
│               ├── MaterialPage.tsx
│               ├── KeuanganPage.tsx
│               ├── StatistikPage.tsx
│               ├── AktivitasPage.tsx
│               └── SettingPage.tsx
├── CHANGELOG.md
├── electron.vite.config.ts
├── electron-builder.yml
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── tsconfig.web.json
```

## Database (SQLite)

Tabel: `printers`, `materials`, `pesanan`, `transaksi`, `aktivitas`, `klien`, `setting`

File DB tersimpan di:
- **Dev:** `%APPDATA%/kyndel-3d/printlab-dev.db`
- **Prod:** `%APPDATA%/kyndel-3d/printlab.db`

Schema WAL + foreign keys diaktifkan. Migrasi bersifat append-only di array `MIGRATIONS` dalam `db.ts`.

## Kalkulasi HPP

```
HPP              = (berat_gram × harga_beli_per_gram) + (watt / 1000 × estimasi_jam × tarif_listrik)
Harga Rekomendasi = ((berat_gram × harga_jual_per_gram) + biaya_listrik) × (1 + markup / 100)
```

Semua input harga di-snapshot ke baris `pesanan` saat pembuatan sehingga perubahan master data tidak mempengaruhi histori order.

## Install & Development

```bash
npm install
npm run dev       # Dev mode (hot reload)
npm run build     # Build production
npm run dist      # Build + package installer (.exe)
```

## IPC Channels

| Channel | Deskripsi |
|---|---|
| `dashboard:getKPI` | Ambil semua KPI dashboard |
| `pesanan:getAll / create / update / hapus` | CRUD pesanan |
| `pesanan:mulaiPrinting / selesaikan / batalkan` | Workflow status pesanan |
| `pesanan:updateMeta` | Update catatan & deadline (semua status) |
| `printer:getAll / create / update / delete` | CRUD printer |
| `material:getAll / create / update / delete` | CRUD material |
| `klien:getAll / create / update / delete` | CRUD klien |
| `transaksi:getAll / createManual / delete` | CRUD transaksi |
| `aktivitas:getAll` | Log aktivitas |
| `setting:get / update` | Pengaturan global |
| `pricing:preview` | Preview kalkulasi HPP live |
| `nota:exportPDF` | Export nota PDF per pesanan |
| `nota:getInvoiceHTML` | Ambil HTML invoice untuk preview |
| `nota:exportInvoicePDF` | Export invoice PDF multi-pesanan |
| `export:pesanan` | Export semua pesanan ke CSV |
| `export:transaksi` | Export semua transaksi ke CSV |
| `laporan:keuanganBulan` | Generate & cetak laporan keuangan PDF per bulan |
| `app:getVersion` | Versi aplikasi dari package.json |
| `app:setTitle` | Update judul window dari renderer |
