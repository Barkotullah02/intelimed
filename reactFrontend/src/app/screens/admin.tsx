import { Shell } from '../AppShell'
import { Card, StatCard, Button, SearchField } from '../ui'
import { IconPlus } from '../icons'
import { USERS, DRUGS } from '../data'
import { useState } from 'react'

export function AdminDashboard() {
  return (
    <Shell admin activeAdmin="Dashboard" title="Admin overview" sub="Platform health at a glance">
      <div className="im-grid-4">
        <StatCard value="12,480" label="Total users" tone="brand" />
        <StatCard value="1,204" label="Active today" tone="minor" />
        <StatCard value="642" label="Drugs in database" tone="brand" />
        <StatCard value="38,910" label="Interactions checked" tone="moderate" />
      </div>
      <div className="im-cols-2">
        <Card>
          <div className="im-panel-title">Checks over time</div>
          <div className="im-mini" style={{ width: '100%', height: 120 }}>
            {[40, 55, 48, 70, 65, 82, 78, 95, 88, 100].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10 }}>Last 10 weeks · +18% vs previous period</p>
        </Card>
        <Card>
          <div className="im-panel-title">Severity distribution</div>
          <Bar label="Major" pct={18} color="var(--sev-major)" />
          <Bar label="Moderate" pct={34} color="var(--sev-moderate)" />
          <Bar label="Minor / Safe" pct={48} color="var(--sev-minor)" />
        </Card>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div className="im-panel-title" style={{ padding: '18px 18px 0' }}>Recent activity</div>
        <table className="im-table">
          <thead><tr><th>User</th><th>Action</th><th>When</th></tr></thead>
          <tbody>
            <tr><td>Sarah Chen</td><td>Checked Warfarin + Aspirin</td><td className="tnum">2m ago</td></tr>
            <tr><td>Dr. James Park</td><td>Added a patient</td><td className="tnum">18m ago</td></tr>
            <tr><td>Mark Thompson</td><td>Signed up</td><td className="tnum">1h ago</td></tr>
          </tbody>
        </table>
      </Card>
    </Shell>
  )
}
function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div style={{ margin: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span>{label}</span><span className="tnum" style={{ color: 'var(--muted)' }}>{pct}%</span></div>
      <div style={{ height: 10, borderRadius: 99, background: 'var(--surface-2)' }}><div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: color }} /></div>
    </div>
  )
}

export function AdminUsers() {
  const [q, setQ] = useState('')
  const rows = USERS.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <Shell admin activeAdmin="User Management" title="User Management" sub="Manage patients and professionals"
      actions={<Button leftIcon={<IconPlus width={18} height={18} />}>Invite user</Button>}>
      <div style={{ maxWidth: 420 }}><SearchField value={q} onChange={setQ} placeholder="Search users…" /></div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="im-table">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.email}>
                <td>{u.name}</td>
                <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                <td><span className={`im-rolepill im-rolepill--${u.role}`}>{u.role}</span></td>
                <td><span className={`im-status im-status--${u.status}`}><i />{u.status}</span></td>
                <td className="tnum">{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Shell>
  )
}

export function AdminDrugs() {
  const [q, setQ] = useState('')
  const rows = DRUGS.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <Shell admin activeAdmin="Drug Management" title="Drug Management" sub="Maintain the medication database"
      actions={<Button leftIcon={<IconPlus width={18} height={18} />}>Add drug</Button>}>
      <div style={{ maxWidth: 420 }}><SearchField value={q} onChange={setQ} placeholder="Search drugs…" /></div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="im-table">
          <thead><tr><th>Drug</th><th>Class</th><th>Interactions</th><th>Updated</th><th></th></tr></thead>
          <tbody>
            {rows.map((d, i) => (
              <tr key={d.id}>
                <td><b>{d.name}</b></td>
                <td style={{ color: 'var(--muted)' }}>{d.drugClass}</td>
                <td className="tnum">{[14, 9, 6, 11, 4, 7, 5, 8, 3, 2][i]}</td>
                <td className="tnum">Aug 2026</td>
                <td><a href="#/admin/drugs" className="im-tag">Edit</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Shell>
  )
}
