import { Pesanan } from '../types'
import { randomBytes } from 'crypto'

interface Toko { nama: string; alamat: string; telepon: string; logoBase64?: string; bankNama?: string; bankNoRekening?: string; bankAtasNama?: string }

function formatRp(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function formatTgl(iso?: string): string {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export function generateInvoiceHTML(pesanans: Pesanan[], toko: Toko, tagihanKepada?: string): string {
  const now = new Date()
  const invNo = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${randomBytes(2).toString('hex').toUpperCase()}`
  const totalTagihan = pesanans.reduce((s, p) => s + p.hargaFinal, 0)
  const kliens = [...new Set(pesanans.map(p => p.klien))]
  const namaTagihan = tagihanKepada?.trim() || kliens.join(', ')
  const totalBeratGram = pesanans.reduce((s, p) => s + p.beratMaterial * 1000, 0)

  const itemRows = pesanans.map((p, i) => {
    const isMulti = p.multiColorData && p.multiColorData.length > 0
    const hasDiskon = !!p.diskonTipe

    const materialCell = isMulti
      ? `<div class="mat-name">Multi Warna</div>
         <ul class="color-list">${p.multiColorData!.map(c => `<li>${c.materialNama} &middot; ${c.beratGram.toFixed(0)}g</li>`).join('')}</ul>`
      : `<div class="mat-name">${p.materialNama ?? '-'}</div>
         <div class="mat-sub">${(p.beratMaterial * 1000).toFixed(0)}g</div>`

    return `<tr>
      <td class="td-num">${String(i + 1).padStart(2, '0')}</td>
      <td class="td-main">
        <div class="item-name">${p.nama}</div>
        <div class="item-sub">${p.klien}${p.tipe ? ` &middot; ${p.tipe}` : ''}</div>
        <div class="item-date">Selesai ${formatTgl(p.completedAt)}</div>
      </td>
      <td class="td-mid">${p.printerNama ?? '-'}</td>
      <td class="td-mid">${materialCell}</td>
      <td class="td-mid">${p.estimasiJam} jam</td>
      <td class="td-price">
        ${hasDiskon ? `<div class="price-original">${formatRp(p.nilaiJual)}</div>` : ''}
        <div class="price-final">${formatRp(p.hargaFinal)}</div>
        ${hasDiskon ? `<div class="discount-pill">&minus;${p.diskonTipe === 'persen' ? `${p.diskonNilai}%` : formatRp(p.diskonNilai as number)}</div>` : ''}
      </td>
    </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', 'Segoe UI Variable', system-ui, sans-serif;
    font-size: 12px;
    color: #1C1C24;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #fff;
    padding: 36px 40px;
  }

  /* ── HEADER ─────────────────────────────────── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 20px;
  }

  .header-logo {
    height: 30px;
    width: auto;
    object-fit: contain;
    display: block;
    margin-bottom: 8px;
  }

  .brand-name {
    font-size: 20px;
    font-weight: 700;
    color: #1C1C24;
    letter-spacing: -0.3px;
    margin-bottom: 4px;
  }
  .brand-dot { color: #4F6BEA; }

  .brand-contact {
    font-size: 10.5px;
    color: #7A7A8A;
    line-height: 1.7;
  }

  .invoice-meta { text-align: right; }

  .inv-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #4F6BEA;
    margin-bottom: 6px;
  }

  .inv-number {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 13px;
    font-weight: 700;
    color: #1C1C24;
    margin-bottom: 8px;
  }

  .inv-date {
    font-size: 11px;
    color: #7A7A8A;
    line-height: 1.7;
  }

  .inv-date strong { color: #1C1C24; font-weight: 600; }

  /* ── RULE ────────────────────────────────────── */
  .rule { height: 2px; background: #4F6BEA; margin-bottom: 22px; }

  /* ── INFO STRIP ──────────────────────────────── */
  .info-strip {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #EAEAEA;
  }

  .info-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #9A9AAA;
    margin-bottom: 6px;
  }

  .info-title { font-size: 14px; font-weight: 700; color: #1C1C24; }

  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 11.5px;
  }
  .stat-label { color: #7A7A8A; }
  .stat-val { font-weight: 600; color: #1C1C24; }

  /* ── TABLE ───────────────────────────────────── */
  .section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #9A9AAA;
    margin-bottom: 10px;
  }

  table.items { width: 100%; border-collapse: collapse; margin-bottom: 22px; }

  table.items thead th {
    padding: 8px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #7A7A8A;
    border-bottom: 1.5px solid #1C1C24;
  }
  table.items thead th:last-child { text-align: right; }

  table.items tbody tr { page-break-inside: avoid; }
  table.items tbody td { padding: 12px 8px; border-bottom: 1px solid #EFEFEF; vertical-align: top; }

  .td-num { color: #C0C0CC; width: 26px; }
  .td-price { text-align: right; }

  .item-name { font-size: 12.5px; font-weight: 700; color: #1C1C24; margin-bottom: 2px; }
  .item-sub { font-size: 10.5px; color: #7A7A8A; margin-bottom: 2px; }
  .item-date { font-size: 10px; color: #9A9AAA; }

  .mat-name { font-size: 11.5px; font-weight: 600; color: #1C1C24; }
  .mat-sub { font-size: 10.5px; color: #9A9AAA; }
  .color-list { list-style: none; margin-top: 3px; }
  .color-list li { font-size: 10.5px; color: #7A7A8A; line-height: 1.6; }

  .price-final { font-size: 13px; font-weight: 700; color: #1C1C24; }
  .price-original { font-size: 10px; color: #B8B8C8; text-decoration: line-through; margin-bottom: 2px; }
  .discount-pill {
    display: inline-block; margin-top: 3px; padding: 1px 6px;
    background: rgba(79,107,234,0.08); border-radius: 3px;
    font-size: 9.5px; font-weight: 700; color: #4F6BEA;
  }

  /* ── BOTTOM ROW ──────────────────────────────── */
  .bottom-row { display: flex; align-items: stretch; gap: 16px; margin-bottom: 24px; }

  .payment-box {
    flex: 1;
    border: 1px solid #EAEAEA;
    border-radius: 6px;
    padding: 14px 16px;
  }

  .payment-row { display: flex; gap: 8px; font-size: 11px; padding: 2px 0; }
  .payment-label { color: #7A7A8A; min-width: 76px; flex-shrink: 0; }
  .payment-val { font-weight: 600; color: #1C1C24; }

  .total-block {
    min-width: 220px;
    flex-shrink: 0;
    border: 1.5px solid #4F6BEA;
    border-radius: 6px;
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .total-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #7A7A8A; margin-bottom: 4px; }
  .total-val { font-size: 22px; font-weight: 800; color: #4F6BEA; letter-spacing: -0.4px; }
  .total-count { font-size: 10.5px; color: #9A9AAA; margin-top: 2px; }

  /* ── FOOTER ──────────────────────────────────── */
  .footer {
    padding-top: 16px;
    border-top: 1px solid #EAEAEA;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .footer-note { font-size: 10.5px; color: #7A7A8A; line-height: 1.7; max-width: 300px; }
  .footer-note strong { color: #1C1C24; font-weight: 700; }

  .sign-line { width: 120px; height: 1px; background: #1C1C24; margin: 44px 0 6px auto; }
  .sign-label { font-size: 10px; color: #9A9AAA; text-align: right; }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div>
      ${toko.logoBase64 ? `<img src="${toko.logoBase64}" class="header-logo" />` : ''}
      <div class="brand-name">${toko.nama}<span class="brand-dot">.</span></div>
      <div class="brand-contact">${toko.alamat}<br>${toko.telepon}</div>
    </div>
    <div class="invoice-meta">
      <div class="inv-title">Invoice</div>
      <div class="inv-number">${invNo}</div>
      <div class="inv-date">Tanggal: <strong>${formatTgl(now.toISOString())}</strong></div>
      <div class="inv-date">${pesanans.length} Pesanan Selesai</div>
    </div>
  </div>

  <div class="rule"></div>

  <!-- INFO STRIP -->
  <div class="info-strip">
    <div>
      <div class="info-label">Ditagihkan Kepada</div>
      <div class="info-title">${namaTagihan}</div>
    </div>
    <div>
      <div class="info-label">Ringkasan Order</div>
      <div class="stat-row"><span class="stat-label">Total Pesanan</span><span class="stat-val">${pesanans.length} item</span></div>
      <div class="stat-row"><span class="stat-label">Total Berat Material</span><span class="stat-val">${totalBeratGram.toFixed(0)} g</span></div>
    </div>
  </div>

  <!-- TABLE -->
  <div class="section-label">Rincian Pesanan</div>
  <table class="items">
    <thead>
      <tr>
        <th style="width:26px;">#</th>
        <th>Pesanan</th>
        <th>Printer</th>
        <th>Material</th>
        <th>Waktu</th>
        <th style="text-align:right;">Harga</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- BOTTOM ROW -->
  <div class="bottom-row">
    ${(toko.bankNama || toko.bankNoRekening || toko.bankAtasNama) ? `
    <div class="payment-box">
      <div class="info-label">Informasi Pembayaran</div>
      ${toko.bankNama ? `<div class="payment-row"><span class="payment-label">Bank</span><span class="payment-val">${toko.bankNama}</span></div>` : ''}
      ${toko.bankNoRekening ? `<div class="payment-row"><span class="payment-label">No. Rekening</span><span class="payment-val">${toko.bankNoRekening}</span></div>` : ''}
      ${toko.bankAtasNama ? `<div class="payment-row"><span class="payment-label">Atas Nama</span><span class="payment-val">${toko.bankAtasNama}</span></div>` : ''}
    </div>` : `<div style="flex:1;"></div>`}
    <div class="total-block">
      <div class="total-label">Total Tagihan</div>
      <div class="total-val">${formatRp(totalTagihan)}</div>
      <div class="total-count">${pesanans.length} item</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-note">
      Terima kasih telah menggunakan layanan <strong>${toko.nama}</strong>.<br>
      Pertanyaan? Hubungi kami di ${toko.telepon}
    </div>
    <div>
      <div class="sign-line"></div>
      <div class="sign-label">Tanda Tangan</div>
    </div>
  </div>

</div>
</body>
</html>`
}
