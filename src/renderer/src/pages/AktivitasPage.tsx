import { useState, useEffect } from 'react'
import { api, formatTgl } from '../lib/api'
import { Aktivitas } from '../types'
import EmptyState from '../components/ui/EmptyState'

const modulConfig: Record<string, { color: string; bg: string }> = {
  Pesanan:  { color: 'var(--accent)',  bg: 'var(--accent-light)' },
  Printer:  { color: 'var(--info)',    bg: 'var(--info-light)' },
  Material: { color: 'var(--warning)', bg: 'var(--warning-light)' },
  Keuangan: { color: 'var(--success)', bg: 'var(--success-light)' },
  Sistem:   { color: 'var(--text-muted)', bg: 'var(--bg-surface-3)' },
}

export default function AktivitasPage() {
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.aktivitas.getAll(200).then((res: any) => {
      if (res.success) setAktivitas(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="page-loading"><div className="spinner" /><span>Memuat aktivitas...</span></div>
  if (aktivitas.length === 0) return <EmptyState message="Belum ada aktivitas tercatat" icon="aktivitas" />

  return (
    <div className="animate-fade-up card" style={{ overflow: 'hidden' }}>
      {aktivitas.map((a, i) => {
        const cfg = modulConfig[a.modul] ?? { color: 'var(--text-muted)', bg: 'var(--bg-surface-3)' }
        return (
          <div key={a.id} className="row-hover" style={{
            display: 'flex', gap: 'var(--spacing-md)', padding: '11px var(--spacing-lg)',
            borderBottom: i < aktivitas.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            alignItems: 'flex-start',
          }}>
            <span style={{
              padding: '2px 8px', borderRadius: 'var(--radius-full)',
              fontSize: '10px', fontWeight: 700,
              background: cfg.bg, color: cfg.color,
              flexShrink: 0, marginTop: '2px',
              letterSpacing: '0.04em',
            }}>{a.modul}</span>
            <div style={{ flex: 1, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.deskripsi}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{formatTgl(a.createdAt)}</div>
          </div>
        )
      })}
    </div>
  )
}
