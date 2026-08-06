import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import './theme.css'
import './app.css'
import { Login, Register } from './screens/auth'
import {
  Dashboard, Checker, Result, Database, DrugDetail, Reminders, Doctors,
  Assistant, Profile, History, Appointments, Education, Notifications,
} from './screens/patient'
import { AdminDashboard, AdminUsers, AdminDrugs } from './screens/admin'
import { MobileScreens } from './screens/mobile'

type Route = { path: string; label: string; group: string; el: () => ReactNode }

const ROUTES: Route[] = [
  { path: '#/login', label: 'Login', group: 'Auth', el: () => <Login /> },
  { path: '#/register', label: 'Register', group: 'Auth', el: () => <Register /> },
  { path: '#/app/dashboard', label: 'Dashboard', group: 'Web · Patient', el: () => <Dashboard /> },
  { path: '#/app/checker', label: 'Interaction Checker', group: 'Web · Patient', el: () => <Checker /> },
  { path: '#/app/result', label: 'Interaction Result ★', group: 'Web · Patient', el: () => <Result /> },
  { path: '#/app/database', label: 'Drug Database', group: 'Web · Patient', el: () => <Database /> },
  { path: '#/app/drug', label: 'Drug Detail', group: 'Web · Patient', el: () => <DrugDetail /> },
  { path: '#/app/reminders', label: 'Reminders', group: 'Web · Patient', el: () => <Reminders /> },
  { path: '#/app/doctors', label: 'Doctors', group: 'Web · Patient', el: () => <Doctors /> },
  { path: '#/app/assistant', label: 'AI Assistant', group: 'Web · Patient', el: () => <Assistant /> },
  { path: '#/app/profile', label: 'Profile', group: 'Web · Patient', el: () => <Profile /> },
  { path: '#/app/history', label: 'Medication History', group: 'Web · Patient', el: () => <History /> },
  { path: '#/app/appointments', label: 'Appointments', group: 'Web · Patient', el: () => <Appointments /> },
  { path: '#/app/education', label: 'Education', group: 'Web · Patient', el: () => <Education /> },
  { path: '#/app/notifications', label: 'Notifications', group: 'Web · Patient', el: () => <Notifications /> },
  { path: '#/admin/dashboard', label: 'Admin Dashboard', group: 'Admin', el: () => <AdminDashboard /> },
  { path: '#/admin/users', label: 'User Management', group: 'Admin', el: () => <AdminUsers /> },
  { path: '#/admin/drugs', label: 'Drug Management', group: 'Admin', el: () => <AdminDrugs /> },
  { path: '#/mobile', label: 'Mobile app', group: 'Mobile', el: () => <MobileScreens /> },
]

export function useHash() {
  const [hash, setHash] = useState(location.hash || '#/login')
  useEffect(() => {
    const on = () => { setHash(location.hash || '#/login'); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

function Switcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false)
  const groups = [...new Set(ROUTES.map((r) => r.group))]
  return (
    <>
      <button className="im-switcher-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? '✕ Close' : '☰ Screens'}
      </button>
      {open && (
        <div className="im-switcher">
          {groups.map((g) => (
            <div key={g}>
              <b>{g}</b>
              {ROUTES.filter((r) => r.group === g).map((r) => (
                <a key={r.path} href={r.path} onClick={() => setOpen(false)} className={r.path === current ? 'on' : ''} style={{ display: 'block' }}>{r.label}</a>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default function AppRoot() {
  const hash = useHash()
  const route = ROUTES.find((r) => r.path === hash) ?? ROUTES[0]
  return (
    <div className="im-app">
      {route.el()}
      <Switcher current={route.path} />
    </div>
  )
}

export { ROUTES }
