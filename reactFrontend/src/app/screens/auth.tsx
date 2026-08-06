import { useState } from 'react'
import { Button, Field } from '../ui'
import { IconShield, IconUser, IconStethoscope } from '../icons'

function BrandPanel() {
  return (
    <div className="im-auth__brand">
      <div className="im-logo">
        <span className="im-logo__mark"><IconShield width={20} height={20} /></span>
        <span className="im-logo__name" style={{ color: '#fff' }}>IntelliMeds</span>
      </div>
      <h2>Know before you dose.</h2>
      <p>Instantly check drug–drug interactions with clinical-grade severity ratings and an AI care plan.</p>
    </div>
  )
}

export function Login() {
  return (
    <div className="im-auth">
      <BrandPanel />
      <div className="im-auth__form">
        <form className="im-auth__card" onSubmit={(e) => { e.preventDefault(); location.hash = '#/app/dashboard' }}>
          <span className="eyebrow">Welcome back</span>
          <h1>Sign in to your account</h1>
          <Field label="Email address" value="sarah.chen@email.com" />
          <Field label="Password" placeholder="••••••••••" type="password" />
          <Button type="submit" block>Sign in</Button>
          <p className="im-auth__alt">New here? <a href="#/register">Create an account</a></p>
        </form>
      </div>
    </div>
  )
}

export function Register() {
  const [role, setRole] = useState<'patient' | 'pro'>('patient')
  return (
    <div className="im-auth" style={{ background: 'var(--bg-canvas)', display: 'grid', placeItems: 'center' }}>
      <form
        className="im-card"
        style={{ width: 'min(560px, 92vw)', padding: 44, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-md)' }}
        onSubmit={(e) => { e.preventDefault(); location.hash = '#/app/dashboard' }}
      >
        <span className="eyebrow">Create account</span>
        <h1 style={{ fontSize: 30 }}>Join IntelliMeds</h1>
        <span className="im-field__label">I am a…</span>
        <div className="im-roles">
          <button type="button" className={`im-role${role === 'patient' ? ' im-role--active' : ''}`} onClick={() => setRole('patient')}>
            <span className="im-role__ic"><IconUser width={18} height={18} /></span>
            <b>Patient</b><small>Track meds &amp; check interactions</small>
          </button>
          <button type="button" className={`im-role${role === 'pro' ? ' im-role--active' : ''}`} onClick={() => setRole('pro')}>
            <span className="im-role__ic"><IconStethoscope width={18} height={18} /></span>
            <b>Professional</b><small>Clinical tools &amp; patient lookup</small>
          </button>
        </div>
        <Field label="Full name" placeholder="Sarah Chen" />
        <Field label="Email address" placeholder="sarah.chen@email.com" />
        <Field label="Password" placeholder="Create a strong password" type="password" />
        <Button type="submit" block>Create account</Button>
        <p className="im-auth__alt">Already have an account? <a href="#/login">Sign in</a></p>
      </form>
    </div>
  )
}
