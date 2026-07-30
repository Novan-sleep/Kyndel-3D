# Menjalankan web dashboard di ZimaOS

ZimaOS sudah punya Docker Engine + Docker Compose v2 bawaan, tapi App Store
GUI-nya dibuat untuk image jadi (docker run / compose dengan `image:`), bukan
untuk compose yang build dari source (`build: ./server`, `build: ./client`
seperti di `docker-compose.yml` project ini).

Ada dua cara pakai:

- **Cara A — import langsung (rekomendasi):** pakai `docker-compose.zimaos.yml`,
  yang isinya `image: ghcr.io/...` (bukan `build:`), lewat tombol "Install
  Custom App" di App Store. Tidak perlu clone repo atau build apa-apa di
  ZimaOS — image sudah dibangun otomatis oleh GitHub Actions
  (`.github/workflows/docker-publish.yml`) tiap kali ada push ke `main`, dan
  di-push ke GitHub Container Registry (GHCR). Lihat **bagian 0** di bawah.
- **Cara B — SSH + `docker compose build` dari source:** kalau mau full
  kontrol / tidak mau depend ke GHCR. Lewat **SSH + `docker compose` CLI
  langsung**, bukan lewat App Store. Lihat bagian 1–7.

## 0. Cara A: import `docker-compose.zimaos.yml` lewat App Store

1. Pastikan image sudah ke-publish: cek tab **Actions** di GitHub repo,
   workflow "Build & publish web images" sukses (jalan otomatis setelah push
   ke `main`, atau trigger manual lewat "Run workflow").
2. Package GHCR default-nya **private** dan terikat ke akun/repo GitHub kamu.
   Supaya ZimaOS bisa `docker pull` tanpa login, buka
   `github.com/users/<username>/packages/container/kyndel3d-web-server/settings`
   (dan `kyndel3d-web-client`) → **Change visibility** → **Public**. Alternatif
   kalau mau tetap private: `docker login ghcr.io` di ZimaOS via SSH pakai
   [Personal Access Token](https://github.com/settings/tokens) (scope
   `read:packages`) sebelum import.
3. Di ZimaOS App Store: **Install Custom App** (atau "Docker Compose" /
   "Import from YAML" tergantung versi UI) → paste isi
   `web/docker-compose.zimaos.yml`.
4. Isi environment variables yang diminta (`AUTH_USERNAME`,
   `AUTH_PASSWORD_HASH`, `JWT_SECRET`, `CLOUDFLARE_TUNNEL_TOKEN`) — nilainya
   sama seperti `server/.env` di setup lokal kamu, atau generate baru (lihat
   `web/README.md` untuk cara generate `AUTH_PASSWORD_HASH`). Kalau UI import
   tidak punya form env var, buat file `.env` di folder yang sama dengan
   compose-nya (copy dari `web/.env.zimaos.example`) sebelum import.
5. Deploy. Dashboard bisa diakses langsung di `http://<ip-zimaos>:8080`
   (port `8080` sudah dipublish di compose ini, beda dari `docker-compose.yml`
   biasa yang portnya di-comment). Setelah Cloudflare Tunnel aktif (bagian 5
   di bawah), akses lewat domain kamu juga jalan.
6. Update ke versi terbaru: setiap ada image baru di GHCR, tinggal
   **Recreate/Update** app dari ZimaOS UI (atau `docker compose pull &&
   docker compose up -d` kalau masih pakai CLI) — tidak perlu build ulang di
   ZimaOS.

Sisa dokumen di bawah ini (bagian 1–7) untuk **Cara B**.

## 1. Aktifkan SSH ke ZimaOS

Di ZimaOS web UI: **Settings → SSH** (atau menu serupa tergantung versi) →
aktifkan, catat IP ZimaOS dan port SSH (default `22`). Login dari komputer lain:

```
ssh <user>@<ip-zimaos>
```

## 2. Pindahkan kode ke ZimaOS

Pilih salah satu:

**a) git clone langsung di ZimaOS** (paling gampang untuk update selanjutnya):
```
git clone <url-repo-kamu>.git
cd kyndel3d-source/web
```

**b) Upload manual** — zip folder `web/` di komputer, upload lewat app **Files**
bawaan ZimaOS, lalu `unzip` via SSH di lokasi tujuan (mis. `/DATA/apps/kyndel3d-web`).

Simpan project di `/DATA/...` (bukan di root filesystem sistem) supaya bertahan
lewat update ZimaOS.

## 3. Siapkan env

```
cd /DATA/apps/kyndel3d-web/web      # sesuaikan path
cp .env.example .env                 # isi CLOUDFLARE_TUNNEL_TOKEN nanti
```

`server/.env` harus sudah berisi `AUTH_USERNAME`, `AUTH_PASSWORD_HASH`,
`JWT_SECRET`, `PORT` (copy dari setup lokal, atau buat baru).

## 4. Build & jalankan

```
docker compose build
docker compose up -d
```

Cek status:
```
docker compose ps
docker compose logs -f server
```

`server` tidak publish port ke host — hanya `client` (nginx) dan `cloudflared`
yang menjangkaunya lewat jaringan internal compose. Untuk test lokal dulu
sebelum tunnel aktif, un-comment baris `ports: "8080:80"` di service `client`
pada `docker-compose.yml`, lalu:
```
docker compose up -d --build client
```
akses `http://<ip-zimaos>:8080`.

> Container yang dibuat lewat `docker compose` di SSH tetap akan muncul di
> tab **Docker/Containers** pada ZimaOS web UI (untuk lihat status, log,
> start/stop lewat GUI) — kamu hanya tidak memakai alur "Install Custom App"
> untuk membuatnya.

## 5. Buat Cloudflare Tunnel

Sama seperti setup lain, tidak spesifik ZimaOS:

1. [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/) →
   **Networks → Tunnels** → **Create a tunnel** → **Cloudflared**.
2. Pilih connector **Docker**, salin token setelah `--token`.
3. Tempel ke `web/.env`:
   ```
   CLOUDFLARE_TUNNEL_TOKEN=eyJ...
   ```
4. Di step **Public Hostname**: domain kamu (mis. `dashboard.namadomainkamu.com`),
   service type `HTTP`, URL `client:80` (nama service compose, bukan `localhost`).
5. Reload token:
   ```
   docker compose up -d cloudflared
   ```

Tidak perlu buka port apapun di router — semua traffic keluar lewat tunnel,
jadi aman meski ZimaOS ada di jaringan rumah/kantor.

## 6. Update kode

```
cd /DATA/apps/kyndel3d-web/web
git pull
docker compose up -d --build
```

## 7. Data & backup

Database SQLite disimpan di named volume `server-data`, aman dari
`docker compose down` (hilang kalau `docker compose down -v`). Backup:

```
docker compose exec server sh -c "cat /app/data/printlab-web.db" > backup.db
```

Named volume Docker di ZimaOS biasanya fisik di
`/var/lib/docker/volumes/<project>_server-data/_data` kalau butuh akses
langsung filesystem-nya (untuk sync ke cloud/NAS storage misalnya), tapi
gunakan cara `docker compose exec` di atas untuk backup rutin — lebih aman
daripada menyalin file database saat container jalan.
