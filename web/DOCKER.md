# Menjalankan web dashboard via Docker + Cloudflare Tunnel

## 1. Siapkan file env

```
cd web
cp .env.example .env          # isi CLOUDFLARE_TUNNEL_TOKEN nanti (lihat langkah 3)
```

`server/.env` sudah ada dari setup lokal (`AUTH_USERNAME`, `AUTH_PASSWORD_HASH`,
`JWT_SECRET`, `PORT`) — dipakai langsung oleh container `server`, tidak perlu diubah
kecuali mau ganti kredensial.

## 2. Build & jalankan

Di mini PC (Docker Desktop for Windows + WSL2 backend), dari folder `web/`:

```
docker compose build
docker compose up -d
```

Cek servernya sehat:

```
docker compose ps
docker compose logs -f server
```

`server` tidak publish port ke host — hanya `client` (nginx) dan `cloudflared` yang
bisa menjangkaunya lewat jaringan internal compose. Kalau mau test dulu dari browser
di jaringan lokal sebelum tunnel aktif, buka `docker-compose.yml` dan un-comment baris
`ports: "8080:80"` di service `client`, lalu `docker compose up -d --build client`, akses
`http://<ip-mini-pc>:8080`.

## 3. Buat Cloudflare Tunnel

1. Buka [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/) → **Networks → Tunnels**.
2. **Create a tunnel** → pilih **Cloudflared** → beri nama (mis. `kyndel3d-dashboard`).
3. Di step "Install and run a connector", pilih **Docker** — Cloudflare akan menampilkan
   perintah `docker run ... --token eyJ...`. Salin nilai setelah `--token`.
4. Tempel token itu ke `web/.env`:
   ```
   CLOUDFLARE_TUNNEL_TOKEN=eyJ...
   ```
5. Lanjut ke step **Public Hostname** di dashboard yang sama:
   - Subdomain/domain: domain kamu, mis. `dashboard.namadomainkamu.com`
   - Service type: `HTTP`
   - URL: `client:80` (nama service compose, bukan `localhost` — cloudflared dan
     client ada di jaringan Docker yang sama)
6. Restart cloudflared supaya token baru terbaca:
   ```
   docker compose up -d cloudflared
   ```

Dashboard akan bisa diakses di `https://dashboard.namadomainkamu.com` tanpa perlu
membuka port apapun di router/firewall mini PC — semua traffic keluar lewat tunnel.

## Update kode

```
git pull
docker compose up -d --build
```

## Data

Database SQLite (`printlab-web.db`) disimpan di named volume `server-data`, bukan di
filesystem image — aman dari `docker compose down` (tapi hilang kalau `docker compose
down -v`). Untuk backup:

```
docker compose exec server sh -c "cat /app/data/printlab-web.db" > backup.db
```
