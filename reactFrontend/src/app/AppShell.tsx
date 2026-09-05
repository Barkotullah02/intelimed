import type { ReactNode } from 'react'
import { Avatar, SectionTitle } from './ui'
import { useAuth } from './auth/AuthContext'
import {
  IconGrid, IconShield, IconDatabase, IconBell, IconStethoscope, IconSparkle, IconUser, IconShieldAdmin, IconPhone, IconLogout,
} from './navicons'

export type NavKey =
  | 'dashboard' | 'checker' | 'database' | 'reminders' | 'doctors' | 'consultations' | 'assistant' | 'profile'

const PATIENT_NAV: { key: NavKey; label: string; icon: ReactNode; route: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <IconGrid width={20} height={20} />, route: '#/app/dashboard' },
  { key: 'checker', label: 'Interaction Checker', icon: <IconShield width={20} height={20} />, route: '#/app/checker' },
  { key: 'database', label: 'Drug Database', icon: <IconDatabase width={20} height={20} />, route: '#/app/database' },
  { key: 'reminders', label: 'Reminders', icon: <IconBell width={20} height={20} />, route: '#/app/reminders' },
  { key: 'doctors', label: 'Doctors', icon: <IconStethoscope width={20} height={20} />, route: '#/app/doctors' },
  { key: 'consultations', label: 'Consultations', icon: <IconPhone width={20} height={20} />, route: '#/app/consultations' },
  { key: 'assistant', label: 'AI Assistant', icon: <IconSparkle width={20} height={20} />, route: '#/app/assistant' },
  { key: 'profile', label: 'Profile', icon: <IconUser width={20} height={20} />, route: '#/app/profile' },
]

const ADMIN_NAV = [
  { label: 'Dashboard', icon: <IconGrid width={20} height={20} />, route: '#/admin/dashboard' },
  { label: 'User Management', icon: <IconUser width={20} height={20} />, route: '#/admin/users' },
  { label: 'Doctor Verification', icon: <IconShieldAdmin width={20} height={20} />, route: '#/admin/doctors' },
  { label: 'Drug Management', icon: <IconDatabase width={20} height={20} />, route: '#/admin/drugs' },
  { label: 'Drug Interactions', icon: <IconShield width={20} height={20} />, route: '#/admin/interactions' },
]

const DOCTOR_NAV = [
  { label: 'Dashboard', icon: <IconGrid width={20} height={20} />, route: '#/doctor/dashboard' },
  { label: 'My Patients', icon: <IconUser width={20} height={20} />, route: '#/doctor/patients' },
  { label: 'Consultations', icon: <IconPhone width={20} height={20} />, route: '#/doctor/consultations' },
  { label: 'Appointments', icon: <IconBell width={20} height={20} />, route: '#/doctor/appointments' },
  { label: 'Profile', icon: <IconStethoscope width={20} height={20} />, route: '#/doctor/profile' },
]

function Logo({ tag }: { tag?: string }) {
  return (
    <div className="im-logo">
      <img className="im-logo__img" src="/logo.png" alt="IntelliMeds" width={34} height={34} />
      <span className="im-logo__name">IntelliMeds</span>
      {tag && <span className="im-tag" style={{ marginLeft: 2 }}>{tag}</span>}
    </div>
  )
}

function initialsOf(name: string | undefined, fallback: string): string {
  if (!name) return fallback
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || fallback
}

export function Shell({
  active, title, sub, actions, children, admin, activeAdmin, doctor, activeDoctor,
}: {
  active?: NavKey
  activeAdmin?: string
  activeDoctor?: string
  title: string
  sub?: string
  actions?: ReactNode
  children: ReactNode
  admin?: boolean
  doctor?: boolean
}) {
  const { user, logout } = useAuth()

  async function signOut() {
    await logout()
    location.hash = admin ? '#/admin/login' : '#/login'
  }

  const fallbackInitials = admin ? 'AD' : doctor ? 'DR' : 'SC'
  const fallbackName = admin ? 'Admin' : doctor ? 'Doctor' : 'Sarah Chen'
  const roleLabel = admin ? 'System operator' : doctor ? 'Healthcare professional' : 'Patient'
  const displayName = user?.name ?? fallbackName
  const initials = initialsOf(user?.name, fallbackInitials)
  const tag = admin ? 'Admin' : doctor ? 'Doctor' : undefined

  const nav = admin
    ? ADMIN_NAV.map((n) => (
        <a key={n.label} href={n.route} className={`im-nav${activeAdmin === n.label ? ' im-nav--active' : ''}`}>{n.icon}{n.label}</a>
      ))
    : doctor
    ? DOCTOR_NAV.map((n) => (
        <a key={n.label} href={n.route} className={`im-nav${activeDoctor === n.label ? ' im-nav--active' : ''}`}>{n.icon}{n.label}</a>
      ))
    : PATIENT_NAV.map((n) => (
        <a key={n.key} href={n.route} className={`im-nav${active === n.key ? ' im-nav--active' : ''}`}>{n.icon}{n.label}</a>
      ))

  return (
    <div className="im-shell">
      <aside className="im-sidebar">
        <Logo tag={tag} />
        {nav}
        <span className="im-nav__spacer" />
        <div className="im-nav__user">
          <Avatar initials={initials} size={38} />
          <div className="im-nav__user-meta"><b>{displayName}</b><small>{roleLabel}</small></div>
          <button className="im-nav__logout" onClick={signOut} aria-label="Sign out" title="Sign out">
            <IconLogout width={18} height={18} />
          </button>
        </div>
      </aside>
      <main className="im-main">
        <div className="im-topbar">
          <SectionTitle title={title} sub={sub} />
          <div className="im-topbar__actions">
            {actions}
            <Avatar initials={initials} />
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
