import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import './theme.css'
import './app.css'
import { AuthProvider } from './auth/AuthContext'
import { RequireRole } from './auth/RequireRole'
import { Login, Register, AdminLogin } from './screens/auth'
import {
  Dashboard, Checker, Result, Database, DrugDetail, Reminders, Doctors,
  Assistant, Profile, History, Appointments, Education, Notifications,
} from './screens/patient'
import { AdminDashboard, AdminUsers, AdminDrugs, AdminInteractions, AdminDoctors } from './screens/admin'
import { DoctorDashboard, DoctorPatients, DoctorAppointments, DoctorProfile } from './screens/doctor'
import { CallScreen, Consultations } from './screens/call'
import { MobileScreens } from './screens/mobile'

const ADMIN = ['ROLE_ADMIN']
const DOCTOR = ['ROLE_HEALTHCARE_PROFESSIONAL']
const requireAdmin = (el: ReactNode) => <RequireRole allow={ADMIN} loginHash="#/admin/login">{el}</RequireRole>
const requireDoctor = (el: ReactNode) => <RequireRole allow={DOCTOR} loginHash="#/login">{el}</RequireRole>

type Route = { path: string; label: string; group: string; el: () => ReactNode }

const ROUTES: Route[] = [
  { path: '#/login', label: 'Login', group: 'Auth', el: () => <Login /> },
  { path: '#/register', label: 'Register', group: 'Auth', el: () => <Register /> },
  { path: '#/admin/login', label: 'Admin Login', group: 'Auth', el: () => <AdminLogin /> },
  { path: '#/app/dashboard', label: 'Dashboard', group: 'Web · Patient', el: () => <Dashboard /> },
  { path: '#/app/checker', label: 'Interaction Checker', group: 'Web · Patient', el: () => <Checker /> },
  { path: '#/app/result', label: 'Interaction Result ★', group: 'Web · Patient', el: () => <Result /> },
  { path: '#/app/database', label: 'Drug Database', group: 'Web · Patient', el: () => <Database /> },
  { path: '#/app/drug', label: 'Drug Detail', group: 'Web · Patient', el: () => <DrugDetail /> },
  { path: '#/app/reminders', label: 'Reminders', group: 'Web · Patient', el: () => <Reminders /> },
  { path: '#/app/doctors', label: 'Doctors', group: 'Web · Patient', el: () => <Doctors /> },
  { path: '#/app/consultations', label: 'Consultations', group: 'Web · Patient', el: () => <Consultations /> },
  { path: '#/app/assistant', label: 'AI Assistant', group: 'Web · Patient', el: () => <Assistant /> },
  { path: '#/app/profile', label: 'Profile', group: 'Web · Patient', el: () => <Profile /> },
  { path: '#/app/history', label: 'Medication History', group: 'Web · Patient', el: () => <History /> },
  { path: '#/app/appointments', label: 'Appointments', group: 'Web · Patient', el: () => <Appointments /> },
  { path: '#/app/education', label: 'Education', group: 'Web · Patient', el: () => <Education /> },
  { path: '#/app/notifications', label: 'Notifications', group: 'Web · Patient', el: () => <Notifications /> },
  { path: '#/doctor/dashboard', label: 'Doctor Dashboard', group: 'Doctor', el: () => requireDoctor(<DoctorDashboard />) },
  { path: '#/doctor/patients', label: 'My Patients', group: 'Doctor', el: () => requireDoctor(<DoctorPatients />) },
  { path: '#/doctor/appointments', label: 'Appointments', group: 'Doctor', el: () => requireDoctor(<DoctorAppointments />) },
  { path: '#/doctor/consultations', label: 'Consultations', group: 'Doctor', el: () => requireDoctor(<Consultations doctor />) },
  { path: '#/doctor/profile', label: 'Doctor Profile', group: 'Doctor', el: () => requireDoctor(<DoctorProfile />) },
  { path: '#/call', label: 'Call room', group: 'Doctor', el: () => <CallScreen /> },
  { path: '#/admin/dashboard', label: 'Admin Dashboard', group: 'Admin', el: () => requireAdmin(<AdminDashboard />) },
  { path: '#/admin/users', label: 'User Management', group: 'Admin', el: () => requireAdmin(<AdminUsers />) },
  { path: '#/admin/doctors', label: 'Doctor Verification', group: 'Admin', el: () => requireAdmin(<AdminDoctors />) },
  { path: '#/admin/drugs', label: 'Drug Management', group: 'Admin', el: () => requireAdmin(<AdminDrugs />) },
  { path: '#/admin/interactions', label: 'Drug Interactions', group: 'Admin', el: () => requireAdmin(<AdminInteractions />) },
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
  const pathOnly = hash.split('?')[0]
  const route = ROUTES.find((r) => r.path === pathOnly) ?? ROUTES[0]
  return (
    <AuthProvider>
      <div className="im-app">
        {route.el()}
        <Switcher current={route.path} />
      </div>
    </AuthProvider>
  )
}

export { ROUTES }
