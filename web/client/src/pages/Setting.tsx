import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchSetting, updateSetting } from '../store/settingSlice'
import { api, downloadBlob } from '../lib/api'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '13px var(--spacing-xl)', borderBottom: '1px solid var(--border)', background: 'linear-gradient(90deg, var(--accent-light), transparent)' }}>
        <h3 style={{ margin: 0, fontSize: '13px', fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>{title}</h3>
      </div>
      <div style={{ padding: 'var(--spacing-xl)' }}>{children}</div>
    </div>
  )
}

const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5l-3-3z"/>
    <polyline points="9,2 9,6 4,6"/><polyline points="4,10 12,10"/>
  </svg>
)

export default function SettingPage() {
  const dispatch = useAppDispatch()
  const { data: setting, status } = useAppSelector((s) => s.setting)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [dbMsg, setDbMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [dbLoading, setDbLoading] = useState(false)
  const [appVersion, setAppVersion] = useState('')
  const [form, setForm] = useState({
    tarifListrik: '', markupDefault: '',
    namaToko: '', alamat: '', telepon: '',
    logoBase64: '',
    bankNama: '', bankNoRekening: '', bankAtasNama: '',
  })

  useEffect(() => { dispatch(fetchSetting()) }, [dispatch])

  useEffect(() => {
    if (!setting) return
    setForm({
      tarifListrik: String(setting.tarifListrik),
      markupDefault: String(setting.markupDefault),
      namaToko: setting.namaToko ?? 'KYndel 3D',
      alamat: setting.alamat ?? '',
      telepon: setting.telepon ?? '',
      logoBase64: setting.logoBase64 ?? '',
      bankNama: setting.bankNama ?? '',
      bankNoRekening: setting.bankNoRekening ?? '',
      bankAtasNama: setting.bankAtasNama ?? '',
    })
  }, [setting])

  useEffect(() => {
    api.get<string>('/app/version').then(setAppVersion).catch(() => {})
  }, [])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Ukuran logo maksimal 2MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setForm(f => ({ ...f, logoBase64: ev.target?.result as string }))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleBackup = async () => {
    setDbMsg(null); setDbLoading(true)
    try {
      await downloadBlob('/setting/backup', `kyndel3d-backup-${new Date().toISOString().slice(0, 10)}.db`)
      setDbMsg({ type: 'success', text: 'Backup berhasil diunduh.' })
    } catch (err) {
      setDbMsg({ type: 'error', text: err instanceof Error ? err.message : 'Gagal membuat backup' })
    }
    setDbLoading(false)
  }

  const handleSave = async () => {
    setError(''); setSaved(false)
    try {
      await dispatch(updateSetting({
        tarifListrik: +form.tarifListrik,
        markupDefault: +form.markupDefault,
        namaToko: form.namaToko.trim(),
        alamat: form.alamat.trim(),
        telepon: form.telepon.trim(),
        logoBase64: form.logoBase64 || undefined,
        bankNama: form.bankNama.trim() || undefined,
        bankNoRekening: form.bankNoRekening.trim() || undefined,
        bankAtasNama: form.bankAtasNama.trim() || undefined,
      })).unwrap()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan')
    }
  }

  if (status === 'loading' && !setting) return <div className="page-loading"><div className="spinner" /><span>Memuat pengaturan...</span></div>

  return (
    <div className="animate-fade-up" style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>

      {/* Alert */}
      {error  && <div className="alert alert-danger">{error}</div>}
      {saved  && (
        <div className="alert alert-success">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,8 6,12 14,4"/>
          </svg>
          Pengaturan berhasil disimpan
        </div>
      )}

      {/* Info Toko */}
      <SectionCard title="Info Toko">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div>
            <label className="form-label">Nama Toko <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input value={form.namaToko} onChange={set('namaToko')} placeholder="Nama toko Anda" />
          </div>
          <div>
            <label className="form-label">Alamat</label>
            <input value={form.alamat} onChange={set('alamat')} placeholder="Alamat lengkap toko" />
          </div>
          <div>
            <label className="form-label">Nomor Telepon / WhatsApp</label>
            <input value={form.telepon} onChange={set('telepon')} placeholder="Contoh: 08123456789" />
          </div>
          <div>
            <label className="form-label">Logo Toko</label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: 72, height: 72, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: form.logoBase64 ? 'var(--bg-surface-2)' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {form.logoBase64
                  ? <img src={form.logoBase64} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>Belum<br/>ada logo</span>
                }
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                  Pilih Logo
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" style={{ display: 'none' }} onChange={handleLogoChange} />
                </label>
                {form.logoBase64 && (
                  <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }} onClick={() => setForm(f => ({ ...f, logoBase64: '' }))}>
                    Hapus Logo
                  </button>
                )}
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  PNG/JPG/SVG, maks 2MB.<br/>Gunakan logo putih agar<br/>terlihat di header gelap.
                </div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent)' }}>
            Info ini akan tampil di semua nota & invoice yang dicetak ke klien.
          </div>
        </div>
      </SectionCard>

      {/* Info Pembayaran */}
      <SectionCard title="Info Pembayaran">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Nama Bank</label>
              <input value={form.bankNama} onChange={set('bankNama')} placeholder="Contoh: BCA, Mandiri, BRI" />
            </div>
            <div>
              <label className="form-label">No. Rekening</label>
              <input value={form.bankNoRekening} onChange={set('bankNoRekening')} placeholder="Contoh: 1234567890" />
            </div>
          </div>
          <div>
            <label className="form-label">Atas Nama</label>
            <input value={form.bankAtasNama} onChange={set('bankAtasNama')} placeholder="Nama pemilik rekening" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent)' }}>
            Info ini akan tampil di bagian bawah invoice sebagai panduan pembayaran klien. Kosongkan jika tidak ingin ditampilkan.
          </div>
        </div>
      </SectionCard>

      {/* Pengaturan Global */}
      <SectionCard title="Pengaturan Global">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
          <div>
            <label className="form-label">Tarif Listrik (Rp/kWh)</label>
            <input type="number" value={form.tarifListrik} onChange={set('tarifListrik')} />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>Digunakan untuk kalkulasi biaya listrik pada setiap pesanan.</div>
          </div>
          <div>
            <label className="form-label">Markup Default (%)</label>
            <input type="number" value={form.markupDefault} onChange={set('markupDefault')} />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>Nilai markup awal saat membuat pesanan baru.</div>
          </div>
        </div>
      </SectionCard>

      {/* Backup Database */}
      <SectionCard title="Backup Data">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Database dijalankan di server. Unduh salinan rutin untuk mencegah kehilangan data.
            Restore hanya dilakukan langsung di server (lihat <code>DOCKER.md</code>) demi keamanan data bersama.
          </div>
          {dbMsg && (
            <div className={`alert ${dbMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ fontSize: '12px', wordBreak: 'break-all' }}>
              {dbMsg.text}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>Backup Database</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unduh salinan database sebagai file .db.</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleBackup} disabled={dbLoading} style={{ flexShrink: 0 }}>
              {dbLoading ? 'Menyiapkan...' : 'Unduh Backup'}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Tombol simpan */}
      <button className="btn btn-primary" onClick={handleSave} style={{ alignSelf: 'flex-start' }}>
        <SaveIcon />
        Simpan Semua Pengaturan
      </button>

      {/* Informasi Versi */}
      <SectionCard title="Informasi Versi">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            ['Versi', appVersion ? `v${appVersion}` : '—'],
            ['Stack', 'Express + React + TypeScript'],
            ['Database', 'SQLite (better-sqlite3)'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Sora', sans-serif" }}>{val}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
