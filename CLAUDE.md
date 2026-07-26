# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Electron with hot reload (electron-vite dev)
- `npm run build` — type-check + bundle main/preload/renderer to `out/`
- `npm run dist` — build then package installer with electron-builder
- `npm run preview` — preview a production build

There is no test runner, linter script, or formatter wired up in `package.json`. Do not invent one.

## Architecture

Electron app with three isolated layers; data flows **renderer → preload → IPC → main service → repository → SQLite**.

### Process boundaries

- **`src/main/`** — Node/Electron main process. Owns the SQLite DB and all business logic.
- **`src/preload/index.ts`** — only bridge between renderer and main. Uses `contextBridge.exposeInMainWorld('api', …)` to expose a typed object whose methods call `ipcRenderer.invoke(channel, …)`. **Adding a new feature requires touching three files in lockstep:** register the handler in `src/main/ipc.ts`, expose the wrapper in `src/preload/index.ts`, and call `window.api.<group>.<method>` from the renderer (via `src/renderer/src/lib/api.ts`).
- **`src/renderer/`** — React 18 + TypeScript UI. No router library; `App.tsx` does manual page switching. Alias `@renderer` → `src/renderer/src`.

### Main process layering

`ipc.ts` → `services/*.service.ts` → `repositories/*.repository.ts` → `db.ts` (better-sqlite3).

- **Repositories** are thin SQL wrappers. They do not validate or coordinate across tables.
- **Services** hold all business rules and cross-table coordination. Multi-table writes (e.g. `pesanan.mulaiPrinting`, `selesaikan`, `batalkan`) wrap repository calls in `getDb().transaction(...)` via the `withTransaction` helper.
- **`ipc.ts` `handle()` wrapper** uniformly returns `{ success: true, data }` or `{ success: false, error }`. All IPC responses follow this envelope — renderer code must unwrap accordingly.
- **Activity log is a side-effect of services**, not the renderer. Every state-changing service call should append to `aktivitas` via `aktivitasRepository.catat(modul, aksi, deskripsi, refId)`.

### Database

- SQLite via `better-sqlite3`, file at `%APPDATA%/kyndel-3d/printlab.db` (prod) or `printlab-dev.db` (dev).
- Schema and migrations live in `src/main/db.ts`. WAL + foreign keys enabled.
- Migrations are an append-only `MIGRATIONS` array of raw `ALTER` statements wrapped in try/catch (idempotent — failures swallowed assuming "already applied"). When evolving the schema, **add to this array; do not rewrite `SCHEMA`** for existing tables — existing user databases won't see CREATE TABLE changes.
- Tables: `printers`, `materials`, `pesanan`, `transaksi`, `aktivitas`, `setting`. `pesanan` snapshots pricing inputs (`harga_beli_per_gram_snapshot`, `watt_snapshot`, `tarif_listrik_snapshot`, etc.) at creation time so historical orders aren't affected by later master-data edits.

### Domain workflow (pesanan)

Status machine: `Antrian → Printing → Selesai` (or `Dibatalkan` from Antrian/Printing). Enforced in `pesanan.service.ts`. Side-effects on transition:

- `mulaiPrinting`: flips printer to `Printing`, links `current_pesanan_id`.
- `selesaikan`: deducts material stock, frees printer (`Idle`), increments `printer.total_jam`, auto-creates a `pendapatan` transaction tagged `is_auto_generated=1`. Money rows for completed pesanan are **derived**, not user-entered.
- `batalkan`: frees the printer if it was Printing; no stock or transaction effects.
- `hapus`: only allowed for `Selesai` or `Dibatalkan`.

### Pricing

Two formulas in `src/main/services/pricing.service.ts`. Inputs are kg-based but converted to grams internally:

- `HPP = (beratGram × hargaBeliPerGram) + (watt/1000 × estimasiJam × tarifListrik)`
- `HargaRekomendasi = ((beratGram × hargaJualPerGram) + biayaListrik) × (1 + markup/100)`

`previewPricing` is exposed via `pricing:preview` for live form previews — keep its return shape (`biayaMaterial`, `marginMaterial`, `biayaListrik`, `hpp`, `hargaRekomendasi`, `profitEstimasi`) in sync with renderer consumers.
