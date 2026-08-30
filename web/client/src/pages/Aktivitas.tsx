import { useEffect } from 'react'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchAktivitas } from '../store/aktivitasSlice'
import { formatTgl } from '../lib/api'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'

const modulColorMap: Record<string, { color: string; bg: string }> = {
  Pesanan:  { color: 'var(--accent)',  bg: 'var(--accent-light)' },
  Printer:  { color: 'var(--info)',    bg: 'var(--info-light)' },
  Material: { color: 'var(--warning)', bg: 'var(--warning-light)' },
  Keuangan: { color: 'var(--success)', bg: 'var(--success-light)' },
  Sistem:   { color: 'var(--text-muted)', bg: 'var(--bg-surface-3)' },
}

export default function AktivitasPage() {
  const dispatch = useAppDispatch()
  const { items: aktivitas, status } = useAppSelector((s) => s.aktivitas)

  useEffect(() => { dispatch(fetchAktivitas(200)) }, [dispatch])

  if (status === 'loading' && aktivitas.length === 0) return <div className="page-loading"><div className="spinner" /><span>Memuat aktivitas...</span></div>
  if (aktivitas.length === 0) return <EmptyState message="Belum ada aktivitas tercatat" icon="aktivitas" />

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="card" style={{ overflow: 'hidden' }}>
        {aktivitas.map((a, i) => (
          <m.div
            key={a.id}
            className="row-hover"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: Math.min(i, 12) * 0.02, ease: 'easeOut' }}
            style={{
              display: 'flex', gap: 'var(--spacing-md)', padding: '11px var(--spacing-lg)',
              borderBottom: i < aktivitas.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 1 }}>
              <StatusBadge status={a.modul} colorMap={modulColorMap} dot={false} />
            </span>
            <div style={{ flex: 1, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.deskripsi}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{formatTgl(a.createdAt)}</div>
          </m.div>
        ))}
      </div>
    </LazyMotion>
  )
}
