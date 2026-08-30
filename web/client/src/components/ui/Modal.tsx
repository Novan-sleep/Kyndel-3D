import { LazyMotion, domAnimation, m } from 'motion/react'
import type { ReactNode } from 'react'

interface Props {
  width?: number | string
  children: ReactNode
}

export default function Modal({ width = 480, children }: Props) {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
        <m.div
          className="modal-box"
          style={{ width }}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {children}
        </m.div>
      </m.div>
    </LazyMotion>
  )
}
