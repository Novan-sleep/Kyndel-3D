# KYndel 3D — Web Dashboard

Dashboard berbasis browser untuk manajemen KYndel 3D dari jarak jauh — printer, material,
pesanan, dan ringkasan KPI. Aplikasi terpisah dari desktop app (Electron) di root repo ini,
dengan database SQLite sendiri (`server/data/printlab-web.db`).

Untuk deploy via Docker + Cloudflare Tunnel, lihat [DOCKER.md](./DOCKER.md). Panduan ini
khusus untuk menjalankan **secara lokal** (tanpa Docker) untuk keperluan review.

## Tech Stack

- **Server**: Express 5 + TypeScript, `better-sqlite3`, auth JWT + bcrypt (single admin user)
- **Client**: React 18 + TypeScript + Redux Toolkit + Vite, tanpa router (manual page switching)

## Prasyarat

- Node.js 20+
- Sudah pernah `npm install` di `web/server` dan `web/client` (kalau belum, lihat langkah 1)

## 1. Install dependencies

```bash
cd web/server && npm install
cd ../client && npm install
```

## 2. Cek file `.env`

`web/server/.env` sudah berisi kredensial default:

```
AUTH_USERNAME=admin
AUTH_PASSWORD_HASH=<bcrypt hash>
JWT_SECRET=<random hex>
PORT=4000
```

Login default saat ini: **admin / kyndel3d2026**. Untuk ganti password, generate hash baru:

```bash
node -e "console.log(require('bcryptjs').hashSync('password-baru-kamu', 10))"
```

lalu tempel hasilnya ke `AUTH_PASSWORD_HASH` di `web/server/.env`.

`web/client/.env` berisi `VITE_API_URL=http://localhost:4000/api` — sudah pas untuk run lokal,
tidak perlu diubah.

## 3. Jalankan server & client

Dua terminal terpisah:

```bash
# terminal 1
cd web/server
npm run dev
# → [SERVER] Kyndel 3D web API listening on http://localhost:4000

# terminal 2
cd web/client
npm run dev
# → Local: http://localhost:5173
```

Buka **http://localhost:5173** di browser, login dengan kredensial di atas.

## 4. Cek cepat tanpa browser (opsional)

```bash
curl -s http://localhost:4000/api/health
# {"success":true,"data":{"status":"ok"}}

curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"kyndel3d2026"}'
# {"success":true,"data":{"token":"..."}}
```

## Struktur

```
web/
├── server/
│   ├── src/
│   │   ├── db.ts, types.ts, utils.ts
│   │   ├── repositories/     # SQL wrappers
│   │   ├── services/         # business logic + activity log
│   │   ├── middleware/       # auth (JWT), error handling
│   │   ├── routes/           # /api/auth, /printer, /material, /pesanan, /dashboard
│   │   └── index.ts          # entry point
│   └── data/                 # SQLite db (gitignored)
└── client/
    └── src/
        ├── store/             # Redux Toolkit slices
        ├── lib/api.ts         # fetch wrapper + JWT
        ├── pages/             # Login, Dashboard, Printers, Materials, Pesanan
        ├── components/        # Sidebar, StatusBadge, Modal
        └── App.tsx            # auth guard + page switching
```

## Build production

```bash
cd web/server && npm run build   # → dist/, jalankan dengan `node dist/index.js`
cd web/client && npm run build   # → dist/ (static assets)
```
