# Changelog — KYndel 3D

Semua perubahan penting pada aplikasi didokumentasikan di sini.

---

## [2.0.0] — 2026-06-10

### Halaman Baru

- **Statistik** — dashboard analytics lengkap menggunakan Recharts
  - Area chart tren revenue bulanan (gradient fill, interactive dots)
  - Donut pie distribusi status pesanan dengan center label & custom legend
  - Horizontal bar chart top klien by revenue (gradient bars per warna)
  - Horizontal bar chart material paling banyak terpakai
  - Horizontal bar chart utilisasi printer (warna per status)
  - 4 KPI cards (Pesanan Selesai, Total Klien, Total Revenue, Rata-rata/Order) dengan icon & gradient
- **Klien** — manajemen database klien
  - CRUD klien (nama, telepon, email, alamat, catatan)
  - Riwayat pesanan per klien
  - Statistik total pesanan & total nilai per klien

### Fitur Pesanan

- **Export CSV** — export semua pesanan ke file `.csv` (17 kolom, encoding UTF-8 BOM untuk Excel)
- **Search realtime** — filter pesanan by nama pesanan atau nama klien
- **Sort** — 6 opsi sorting: Terbaru, Terlama, Nama Klien, Harga ↓, Harga ↑, Deadline
- **Edit Antrian** — edit semua field pesanan berstatus Antrian (nama, klien, material, berat, printer, harga, dll)
- **Edit catatan & deadline** — edit catatan dan deadline untuk pesanan di semua status (termasuk Printing, Selesai, Dibatalkan)
- **Toolbar redesign** — dipecah jadi 2 baris: baris 1 filter tabs + tombol utama, baris 2 sort/search/utility

### Fitur Material

- **Search** — filter material secara realtime by nama, tipe, atau warna

### Fitur Keuangan

- **Export CSV transaksi** — export semua transaksi ke file `.csv` (7 kolom)
- **Laporan PDF bulanan** — cetak laporan keuangan per bulan ke PDF (income, expense, profit, daftar transaksi)

### Fitur Printer

- **Status gate** — printer berstatus `Maintenance` atau `Rusak` tidak dapat dipilih saat membuat atau mengedit pesanan
- **Status indicator** — badge kondisi printer (Idle / Printing / Maintenance / Rusak) ditampilkan di card printer

### UI/UX

- **KPI Cards** — icon SVG per card, gradient top strip 2px, ambient corner glow, nilai dengan Sora 800
- **Chart cards** — left accent strip bercahaya, badge pill count, header lebih bersih
- **Tooltip glassmorphism** — backdrop blur, border gradient, separator line, dot glow
- **Gradient bars** — semua bar chart menggunakan SVG linearGradient (opacity ramp kiri→kanan)
- **Filter tab aktif** — background gradient `accent → accent-dark` dengan glow shadow

### IPC Channels Baru

| Channel | Deskripsi |
|---|---|
| `pesanan:updateMeta` | Update catatan & deadline tanpa batasan status |
| `export:pesanan` | Export CSV semua pesanan |
| `export:transaksi` | Export CSV semua transaksi |
| `laporan:keuanganBulan` | Generate & cetak laporan keuangan PDF per bulan |
| `klien:getAll / create / update / delete` | CRUD klien |

---

## [1.2.0]

- Sidebar footer menampilkan nama toko & inisial avatar dari database (tidak lagi hardcoded)
- Window titlebar dinamis — menampilkan nama halaman aktif + versi aplikasi
- Versi aplikasi di sidebar diambil otomatis dari `package.json` via `app:getVersion` IPC
- Perbaikan IPC channel `app:setTitle` untuk update judul jendela dari renderer

---

## [1.1.0]

- Nota & invoice PDF: info toko (nama, alamat, telepon) diambil dari Setting, bukan hardcoded
- Export PDF menggunakan file temp di `%TEMP%` — menghindari batas ukuran 2MB Chromium
- Invoice multi-pesanan: preview HTML via iframe sebelum download PDF
- Setting: nama toko, alamat, dan telepon kini editable dan disimpan ke database
