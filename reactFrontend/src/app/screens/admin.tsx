import { Shell } from '../AppShell'
import { Card, StatCard, Button, SearchField, SeverityBadge } from '../ui'
import { IconPlus } from '../icons'
import { type Severity } from '../data'
import { useEffect, useState } from 'react'
import { adminApi } from '../../api/services'
import type { AdminInteraction, DoctorResponse, VerificationStatus, AdminDashboard as AdminDashboardData, AdminUser, DrugResponse } from '../../api/types'

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
const roleShort = (r: string) => r.replace('ROLE_', '').replace('HEALTHCARE_PROFESSIONAL', 'DOCTOR').toLowerCase()

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardData | null>(null)
  const [recent, setRecent] = useState<AdminUser[]>([])
  const [pending, setPending] = useState<number | null>(null)

  useEffect(() => {
    adminApi.dashboard().then(setStats).catch(() => setStats(null))
    adminApi.listUsers()
      .then((u) => setRecent([...u].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 6)))
      .catch(() => setRecent([]))
    adminApi.listDoctors('PENDING').then((d) => setPending(d.length)).catch(() => setPending(null))
  }, [])

  const n = (v?: number) => (v == null ? '—' : v.toLocaleString())

  return (
    <Shell admin activeAdmin="Dashboard" title="Admin overview" sub="Platform health at a glance">
      <div className="im-grid-4">
        <StatCard value={n(stats?.totalUsers)} label="Total users" tone="brand" />
        <StatCard value={n(stats?.activeUsers)} label="Active users" tone="minor" />
        <StatCard value={n(stats?.totalDrugs)} label="Drugs in database" tone="brand" />
        <StatCard value={n(stats?.totalInteractions)} label="Interaction pairs" tone="moderate" />
      </div>
      <div className="im-grid-4">
        <StatCard value={n(stats?.totalAppointments)} label="Appointments" tone="brand" />
        <StatCard value={n(stats?.totalAiRequests)} label="AI requests" tone="minor" />
        <StatCard value={pending == null ? '—' : String(pending)} label="Pending verifications" tone="moderate" />
        <StatCard value={n(stats ? stats.totalUsers - stats.activeUsers : undefined)} label="Inactive users" tone="major" />
      </div>

      {pending != null && pending > 0 && (
        <div className="im-cta">
          <div className="im-cta__text">
            <h2>{pending} doctor {pending === 1 ? 'application' : 'applications'} awaiting review</h2>
            <p>Approve or reject professional credentials to make them available to patients.</p>
          </div>
          <a href="#/admin/doctors"><Button variant="soft">Review now</Button></a>
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div className="im-panel-title" style={{ padding: '18px 18px 0' }}>Recent sign-ups</div>
        <table className="im-table">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            {recent.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                <td><span className={`im-rolepill im-rolepill--${roleShort(u.role)}`}>{roleShort(u.role)}</span></td>
                <td className="tnum">{fmtDate(u.createdAt)}</td>
              </tr>
            ))}
            {recent.length === 0 && <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>No users yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  )
}

export function AdminUsers() {
  const [q, setQ] = useState('')
  const [users, setUsers] = useState<AdminUser[] | null>(null)

  function load() { adminApi.listUsers().then(setUsers).catch(() => setUsers([])) }
  useEffect(() => { load() }, [])

  async function toggleStatus(u: AdminUser) {
    try { const updated = await adminApi.setUserStatus(u.id, !u.isActive); setUsers((list) => (list ?? []).map((x) => (x.id === u.id ? updated : x))) } catch { /* ignore */ }
  }
  async function remove(u: AdminUser) {
    if (!confirm(`Delete ${u.name} (${u.email})? This cannot be undone.`)) return
    try { await adminApi.deleteUser(u.id); setUsers((list) => (list ?? []).filter((x) => x.id !== u.id)) } catch { /* ignore */ }
  }

  const rows = (users ?? []).filter((u) =>
    u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))

  return (
    <Shell admin activeAdmin="User Management" title="User Management" sub="Manage patients and professionals"
      actions={<span className="im-tag">{users ? `${users.length} users` : 'Loading…'}</span>}>
      <div style={{ maxWidth: 420 }}><SearchField value={q} onChange={setQ} placeholder="Search users…" /></div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="im-table">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                <td><span className={`im-rolepill im-rolepill--${roleShort(u.role)}`}>{roleShort(u.role)}</span></td>
                <td><span className={`im-status im-status--${u.isActive ? 'active' : 'inactive'}`}><i />{u.isActive ? 'active' : 'inactive'}</span></td>
                <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => toggleStatus(u)} className="im-tag" style={{ border: 0, cursor: 'pointer' }}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => remove(u)} className="im-tag" style={{ border: 0, cursor: 'pointer', background: 'var(--sev-major-bg)', color: '#c92a2f' }}>Delete</button>
                </td>
              </tr>
            ))}
            {users && rows.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--muted)' }}>No users match.</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  )
}

/* ============================ Admin · Drug Interactions (live) ============================ */
const toLevel = (s: string): Severity => {
  const v = s.toLowerCase()
  return (v === 'major' || v === 'moderate' || v === 'minor' || v === 'unknown') ? v : 'unknown'
}
export function AdminInteractions() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<AdminInteraction[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [source, setSource] = useState<'live' | 'error' | 'loading'>('loading')
  const size = 20

  useEffect(() => {
    let alive = true
    setSource('loading')
    adminApi.listInteractions(q, page, size)
      .then((res) => {
        if (!alive) return
        setRows(res.content); setTotal(res.totalElements); setTotalPages(res.totalPages); setSource('live')
      })
      .catch(() => { if (alive) { setRows([]); setTotal(0); setTotalPages(1); setSource('error') } })
    return () => { alive = false }
  }, [q, page])

  async function remove(id: string) {
    if (source !== 'live') return
    try { await adminApi.deleteInteraction(id); setRows((r) => r.filter((x) => x.id !== id)) } catch { /* keep row */ }
  }

  return (
    <Shell admin activeAdmin="Drug Interactions" title="Drug Interactions" sub="Add, edit and remove interaction pairs"
      actions={<span className="im-tag" style={{ background: source === 'live' ? 'var(--sev-minor-bg)' : 'var(--surface-2)', color: source === 'live' ? '#0a8a63' : 'var(--muted)' }}>
        {source === 'live' ? `● Live · ${total.toLocaleString()} pairs` : source === 'loading' ? 'Loading…' : '○ Unavailable'}
      </span>}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ maxWidth: 420, flex: 1 }}>
          <SearchField value={q} onChange={(v) => { setPage(0); setQ(v) }} placeholder="Search by drug name…" />
        </div>
        <Button leftIcon={<IconPlus width={18} height={18} />}>New interaction</Button>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="im-table">
          <thead><tr><th>Drug A</th><th>Drug B</th><th>Severity</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><b>{r.drugAName}</b></td>
                <td>{r.drugBName}</td>
                <td><SeverityBadge level={toLevel(r.severity)} /></td>
                <td><button onClick={() => remove(r.id)} className="im-tag" style={{ border: 0, cursor: 'pointer', background: 'var(--sev-major-bg)', color: '#c92a2f' }}>Delete</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>No interactions found.</td></tr>}
          </tbody>
        </table>
      </Card>
      {source === 'live' && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end', fontSize: 13, color: 'var(--muted)' }}>
          <span>Page {page + 1} of {totalPages}</span>
          <Button variant="ghost" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
          <Button variant="ghost" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </Shell>
  )
}

export function AdminDrugs() {
  const [q, setQ] = useState('')
  const [drugs, setDrugs] = useState<DrugResponse[] | null>(null)

  useEffect(() => { adminApi.listDrugs().then(setDrugs).catch(() => setDrugs([])) }, [])

  const filtered = (drugs ?? []).filter((d) => {
    const s = q.toLowerCase()
    return d.genericName.toLowerCase().includes(s) || (d.brandName || '').toLowerCase().includes(s)
  })
  const rows = filtered.slice(0, 100) // keep the table light; narrow with search

  async function remove(d: DrugResponse) {
    if (!confirm(`Delete ${d.brandName || d.genericName}? This cannot be undone.`)) return
    try { await adminApi.deleteDrug(d.id); setDrugs((list) => (list ?? []).filter((x) => x.id !== d.id)) } catch { /* ignore */ }
  }

  return (
    <Shell admin activeAdmin="Drug Management" title="Drug Management" sub="Maintain the medication database"
      actions={<span className="im-tag">{drugs ? `${drugs.length.toLocaleString()} drugs` : 'Loading…'}</span>}>
      <div style={{ maxWidth: 420 }}><SearchField value={q} onChange={setQ} placeholder="Search drugs…" /></div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="im-table">
          <thead><tr><th>Generic name</th><th>Brand</th><th>Form</th><th></th></tr></thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td><b>{d.genericName}</b></td>
                <td style={{ color: 'var(--muted)' }}>{d.brandName || '—'}</td>
                <td style={{ color: 'var(--muted)' }}>{d.dosageForm || d.categoryName || '—'}</td>
                <td style={{ textAlign: 'right' }}><button onClick={() => remove(d)} className="im-tag" style={{ border: 0, cursor: 'pointer', background: 'var(--sev-major-bg)', color: '#c92a2f' }}>Delete</button></td>
              </tr>
            ))}
            {drugs && filtered.length === 0 && <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>No drugs match.</td></tr>}
          </tbody>
        </table>
      </Card>
      {filtered.length > 100 && (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Showing first 100 of {filtered.length.toLocaleString()} — narrow with search.</p>
      )}
    </Shell>
  )
}

/* ============================ Admin · Doctor Verification (live) ============================ */
const DOC_FILTERS: { key: VerificationStatus | 'ALL'; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'ALL', label: 'All' },
]

export function AdminDoctors() {
  const [filter, setFilter] = useState<VerificationStatus | 'ALL'>('PENDING')
  const [rows, setRows] = useState<DoctorResponse[]>([])
  const [state, setState] = useState<'live' | 'loading' | 'error'>('loading')

  function load() {
    setState('loading')
    adminApi.listDoctors(filter === 'ALL' ? undefined : filter)
      .then((docs) => { setRows(docs); setState('live') })
      .catch(() => setState('error'))
  }
  useEffect(load, [filter])

  async function decide(id: string, status: 'APPROVED' | 'REJECTED') {
    let reason: string | undefined
    if (status === 'REJECTED') {
      reason = window.prompt('Reason for rejection (optional):') ?? undefined
    }
    try {
      await adminApi.decideDoctor(id, status, reason)
      setRows((r) => r.filter((d) => d.id !== id || filter === 'ALL'))
      if (filter === 'ALL') load()
    } catch { /* keep row on failure */ }
  }

  const statusTone = (s: VerificationStatus) =>
    s === 'APPROVED' ? 'var(--sev-minor-bg)' : s === 'REJECTED' ? 'var(--sev-major-bg)' : 'var(--sev-moderate-bg)'
  const statusColor = (s: VerificationStatus) =>
    s === 'APPROVED' ? '#0a8a63' : s === 'REJECTED' ? '#c92a2f' : '#a86412'

  return (
    <Shell admin activeAdmin="Doctor Verification" title="Doctor Verification"
      sub="Review medical credentials and approve professional accounts">
      <div style={{ display: 'flex', gap: 8 }}>
        {DOC_FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="im-tag" style={{
              border: 0, cursor: 'pointer',
              background: filter === f.key ? 'var(--brand)' : 'var(--surface-2)',
              color: filter === f.key ? '#fff' : 'var(--muted)',
            }}>{f.label}</button>
        ))}
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="im-table">
          <thead><tr><th>Doctor</th><th>Specialization</th><th>License</th><th>Hospital</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td><b>{d.fullName}</b></td>
                <td style={{ color: 'var(--muted)' }}>{d.specialization}</td>
                <td className="tnum">{d.licenseNumber}</td>
                <td style={{ color: 'var(--muted)' }}>{d.hospital || '—'}</td>
                <td><span className="im-tag" style={{ background: statusTone(d.verificationStatus), color: statusColor(d.verificationStatus) }}>{d.verificationStatus}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {d.verificationStatus !== 'APPROVED' && (
                    <button onClick={() => decide(d.id, 'APPROVED')} className="im-tag" style={{ border: 0, cursor: 'pointer', background: 'var(--sev-minor-bg)', color: '#0a8a63' }}>Approve</button>
                  )}
                  {d.verificationStatus !== 'REJECTED' && (
                    <button onClick={() => decide(d.id, 'REJECTED')} className="im-tag" style={{ border: 0, cursor: 'pointer', background: 'var(--sev-major-bg)', color: '#c92a2f' }}>Reject</button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && state === 'live' && (
              <tr><td colSpan={6} style={{ color: 'var(--muted)' }}>No {filter === 'ALL' ? '' : filter.toLowerCase()} applications.</td></tr>
            )}
            {state === 'loading' && <tr><td colSpan={6} style={{ color: 'var(--muted)' }}>Loading…</td></tr>}
            {state === 'error' && <tr><td colSpan={6} style={{ color: 'var(--muted)' }}>Could not reach the server.</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  )
}
