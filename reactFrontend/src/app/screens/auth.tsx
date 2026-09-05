import { useState } from 'react'
import { Button } from '../ui'
import { IconUser, IconStethoscope } from '../icons'
import { useAuth, roleHome } from '../auth/AuthContext'

function BrandPanel() {
  return (
    <div className="im-auth__brand">
      <div className="im-logo">
        <img className="im-logo__img" src="/logo.png" alt="IntelliMeds" width={40} height={40} />
        <span className="im-logo__name" style={{ color: '#fff' }}>IntelliMeds</span>
      </div>
      <h2>Know before you dose.</h2>
      <p>Instantly check drug–drug interactions with clinical-grade severity ratings and an AI care plan.</p>
    </div>
  )
}

function AuthInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <label className="im-field">
      <span className="im-field__label">{label}</span>
      <input className="im-field__input" value={value} placeholder={placeholder} type={type}
        onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function ErrorNote({ msg }: { msg: string | null }) {
  if (!msg) return null
  return <p style={{ color: 'var(--sev-major)', fontSize: 13, margin: 0 }}>{msg}</p>
}

export function Login() {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const me = await login(email, password)
    if (me) location.hash = roleHome(me.role)
  }

  return (
    <div className="im-auth">
      <BrandPanel />
      <div className="im-auth__form">
        <form className="im-auth__card" onSubmit={submit}>
          <span className="eyebrow">Welcome back</span>
          <h1>Sign in to your account</h1>
          <AuthInput label="Email address" value={email} onChange={setEmail} type="email" />
          <AuthInput label="Password" value={password} onChange={setPassword} placeholder="••••••••••" type="password" />
          <ErrorNote msg={error} />
          <Button type="submit" block disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
          <p className="im-auth__alt">New here? <a href="#/register">Create an account</a></p>
          <p className="im-auth__alt" style={{ marginTop: -4 }}><a href="#/admin/login">Administrator sign in</a></p>
        </form>
      </div>
    </div>
  )
}

/** Dedicated administrator entry — separate URL, separate branding. */
export function AdminLogin() {
  const { login, logout, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const me = await login(email, password)
    if (!me) { setError('Invalid email or password'); return }
    if (me.role !== 'ROLE_ADMIN') {
      await logout()
      setError('This portal is for administrators only.')
      return
    }
    location.hash = '#/admin/dashboard'
  }

  return (
    <div className="im-auth" style={{ background: 'var(--bg-canvas)', display: 'grid', placeItems: 'center' }}>
      <form
        className="im-card"
        style={{ width: 'min(440px, 92vw)', padding: 44, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-md)' }}
        onSubmit={submit}
      >
        <div className="im-logo">
          <img className="im-logo__img" src="/logo.png" alt="IntelliMeds" width={34} height={34} />
          <span className="im-logo__name">IntelliMeds</span>
          <span className="im-tag" style={{ marginLeft: 2 }}>Admin</span>
        </div>
        <span className="eyebrow">Restricted access</span>
        <h1 style={{ fontSize: 26 }}>Administrator sign in</h1>
        <AuthInput label="Email address" value={email} onChange={setEmail} type="email" />
        <AuthInput label="Password" value={password} onChange={setPassword} placeholder="••••••••••" type="password" />
        <ErrorNote msg={error} />
        <Button type="submit" block disabled={loading}>{loading ? 'Signing in…' : 'Sign in to console'}</Button>
        <p className="im-auth__alt"><a href="#/login">← Back to patient sign in</a></p>
      </form>
    </div>
  )
}

export function Register() {
  const { register, loading, error } = useAuth()
  const [role, setRole] = useState<'ROLE_PATIENT' | 'ROLE_HEALTHCARE_PROFESSIONAL'>('ROLE_PATIENT')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [hospital, setHospital] = useState('')
  const isPro = role === 'ROLE_HEALTHCARE_PROFESSIONAL'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const professional = isPro ? { specialization, licenseNumber, hospital } : undefined
    const me = await register(name, email, password, role, professional)
    if (me) location.hash = roleHome(me.role)
  }

  return (
    <div className="im-auth" style={{ background: 'var(--bg-canvas)', display: 'grid', placeItems: 'center' }}>
      <form
        className="im-card"
        style={{ width: 'min(560px, 92vw)', padding: 44, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-md)' }}
        onSubmit={submit}
      >
        <span className="eyebrow">Create account</span>
        <h1 style={{ fontSize: 30 }}>Join IntelliMeds</h1>
        <span className="im-field__label">I am a…</span>
        <div className="im-roles">
          <button type="button" className={`im-role${role === 'ROLE_PATIENT' ? ' im-role--active' : ''}`} onClick={() => setRole('ROLE_PATIENT')}>
            <span className="im-role__ic"><IconUser width={18} height={18} /></span>
            <b>Patient</b><small>Track meds &amp; check interactions</small>
          </button>
          <button type="button" className={`im-role${isPro ? ' im-role--active' : ''}`} onClick={() => setRole('ROLE_HEALTHCARE_PROFESSIONAL')}>
            <span className="im-role__ic"><IconStethoscope width={18} height={18} /></span>
            <b>Professional</b><small>Clinical tools &amp; patient lookup</small>
          </button>
        </div>
        <AuthInput label="Full name" value={name} onChange={setName} placeholder="Sarah Chen" />
        <AuthInput label="Email address" value={email} onChange={setEmail} placeholder="sarah.chen@email.com" type="email" />
        <AuthInput label="Password" value={password} onChange={setPassword} placeholder="Create a strong password" type="password" />
        {isPro && (
          <>
            <div style={{ borderTop: '1px solid var(--line)', margin: '4px 0 2px' }} />
            <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>
              Professional accounts are reviewed by our team before verification. You can sign in right away — clinical features unlock once an admin approves your credentials.
            </p>
            <AuthInput label="Specialization" value={specialization} onChange={setSpecialization} placeholder="e.g. Cardiology" />
            <AuthInput label="Medical license number" value={licenseNumber} onChange={setLicenseNumber} placeholder="e.g. MD-123456" />
            <AuthInput label="Hospital / clinic" value={hospital} onChange={setHospital} placeholder="e.g. City General Hospital" />
          </>
        )}
        <ErrorNote msg={error} />
        <Button type="submit" block disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
        <p className="im-auth__alt">Already have an account? <a href="#/login">Sign in</a></p>
      </form>
    </div>
  )
}
