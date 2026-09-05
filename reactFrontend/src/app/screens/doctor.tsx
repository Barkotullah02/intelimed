import { useEffect, useState } from 'react'
import { Shell } from '../AppShell'
import { Card, StatCard, Button, Avatar } from '../ui'
import { doctorApi, consultationApi, appointmentApi } from '../../api/services'
import type { DoctorResponse, ConsultationResponse, AppointmentResponse } from '../../api/types'

function initials(name: string): string {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || '—'
}
function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function isToday(iso: string): boolean {
  const d = new Date(iso); const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

/** The doctor's distinct patients, derived from their consultations + appointments. */
function derivePatients(cons: ConsultationResponse[], appts: AppointmentResponse[]) {
  const map = new Map<string, { id: string; name: string; last: string }>()
  for (const c of cons) {
    const prev = map.get(c.patientId)
    if (!prev || c.createdAt > prev.last) map.set(c.patientId, { id: c.patientId, name: c.patientName, last: c.createdAt })
  }
  for (const a of appts) {
    const prev = map.get(a.patientId)
    if (!prev || a.appointmentDate > prev.last) map.set(a.patientId, { id: a.patientId, name: a.patientName, last: a.appointmentDate })
  }
  return [...map.values()].sort((x, y) => (y.last || '').localeCompare(x.last || ''))
}

/* ============================ Doctor · Dashboard ============================ */

function VerificationBanner({ doc }: { doc: DoctorResponse }) {
  if (doc.verificationStatus === 'APPROVED') {
    return (
      <Card style={{ borderLeft: '4px solid var(--sev-minor)' }}>
        <div className="im-panel-title" style={{ color: 'var(--sev-minor)' }}>✓ Verified professional</div>
        <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
          Your credentials have been approved. All clinical tools are unlocked and your profile is listed in the doctor directory.
        </p>
      </Card>
    )
  }
  if (doc.verificationStatus === 'REJECTED') {
    return (
      <Card style={{ borderLeft: '4px solid var(--sev-major)' }}>
        <div className="im-panel-title" style={{ color: 'var(--sev-major)' }}>Verification not approved</div>
        <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
          {doc.rejectionReason
            ? <>Reason: {doc.rejectionReason}</>
            : 'Your application was not approved. Please review your credentials and re-apply.'}
        </p>
      </Card>
    )
  }
  return (
    <Card style={{ borderLeft: '4px solid var(--sev-moderate)' }}>
      <div className="im-panel-title" style={{ color: 'var(--sev-moderate)' }}>Verification pending</div>
      <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
        Thanks for registering. Our team is reviewing your medical credentials — clinical features and directory
        listing unlock as soon as an administrator approves your account.
      </p>
    </Card>
  )
}

export function DoctorDashboard() {
  const [doc, setDoc] = useState<DoctorResponse | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [cons, setCons] = useState<ConsultationResponse[]>([])
  const [appts, setAppts] = useState<AppointmentResponse[]>([])

  useEffect(() => {
    let alive = true
    doctorApi.myApplication()
      .then((d) => {
        if (!alive) return
        setDoc(d); setState('ok')
        if (d.verificationStatus === 'APPROVED') {
          consultationApi.mine().then((c) => alive && setCons(c)).catch(() => {})
          appointmentApi.forDoctor().then((a) => alive && setAppts(a)).catch(() => {})
        }
      })
      .catch(() => { if (alive) setState('error') })
    return () => { alive = false }
  }, [])

  const approved = doc?.verificationStatus === 'APPROVED'
  const patients = derivePatients(cons, appts)
  const apptsToday = appts.filter((a) => isToday(a.appointmentDate)).length

  return (
    <Shell doctor activeDoctor="Dashboard" title={doc ? `Welcome, Dr. ${doc.fullName}` : 'Doctor dashboard'}
      sub="Your clinical workspace">
      {state === 'loading' && <Card><p style={{ color: 'var(--muted)', margin: 0 }}>Loading your workspace…</p></Card>}

      {state === 'error' && (
        <Card style={{ borderLeft: '4px solid var(--sev-moderate)' }}>
          <div className="im-panel-title">No professional profile found</div>
          <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
            We couldn’t load a doctor application for this account. If you registered as a patient, use the patient app instead.
          </p>
        </Card>
      )}

      {state === 'ok' && doc && (
        <>
          <VerificationBanner doc={doc} />

          <div className="im-grid-4">
            <StatCard value={approved ? String(patients.length) : '—'} label="Patients" tone="brand" />
            <StatCard value={approved ? String(apptsToday) : '—'} label="Appointments today" tone="minor" />
            <StatCard value={approved ? String(cons.length) : '—'} label="Consultations" tone="moderate" />
            <StatCard value={doc.experienceYears ? String(doc.experienceYears) : '—'} label="Years of experience" tone="brand" />
          </div>

          <div className="im-cols-2">
            <Card>
              <div className="im-panel-title">Your credentials</div>
              <dl className="im-kv" style={{ margin: 0 }}>
                <Row k="Specialization" v={doc.specialization} />
                <Row k="License number" v={doc.licenseNumber} />
                <Row k="Hospital / clinic" v={doc.hospital || '—'} />
                <Row k="Status" v={doc.verificationStatus} />
              </dl>
            </Card>
            <Card>
              <div className="im-panel-title">Quick actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                <Button variant="soft" block disabled={!approved} onClick={() => (location.hash = '#/doctor/patients')}>Review my patients</Button>
                <Button variant="soft" block disabled={!approved} onClick={() => (location.hash = '#/app/checker')}>Open interaction checker</Button>
                <Button variant="ghost" block onClick={() => (location.hash = '#/doctor/profile')}>Edit profile</Button>
              </div>
              {!approved && (
                <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 12 }}>
                  Clinical actions unlock after verification.
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </Shell>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ color: 'var(--muted)', fontSize: 13.5 }}>{k}</span>
      <b style={{ fontSize: 13.5 }}>{v}</b>
    </div>
  )
}

/* ============================ Doctor · secondary screens ============================ */

export function DoctorPatients() {
  const [cons, setCons] = useState<ConsultationResponse[]>([])
  const [appts, setAppts] = useState<AppointmentResponse[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([consultationApi.mine().catch(() => []), appointmentApi.forDoctor().catch(() => [])])
      .then(([c, a]) => { if (alive) { setCons(c); setAppts(a); setLoaded(true) } })
    return () => { alive = false }
  }, [])

  const patients = derivePatients(cons, appts)

  return (
    <Shell doctor activeDoctor="My Patients" title="My Patients" sub="Patients you've consulted or have appointments with">
      {!loaded && <Card><p style={{ color: 'var(--muted)', margin: 0 }}>Loading…</p></Card>}
      {loaded && patients.length === 0 && (
        <Card><p style={{ color: 'var(--muted)', margin: 0 }}>No patients yet — they appear here after a consultation or appointment.</p></Card>
      )}
      {patients.length > 0 && (
        <div className="im-cols-2">
          {patients.map((p) => (
            <Card key={p.id} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar initials={initials(p.name)} size={46} />
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 15 }}>{p.name}</b>
                <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>Last contact {fmtDateTime(p.last)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  )
}

export function DoctorAppointments() {
  const [appts, setAppts] = useState<AppointmentResponse[] | null>(null)

  useEffect(() => {
    let alive = true
    appointmentApi.forDoctor().then((a) => alive && setAppts(a)).catch(() => alive && setAppts([]))
    return () => { alive = false }
  }, [])

  return (
    <Shell doctor activeDoctor="Appointments" title="Appointments" sub="Your scheduled consultations">
      {!appts && <Card><p style={{ color: 'var(--muted)', margin: 0 }}>Loading…</p></Card>}
      {appts && appts.length === 0 && (
        <Card><p style={{ color: 'var(--muted)', margin: 0 }}>No appointments scheduled.</p></Card>
      )}
      {appts && appts.length > 0 && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table className="im-table">
            <thead><tr><th>Patient</th><th>When</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.patientName}</b></td>
                  <td className="tnum">{fmtDateTime(a.appointmentDate)}</td>
                  <td style={{ color: 'var(--muted)' }}>{a.reason || '—'}</td>
                  <td><span className="im-tag">{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Shell>
  )
}

export function DoctorProfile() {
  const [doc, setDoc] = useState<DoctorResponse | null>(null)
  useEffect(() => { doctorApi.myApplication().then(setDoc).catch(() => setDoc(null)) }, [])
  return (
    <Shell doctor activeDoctor="Profile" title="Profile" sub="Your professional details">
      <Card>
        {doc ? (
          <dl className="im-kv" style={{ margin: 0 }}>
            <Row k="Name" v={doc.fullName} />
            <Row k="Specialization" v={doc.specialization} />
            <Row k="License number" v={doc.licenseNumber} />
            <Row k="Hospital / clinic" v={doc.hospital || '—'} />
            <Row k="Verification" v={doc.verificationStatus} />
          </dl>
        ) : (
          <p style={{ color: 'var(--muted)', margin: 0 }}>No professional profile found for this account.</p>
        )}
      </Card>
    </Shell>
  )
}
