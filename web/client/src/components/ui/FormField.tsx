import type { ReactNode } from 'react'

interface Props {
  label: ReactNode
  required?: boolean
  children: ReactNode
}

export default function FormField({ label, required, children }: Props) {
  return (
    <div>
      <label className="form-label">
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}
