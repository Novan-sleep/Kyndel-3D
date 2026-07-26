import { FormEvent, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { login } from '../store/authSlice'

export default function Login() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((s) => s.auth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    dispatch(login({ username, password }))
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 22 }}>
          <h1>KYNDEL 3D</h1>
          <p className="text-secondary" style={{ marginTop: 6 }}>Masuk ke dashboard workshop</p>
        </div>
        <div className="field">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="error-text">{error}</div>}
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 6 }} disabled={status === 'loading'}>
          {status === 'loading' ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
