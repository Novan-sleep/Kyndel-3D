import { FormEvent, useState } from 'react'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { login } from '../store/authSlice'
import FormField from '../components/ui/FormField'
import logoImg from '../assets/logo.png'

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2.2" />
  </svg>
)
const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 2l12 12" /><path d="M6.6 4.4A6.9 6.9 0 018 4.2c4.5 0 7 3.8 7 3.8a12.7 12.7 0 01-2.3 2.6M4.3 5.3S2 6.5 1 8c0 0 2.5 3.8 7 3.8.7 0 1.4-.1 2-.3" /><path d="M6.6 8a1.4 1.4 0 002.4 1" />
  </svg>
)

export default function Login() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((s) => s.auth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    dispatch(login({ username, password }))
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', padding: 16,
      }}>
        <m.div
          className="card login-split"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ width: 800, maxWidth: '100%', display: 'flex', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', padding: 0 }}
        >
          {/* Left: static brand panel */}
          <div className="login-brand-panel" style={{
            width: 320, flexShrink: 0, position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 32, textAlign: 'center', borderRight: '1px solid var(--border)',
            background: 'radial-gradient(circle at 30% 20%, var(--accent-light), transparent 60%), var(--bg-surface-2)',
          }}>
            <div className="login-brand-dots" />
            <img src={logoImg} alt="KYndel 3D" className="sidebar-logo" style={{ maxWidth: 150, maxHeight: 60, objectFit: 'contain', marginBottom: 16, position: 'relative' }} />
            <p className="text-secondary" style={{ fontSize: 13, lineHeight: 1.6, position: 'relative' }}>
              Kelola pesanan, printer, dan keuangan workshop 3D printing kamu dari satu dashboard.
            </p>
          </div>

          {/* Right: sign-in form */}
          <m.form
            onSubmit={handleSubmit}
            style={{ flex: 1, minWidth: 0, padding: 32 }}
          >
            <h1 style={{ marginBottom: 2 }}>Selamat datang kembali</h1>
            <p className="text-secondary" style={{ fontSize: 13, marginBottom: 24 }}>Masuk ke dashboard workshop</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 6 }}>
              <FormField label="Username" required>
                <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
              </FormField>
              <FormField label="Password" required>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: 36 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    style={{
                      position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                      width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)',
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </FormField>
            </div>

            {error && <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div>}

            <button className="btn btn-primary btn-shimmer" style={{ width: '100%', marginTop: 18 }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Memproses…' : 'Masuk'}
            </button>
          </m.form>
        </m.div>
      </div>
    </LazyMotion>
  )
}
