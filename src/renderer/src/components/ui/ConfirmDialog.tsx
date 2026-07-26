interface Props {
  title: string; message: string
  onConfirm: () => void; onCancel: () => void
  confirmLabel?: string; danger?: boolean
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Konfirmasi', danger = false }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: '400px' }}>
        <div className="modal-header" style={{
          background: danger
            ? 'linear-gradient(135deg, var(--danger-light), transparent)'
            : 'linear-gradient(135deg, var(--accent-light), transparent)',
        }}>
          <h3 style={{ color: danger ? 'var(--danger)' : 'var(--text-primary)' }}>{title}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{message}</p>
          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onCancel}>Batal</button>
            <button
              className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}
              onClick={onConfirm}
            >{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
