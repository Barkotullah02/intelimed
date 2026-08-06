import type { ReactNode } from 'react'
import { Avatar, SectionTitle } from './ui'
import {
  IconGrid, IconShield, IconDatabase, IconBell, IconStethoscope, IconSparkle, IconUser, IconShieldAdmin,
} from './navicons'

export type NavKey =
  | 'dashboard' | 'checker' | 'database' | 'reminders' | 'doctors' | 'assistant' | 'profile'

const PATIENT_NAV: { key: NavKey; label: string; icon: ReactNode; route: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <IconGrid width={20} height={20} />, route: '#/app/dashboard' },
  { key: 'checker', label: 'Interaction Checker', icon: <IconShield width={20} height={20} />, route: '#/app/checker' },
  { key: 'database', label: 'Drug Database', icon: <IconDatabase width={20} height={20} />, route: '#/app/database' },
  { key: 'reminders', label: 'Reminders', icon: <IconBell width={20} height={20} />, route: '#/app/reminders' },
  { key: 'doctors', label: 'Doctors', icon: <IconStethoscope width={20} height={20} />, route: '#/app/doctors' },
  { key: 'assistant', label: 'AI Assistant', icon: <IconSparkle width={20} height={20} />, route: '#/app/assistant' },
  { key: 'profile', label: 'Profile', icon: <IconUser width={20} height={20} />, route: '#/app/profile' },
]

const ADMIN_NAV = [
  { label: 'Dashboard', icon: <IconGrid width={20} height={20} />, route: '#/admin/dashboard' },
  { label: 'User Management', icon: <IconUser width={20} height={20} />, route: '#/admin/users' },
  { label: 'Drug Management', icon: <IconDatabase width={20} height={20} />, route: '#/admin/drugs' },
]

function Logo({ admin }: { admin?: boolean }) {
  return (
    <div className="im-logo">
      <span className="im-logo__mark">{admin ? <IconShieldAdmin width={19} height={19} /> : <IconShield width={19} height={19} />}</span>
      <span className="im-logo__name">IntelliMeds</span>
      {admin && <span className="im-tag" style={{ marginLeft: 2 }}>Admin</span>}
    </div>
  )
}

export function Shell({
  active, title, sub, actions, children, admin, activeAdmin,
}: {
  active?: NavKey
  activeAdmin?: string
  title: string
  sub?: string
  actions?: ReactNode
  children: ReactNode
  admin?: boolean
}) {
  return (
    <div className="im-shell">
      <aside className="im-sidebar">
        <Logo admin={admin} />
        {admin
          ? ADMIN_NAV.map((n) => (
              <a key={n.label} href={n.route} className={`im-nav${activeAdmin === n.label ? ' im-nav--active' : ''}`}>{n.icon}{n.label}</a>
            ))
          : PATIENT_NAV.map((n) => (
              <a key={n.key} href={n.route} className={`im-nav${active === n.key ? ' im-nav--active' : ''}`}>{n.icon}{n.label}</a>
            ))}
        <span className="im-nav__spacer" />
        <div className="im-nav__user">
          <Avatar initials={admin ? 'AD' : 'SC'} size={38} />
          <div><b>{admin ? 'Admin' : 'Sarah Chen'}</b><small>{admin ? 'System operator' : 'Patient'}</small></div>
        </div>
      </aside>
      <main className="im-main">
        <div className="im-topbar">
          <SectionTitle title={title} sub={sub} />
          <div className="im-topbar__actions">
            {actions}
            <Avatar initials={admin ? 'AD' : 'SC'} />
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
