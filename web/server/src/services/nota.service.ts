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
    const matText = isMulti ? `Multi Color (${p.multiColorData!.length} warna)` : (p.materialNama ?? '-')
    const beratGram = (p.beratMaterial * 1000).toFixed(0)
    const hasDiskon = !!p.diskonTipe
    const rowBg = i % 2 === 0 ? '#FFFFFF' : '#FAFAFA'

    return `<tr style="background:${rowBg};">
      <td class="td-num">${String(i + 1).padStart(2, '0')}</td>
      <td class="td-main">
        <div class="item-name">${p.nama}</div>
        <div class="item-sub">${p.klien}${p.tipe ? ` &middot; ${p.tipe}` : ''}</div>
      </td>
      <td class="td-mid">
        <span class="chip">${p.printerNama ?? '-'}</span>
      </td>
      <td class="td-mid">
        <div class="mat-name">${matText}</div>
        <div class="mat-sub">${beratGram}g &middot; ${p.estimasiJam}j</div>
      </td>
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
    color: #111118;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #fff;
  }

  /* ── HEADER ─────────────────────────────────── */
  .header {
    background: #0E0E16;
    padding: 30px 32px 26px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
  }

  /* geometric rings — pure CSS decoration */
  .header::before {
    content: '';
    position: absolute;
    right: -60px; top: -60px;
    width: 200px; height: 200px;
    border: 1px solid rgba(220,60,30,0.10);
    border-radius: 50%;
  }
  .header::after {
    content: '';
    position: absolute;
    right: -18px; top: -18px;
    width: 100px; height: 100px;
    border: 1px solid rgba(220,60,30,0.20);
    border-radius: 50%;
  }

  .brand-name {
    font-size: 28px;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.8px;
    line-height: 1;
    margin-bottom: 5px;
  }
  .brand-dot { color: #DC3C1E; }

  .brand-tagline {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    margin-bottom: 16px;
  }

  .brand-contact {
    font-size: 10px;
    color: rgba(255,255,255,0.45);
    line-height: 1.9;
  }

  .invoice-meta {
    text-align: right;
    position: relative;
    z-index: 1;
  }

  .inv-eyebrow {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 3.5px;
    text-transform: uppercase;
    color: #DC3C1E;
    margin-bottom: 5px;
  }

  .inv-number {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 16px;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .inv-date {
    font-size: 10px;
    color: rgba(255,255,255,0.4);
    line-height: 1.8;
  }

  .inv-date strong {
    color: rgba(255,255,255,0.7);
    font-weight: 600;
  }

  .inv-badge {
    display: inline-block;
    margin-top: 10px;
    padding: 3px 10px;
    background: rgba(220,60,30,0.10);
    border: 1px solid rgba(220,60,30,0.30);
    border-radius: 2px;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #DC3C1E;
  }

  /* ── RED RULE ────────────────────────────────── */
  .rule {
    height: 3px;
    background: #DC3C1E;
  }

  /* ── INFO STRIP ──────────────────────────────── */
  .info-strip {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 20px 32px;
    gap: 28px;
    border-bottom: 1px solid #EAEAEA;
  }

  .info-eyebrow {
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #DC3C1E;
    margin-bottom: 8px;
  }

  .info-title {
    font-size: 15px;
    font-weight: 700;
    color: #111118;
    margin-bottom: 3px;
    line-height: 1.35;
  }

  .info-sub {
    font-size: 10.5px;
    color: #8A8A9A;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid #F2F2F2;
    font-size: 11px;
  }
  .stat-row:last-child { border-bottom: none; }
  .stat-label { color: #8A8A9A; }
  .stat-val {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 10.5px;
    font-weight: 600;
    color: #111118;
  }

  /* ── TABLE ───────────────────────────────────── */
  .table-wrap {
    padding: 20px 32px 0;
  }

  .table-eyebrow {
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #A0A0B0;
    margin-bottom: 10px;
  }

  table.items {
    width: 100%;
    border-collapse: collapse;
  }

  table.items thead th {
    padding: 7px 8px;
    text-align: left;
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #7A7A8A;
    border-top: 1.5px solid #111118;
    border-bottom: 1px solid #DCDCDC;
  }

  table.items thead th:last-child { text-align: right; }

  table.items tbody tr { page-break-inside: avoid; }

  table.items tbody tr:last-child td {
    border-bottom: 1.5px solid #111118;
  }

  table.items tbody td {
    border-bottom: 1px solid #EFEFEF;
  }

  .td-num {
    padding: 12px 8px;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 10px;
    color: #C0C0CC;
    width: 30px;
    vertical-align: top;
    padding-top: 14px;
  }

  .td-main { padding: 12px 8px; vertical-align: top; }
  .td-mid  { padding: 12px 8px; vertical-align: top; }
  .td-price { padding: 12px 8px; vertical-align: top; text-align: right; }

  .item-name {
    font-size: 12.5px;
    font-weight: 700;
    color: #111118;
    margin-bottom: 3px;
  }

  .item-sub {
    font-size: 10px;
    color: #8A8A9A;
  }

  .chip {
    display: inline-block;
    padding: 2px 7px;
    background: #F0F0F4;
    border-radius: 2px;
    font-size: 9px;
    font-weight: 600;
    color: #505060;
  }

  .mat-name {
    font-size: 11px;
    font-weight: 600;
    color: #3A3A4A;
    margin-bottom: 3px;
  }

  .mat-sub {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 9.5px;
    color: #9A9AAA;
  }

  .price-original {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 9px;
    color: #B8B8C8;
    text-decoration: line-through;
    margin-bottom: 2px;
  }

  .price-final {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 13px;
    font-weight: 700;
    color: #111118;
  }

  .discount-pill {
    display: inline-block;
    margin-top: 3px;
    padding: 1px 6px;
    background: rgba(220,60,30,0.08);
    border-radius: 2px;
    font-size: 8.5px;
    font-weight: 700;
    color: #DC3C1E;
  }

  /* ── WATERMARK ───────────────────────────────── */
  .page { position: relative; }

  .watermark {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 999;
  }

  .watermark img {
    width: 280px;
    height: 280px;
    object-fit: contain;
    opacity: 0.055;
  }

  /* ── HEADER LOGO ─────────────────────────────── */
  .header-logo {
    height: 34px;
    width: auto;
    object-fit: contain;
    display: block;
    margin-bottom: 8px;
    filter: brightness(0) invert(1);
    opacity: 0.85;
  }

  /* ── BOTTOM ROW (payment + total side by side) ── */
  .bottom-row {
    padding: 16px 32px 20px;
    display: flex;
    align-items: stretch;
    gap: 16px;
  }

  .total-block {
    background: #0E0E16;
    min-width: 240px;
    padding: 18px 22px 18px 26px;
    position: relative;
    overflow: hidden;
  }

  .total-block::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: #DC3C1E;
  }

  /* faint decorative circle */
  .total-block::after {
    content: '';
    position: absolute;
    right: -30px; bottom: -30px;
    width: 100px; height: 100px;
    border: 1px solid rgba(220,60,30,0.12);
    border-radius: 50%;
  }

  .total-count {
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-bottom: 3px;
  }

  .total-label {
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.40);
    margin-bottom: 6px;
  }

  .total-val {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 22px;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: -0.5px;
    position: relative;
    z-index: 1;
  }

  /* ── PAYMENT BOX ─────────────────────────────── */
  .payment-box {
    border: 1px solid #EAEAEA;
    border-radius: 4px;
    padding: 12px 16px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .payment-icon {
    width: 32px;
    height: 32px;
    background: #0E0E16;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .payment-eyebrow {
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #DC3C1E;
    margin-bottom: 6px;
  }

  .payment-row {
    display: flex;
    gap: 8px;
    font-size: 11px;
    padding: 2px 0;
  }

  .payment-label {
    color: #8A8A9A;
    min-width: 72px;
    flex-shrink: 0;
  }

  .payment-val {
    font-weight: 600;
    color: #111118;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 10.5px;
  }

  /* ── FOOTER ──────────────────────────────────── */
  .footer {
    padding: 16px 32px 26px;
    border-top: 1px solid #EAEAEA;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .footer-note {
    font-size: 10.5px;
    color: #8A8A9A;
    line-height: 1.8;
    max-width: 280px;
  }

  .footer-note strong { color: #111118; font-weight: 700; }

  .sign-line {
    width: 120px;
    height: 1px;
    background: #111118;
    margin: 48px 0 6px auto;
  }

  .sign-label {
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #8A8A9A;
    text-align: right;
  }
</style>
</head>
<body>
<div class="page">

  ${toko.logoBase64 ? `<div class="watermark"><img src="${toko.logoBase64}" /></div>` : ''}

    <!-- HEADER -->
    <div class="header">
      <div>
        ${toko.logoBase64 ? `<img src="${toko.logoBase64}" class="header-logo" />` : ''}
        <div class="brand-name">${toko.nama}<span class="brand-dot">.</span></div>
        <div class="brand-tagline">Jasa Cetak 3D Printing</div>
        <div class="brand-contact">${toko.alamat}<br>${toko.telepon}</div>
      </div>
      <div class="invoice-meta">
        <div class="inv-eyebrow">Invoice</div>
        <div class="inv-number">${invNo}</div>
        <div class="inv-date">Tanggal: <strong>${formatTgl(now.toISOString())}</strong></div>
        <div class="inv-date">Klien: <strong>${namaTagihan}</strong></div>
        <div><span class="inv-badge">&#10003;&nbsp;${pesanans.length} Pesanan Selesai</span></div>
      </div>
    </div>

    <div class="rule"></div>

    <!-- INFO STRIP -->
    <div class="info-strip">
      <div>
        <div class="info-eyebrow">Tagihan Kepada</div>
        <div class="info-title">${namaTagihan}</div>
      </div>
      <div>
        <div class="info-eyebrow">Ringkasan Order</div>
        <div class="stat-row">
          <span class="stat-label">Total Pesanan</span>
          <span class="stat-val">${pesanans.length} item</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Total Berat Material</span>
          <span class="stat-val">${totalBeratGram.toFixed(0)} g</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Tanggal Invoice</span>
          <span class="stat-val">${formatTgl(now.toISOString())}</span>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-wrap">
      <div class="table-eyebrow">Daftar Pesanan</div>
      <table class="items">
        <thead>
          <tr>
            <th style="width:30px;">#</th>
            <th>Pesanan</th>
            <th>Printer</th>
            <th>Material</th>
            <th style="text-align:right;">Nilai Jual</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <!-- BOTTOM ROW: payment (kiri) + total (kanan) sejajar -->
    <div class="bottom-row">
      ${(toko.bankNama || toko.bankNoRekening || toko.bankAtasNama) ? `
      <div class="payment-box" style="flex:1;">
        <div class="payment-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC3C1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
        </div>
        <div>
          <div class="payment-eyebrow">Informasi Pembayaran</div>
          ${toko.bankNama ? `<div class="payment-row"><span class="payment-label">Bank</span><span class="payment-val">${toko.bankNama}</span></div>` : ''}
          ${toko.bankNoRekening ? `<div class="payment-row"><span class="payment-label">No. Rekening</span><span class="payment-val">${toko.bankNoRekening}</span></div>` : ''}
          ${toko.bankAtasNama ? `<div class="payment-row"><span class="payment-label">Atas Nama</span><span class="payment-val">${toko.bankAtasNama}</span></div>` : ''}
        </div>
      </div>` : `<div style="flex:1;"></div>`}
      <div class="total-block" style="min-width:240px;flex-shrink:0;">
        <div class="total-count">${pesanans.length} item</div>
        <div class="total-label">Total Tagihan</div>
        <div class="total-val">${formatRp(totalTagihan)}</div>
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
