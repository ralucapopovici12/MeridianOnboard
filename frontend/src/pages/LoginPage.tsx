import { useState } from 'react'
import { Compass, LogIn, Lock } from 'lucide-react'
import type { Employee } from '../api/types'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { Avatar } from '../components/Avatar'

const DEMO_PASSWORD = 'meridian2026'

export function LoginPage() {
  const { employees, loading, login, quickLogin } = useCurrentEmployee()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await login(email.trim(), password)
    } catch {
      setError('Incorrect email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  // A few representative personas so the demo is quick without a wall of buttons:
  // the new hires (you + one more), the HR owner, and a manager.
  const demoPeople = (() => {
    const picked: Employee[] = []
    const add = (e?: Employee) => {
      if (e && !picked.some((p) => p.id === e.id)) picked.push(e)
    }
    employees.filter((e) => e.isNewHire).slice(0, 2).forEach(add) // new hires (incl. "you")
    add(employees.find((e) => e.isHR)) // the single HR person
    add(employees.find((e) => /manager|lead|director/i.test(e.role) && !e.isHR)) // a manager
    return picked
  })()

  return (
    <div className="login-screen">
      <div className="login-card fade-up">
        <div className="login-brand">
          <span className="dark-header__logo-mark" style={{ width: 34, height: 34 }}>
            <Compass size={18} strokeWidth={2.5} />
          </span>
          <div>
            <div className="login-brand__name">Meridian</div>
            <div className="login-brand__sub">Onboarding workspace</div>
          </div>
        </div>

        <h1 className="login-title">Sign in</h1>
        <p className="login-sub">Welcome back — sign in to your workspace.</p>

        <form onSubmit={onSubmit}>
          <label className="login-field">
            <span className="login-label">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@meridian.com"
              className="login-input"
              required
            />
          </label>

          <label className="login-field">
            <span className="login-label">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="login-input"
              required
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-primary login-submit" disabled={submitting}>
            <LogIn size={15} />
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-hint">
          <Lock size={11} />
          Demo password for every account: <code>{DEMO_PASSWORD}</code>
        </div>

        <div className="login-divider"><span>Demo — quick sign in as</span></div>

        {loading ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading accounts…</p>
        ) : (
          <div className="login-quick">
            {demoPeople.map((p) => (
              <button
                key={p.id}
                type="button"
                className="login-quick__btn"
                onClick={() => quickLogin(p.id)}
                title={`Sign in as ${p.fullName}`}
              >
                <Avatar name={p.fullName} src={p.avatarUrl} size="sm" />
                <span className="login-quick__text">
                  <span className="login-quick__name">
                    {p.fullName}
                    {p.isHR && <span className="pill pill--accent login-quick__tag">HR</span>}
                    {p.isNewHire && <span className="pill pill--ok login-quick__tag">New</span>}
                  </span>
                  <span className="login-quick__role">{p.role}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
