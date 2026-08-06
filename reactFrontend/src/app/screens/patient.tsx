import { useMemo, useState } from 'react'
import { Shell } from '../AppShell'
import { Button, Card, StatCard, SeverityBadge, SearchField, Avatar } from '../ui'
import {
  IconPill, IconCheck, IconClose, IconPlus, IconChevron, IconAlert, IconShield,
  IconArrowLeft, IconPhone, IconMessage, IconSend, IconBell, IconCalendar, IconLogout,
} from '../icons'
import {
  DRUGS, REMINDERS, DOCTORS, ARTICLES, findInteraction, SEVERITY_LABEL,
  type Interaction, type Severity,
} from '../data'

/* ---------- tiny shared selection store for the checker → result flow ---------- */
function saveSelection(ids: string[]) { sessionStorage.setItem('im-check', JSON.stringify(ids)) }
function loadSelection(): string[] {
  try { return JSON.parse(sessionStorage.getItem('im-check') || '[]') } catch { return [] }
}

/* ============================ Dashboard ============================ */
export function Dashboard() {
  return (
    <Shell active="dashboard" title="Good morning, Sarah" sub="Here’s your medication overview for today">
      <div className="im-grid-4">
        <StatCard value="8" label="Active medications" tone="brand" />
        <StatCard value="2" label="Interactions flagged" tone="moderate" />
        <StatCard value="3" label="Reminders today" tone="brand" />
        <StatCard value="1" label="Upcoming appointment" tone="minor" />
      </div>

      <div className="im-cta">
        <div className="im-cta__text">
          <h2>Check a new interaction</h2>
          <p>Add two or more medications to get an instant severity rating and AI care plan.</p>
        </div>
        <a href="#/app/checker"><Button variant="soft">Open checker</Button></a>
      </div>

      <div className="im-cols-2">
        <Card>
          <div className="im-panel-title">Recent checks</div>
          <CheckRow drugs="Warfarin + Aspirin" level="major" />
          <CheckRow drugs="Lisinopril + Ibuprofen" level="moderate" />
          <CheckRow drugs="Metformin + Vitamin D" level="minor" />
        </Card>
        <Card>
          <div className="im-panel-title">Today’s reminders</div>
          {REMINDERS.slice(0, 3).map((r) => (
            <div className="im-listrow" key={r.name}>
              <span className="im-pillicon"><IconPill width={18} height={18} /></span>
              <span className="im-listrow__grow"><b>{r.name}</b><small>{r.time}{r.note ? ` · ${r.note}` : ''}</small></span>
              <span className={`im-check${r.taken ? ' im-check--on' : ''}`}>{r.taken && <IconCheck width={13} height={13} />}</span>
            </div>
          ))}
        </Card>
      </div>
    </Shell>
  )
}
function CheckRow({ drugs, level }: { drugs: string; level: Severity }) {
  return (
    <div className="im-listrow">
      <span className="im-listrow__grow"><b>{drugs}</b><small>Checked today</small></span>
      <SeverityBadge level={level} />
    </div>
  )
}

/* ============================ Interaction Checker ============================ */
export function Checker() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>(loadSelection())
  const results = useMemo(
    () => DRUGS.filter((d) => !selected.includes(d.id) && d.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5),
    [query, selected],
  )
  function add(id: string) { setSelected((s) => [...s, id]); setQuery('') }
  function remove(id: string) { setSelected((s) => s.filter((x) => x !== id)) }
  function run() { saveSelection(selected); location.hash = '#/app/result' }

  return (
    <Shell active="checker" title="Interaction Checker" sub="Add medications to check for interactions">
      <div className="im-cols-2">
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SearchField value={query} onChange={setQuery} />
          {query && (
            <div className="im-suggest">
              {results.map((d) => (
                <button key={d.id} onClick={() => add(d.id)}>
                  <span>{d.name}</span><small>{d.drugClass}</small>
                </button>
              ))}
              {results.length === 0 && <button disabled>No matches</button>}
            </div>
          )}
          <div className="im-chips">
            {selected.map((id) => {
              const d = DRUGS.find((x) => x.id === id)!
              return <span className="im-chip" key={id}>{d.name}<button onClick={() => remove(id)} aria-label={`Remove ${d.name}`}><IconClose width={14} height={14} /></button></span>
            })}
            {selected.length === 0 && <span style={{ color: 'var(--muted)', fontSize: 14 }}>No medications added yet.</span>}
          </div>
          <Button block disabled={selected.length < 2} onClick={run} leftIcon={<IconShield width={18} height={18} />}>
            {selected.length < 2 ? 'Add at least 2 medications' : 'Check interactions'}
          </Button>
        </Card>

        <Card>
          <div className="im-panel-title">How it works</div>
          <ol className="im-howto">
            <li>Search and add the medications you take.</li>
            <li>We cross-check every pair against our interaction database.</li>
            <li>You get a severity rating and a plain-language AI care plan.</li>
          </ol>
        </Card>
      </div>
    </Shell>
  )
}

/* ============================ Interaction Result (HERO) ============================ */
const worstOrder: Severity[] = ['major', 'moderate', 'minor', 'unknown']
export function Result() {
  const selected = loadSelection()
  const pairs: Interaction[] = []
  for (let i = 0; i < selected.length; i++)
    for (let j = i + 1; j < selected.length; j++) {
      const it = findInteraction(selected[i], selected[j])
      if (it) pairs.push(it)
    }
  const primary = pairs.sort((a, b) => worstOrder.indexOf(a.severity) - worstOrder.indexOf(b.severity))[0]
  const worst: Severity = primary?.severity ?? 'minor'
  const nameOf = (id: string) => DRUGS.find((d) => d.id === id)?.name ?? id
  const pairLabel = primary ? `${nameOf(primary.a)} + ${nameOf(primary.b)}` : selected.map(nameOf).join(' + ')

  return (
    <Shell active="checker" title="Interaction result" sub="Based on the medications you selected">
      <a href="#/app/checker" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 14 }}>
        <IconArrowLeft width={16} height={16} /> Back to checker
      </a>
      <div className="im-result">
        <div className={`im-sevbanner im-sevbanner--${worst}`}>
          <span className="im-sevbanner__ic"><IconAlert width={24} height={24} /></span>
          <div>
            <h2>{worst === 'minor' ? 'No significant interaction' : `${SEVERITY_LABEL[worst]} interaction`}</h2>
            <div className="pair">{pairLabel}</div>
          </div>
          <span className="im-sevbanner__badge"><SeverityBadge level={worst} /></span>
        </div>

        <Card><p style={{ fontSize: 16, lineHeight: 1.6 }}>{primary?.summary ?? 'These medications are commonly taken together with no meaningful interaction.'}</p></Card>

        <div className="im-plan">
          <Card>
            <div className="im-panel-title" style={{ color: '#0a8a63' }}>What to do</div>
            <ul className="im-planlist im-planlist--do">
              {(primary?.dos ?? ['Take as directed']).map((d) => (
                <li key={d}><span className="m"><IconCheck width={13} height={13} /></span>{d}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <div className="im-panel-title" style={{ color: '#c92a2f' }}>What to avoid</div>
            <ul className="im-planlist im-planlist--dont">
              {(primary?.donts ?? ['No special precautions needed']).map((d) => (
                <li key={d}><span className="m"><IconClose width={13} height={13} /></span>{d}</li>
              ))}
            </ul>
          </Card>
        </div>

        <Card style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button leftIcon={<IconMessage width={18} height={18} />}>Talk to your doctor</Button>
          <Button variant="ghost">Save to history</Button>
          <span className="im-legend" style={{ marginLeft: 'auto' }}>
            <span><i style={{ background: 'var(--sev-major)' }} />Major</span>
            <span><i style={{ background: 'var(--sev-moderate)' }} />Moderate</span>
            <span><i style={{ background: 'var(--sev-minor)' }} />Safe</span>
          </span>
        </Card>
        <p className="im-disclaimer">This tool provides general information and is not a substitute for professional medical advice. Always consult your doctor or pharmacist.</p>
      </div>
    </Shell>
  )
}

/* ============================ Drug Database ============================ */
const CLASSES = ['All', 'Cardiovascular', 'Antibiotics', 'Pain', 'Diabetes']
export function Database() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const list = DRUGS.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <Shell active="database" title="Drug Database" sub="Browse medications and their known interactions">
      <div style={{ maxWidth: 460 }}><SearchField value={query} onChange={setQuery} placeholder="Search the database…" /></div>
      <div className="im-filterrow">
        {CLASSES.map((c) => (
          <button key={c} className={`im-filter${filter === c ? ' im-filter--active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
      <div className="im-druglist">
        {list.map((d) => (
          <a className="im-drugcard" key={d.id} href="#/app/drug">
            <span className="im-drugcard__ic"><IconPill width={22} height={22} /></span>
            <span className="im-drugcard__grow">
              <b>{d.name}</b><small>{d.generic}</small><br /><span className="im-tag">{d.drugClass}</span>
            </span>
            <IconChevron width={18} height={18} />
          </a>
        ))}
      </div>
    </Shell>
  )
}

/* ============================ Drug Detail ============================ */
export function DrugDetail() {
  const d = DRUGS[0] // Warfarin
  return (
    <Shell active="database" title={d.name} sub={`${d.generic} · ${d.drugClass}`}
      actions={<Button variant="soft" leftIcon={<IconPlus width={18} height={18} />}>Add to my meds</Button>}>
      <a href="#/app/database" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 14 }}>
        <IconArrowLeft width={16} height={16} /> Back to database
      </a>
      <div className="im-cols-2">
        <Card>
          <div className="im-panel-title">Known interactions</div>
          <div className="im-listrow"><span className="im-listrow__grow"><b>Aspirin</b><small>Antiplatelet</small></span><SeverityBadge level="major" /></div>
          <div className="im-listrow"><span className="im-listrow__grow"><b>Ibuprofen</b><small>NSAID</small></span><SeverityBadge level="moderate" /></div>
          <div className="im-listrow"><span className="im-listrow__grow"><b>Vitamin D</b><small>Supplement</small></span><SeverityBadge level="minor" /></div>
        </Card>
        <Card>
          <div className="im-panel-title">Overview</div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
            Warfarin is an anticoagulant (“blood thinner”) used to prevent and treat blood clots. It requires regular INR monitoring and interacts with many drugs, foods and supplements.
          </p>
          <div className="im-panel-title" style={{ marginTop: 16 }}>Typical dosage</div>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>2–10 mg once daily, individualised to INR target.</p>
          <div className="im-panel-title" style={{ marginTop: 16 }}>Common warnings</div>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Bleeding risk. Avoid abrupt changes in vitamin-K intake.</p>
        </Card>
      </div>
    </Shell>
  )
}

/* ============================ Reminders ============================ */
export function Reminders() {
  const [taken, setTaken] = useState<Record<number, boolean>>(
    Object.fromEntries(REMINDERS.map((r, i) => [i, r.taken])),
  )
  return (
    <Shell active="reminders" title="Reminders" sub="Stay on track with your daily doses"
      actions={<Button leftIcon={<IconPlus width={18} height={18} />}>Add reminder</Button>}>
      <div className="im-cols-2">
        <Card>
          <div className="im-panel-title">Today</div>
          {REMINDERS.map((r, i) => (
            <div className="im-listrow" key={r.name}>
              <span className="im-pillicon"><IconPill width={18} height={18} /></span>
              <span className="im-listrow__grow"><b>{r.name}</b><small>{r.time}{r.note ? ` · ${r.note}` : ''}</small></span>
              <button className={`im-check${taken[i] ? ' im-check--on' : ''}`} onClick={() => setTaken((t) => ({ ...t, [i]: !t[i] }))} aria-label="Mark taken">
                {taken[i] && <IconCheck width={13} height={13} />}
              </button>
            </div>
          ))}
        </Card>
        <Card>
          <div className="im-panel-title">Adherence</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="tnum" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.03em' }}>92%</span>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>this week</span>
          </div>
          <div className="im-mini" style={{ width: '100%', marginTop: 16 }}>
            {[70, 100, 85, 100, 60, 100, 92].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
          </div>
        </Card>
      </div>
    </Shell>
  )
}

/* ============================ Doctors ============================ */
export function Doctors() {
  return (
    <Shell active="doctors" title="My doctors" sub="Your care team and upcoming visits"
      actions={<Button leftIcon={<IconPlus width={18} height={18} />}>Add doctor</Button>}>
      <div className="im-cols-2">
        {DOCTORS.map((d) => (
          <Card key={d.name} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Avatar initials={d.initials} size={52} />
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 16 }}>{d.name}</b>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>{d.specialty}</div>
              <div style={{ color: 'var(--text-brand)', fontSize: 12.5, marginTop: 4 }}>{d.next}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" aria-label="Message"><IconMessage width={18} height={18} /></Button>
              <Button variant="soft" aria-label="Call"><IconPhone width={18} height={18} /></Button>
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  )
}

/* ============================ AI Assistant ============================ */
export function Assistant() {
  const [text, setText] = useState('')
  return (
    <Shell active="assistant" title="IntelliMeds Assistant" sub="Ask about your medications — informational only">
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: 460 }}>
        <div className="im-chat" style={{ flex: 1 }}>
          <div className="im-bubble im-bubble--ai">Hi Sarah 👋 I can explain interactions, side effects and timing. What would you like to know?</div>
          <div className="im-bubble im-bubble--me">Is it safe to take ibuprofen with my lisinopril?</div>
          <div className="im-bubble im-bubble--ai">That pair is a <b>moderate</b> interaction — ibuprofen can reduce lisinopril’s effect and, used often, may affect the kidneys. For occasional pain, paracetamol is usually a safer choice. Always confirm with your doctor.</div>
        </div>
        <div className="im-promptchips">
          <button onClick={() => setText('Explain my last result')}>Explain my last result</button>
          <button onClick={() => setText('What are warfarin’s side effects?')}>Warfarin side effects</button>
        </div>
        <div className="im-chatinput">
          <SearchField value={text} onChange={setText} placeholder="Message the assistant…" />
          <button className="send" aria-label="Send"><IconSend width={20} height={20} /></button>
        </div>
      </Card>
    </Shell>
  )
}

/* ============================ Profile ============================ */
export function Profile() {
  return (
    <Shell active="profile" title="Profile" sub="Your account and health information">
      <Card style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <Avatar initials="SC" size={72} />
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 20 }}>Sarah Chen</b>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>sarah.chen@email.com</div>
        </div>
        <Button variant="ghost">Edit profile</Button>
      </Card>
      <div className="im-cols-2">
        <Card>
          <div className="im-panel-title">Health info</div>
          <div className="im-listrow"><span className="im-listrow__grow"><b>Allergies</b><small>Penicillin</small></span></div>
          <div className="im-listrow"><span className="im-listrow__grow"><b>Conditions</b><small>Hypertension, Type 2 diabetes</small></span></div>
          <div className="im-listrow"><span className="im-listrow__grow"><b>Active medications</b><small>8 tracked</small></span></div>
        </Card>
        <Card>
          <div className="im-panel-title">Settings</div>
          <div className="im-settings">
            <button><IconBell width={18} height={18} />Notifications<span className="im-nav__spacer" /><IconChevron width={16} height={16} /></button>
            <button><IconShield width={18} height={18} />Privacy<span className="im-nav__spacer" /><IconChevron width={16} height={16} /></button>
            <button><IconCalendar width={18} height={18} />Language<span className="im-nav__spacer" />English</button>
            <button className="danger"><IconLogout width={18} height={18} />Sign out</button>
          </div>
        </Card>
      </div>
    </Shell>
  )
}

/* ============================ Secondary: History / Appointments / Education / Notifications ============ */
export function History() {
  return (
    <Shell active="dashboard" title="Medication history" sub="Every check you’ve run">
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="im-table">
          <thead><tr><th>Date</th><th>Medications</th><th>Result</th><th></th></tr></thead>
          <tbody>
            <tr><td className="tnum">Aug 7, 2026</td><td>Warfarin + Aspirin</td><td><SeverityBadge level="major" /></td><td><a href="#/app/result" className="im-tag">View</a></td></tr>
            <tr><td className="tnum">Aug 5, 2026</td><td>Lisinopril + Ibuprofen</td><td><SeverityBadge level="moderate" /></td><td><a href="#/app/result" className="im-tag">View</a></td></tr>
            <tr><td className="tnum">Aug 1, 2026</td><td>Metformin + Vitamin D</td><td><SeverityBadge level="minor" /></td><td><a href="#/app/result" className="im-tag">View</a></td></tr>
          </tbody>
        </table>
      </Card>
    </Shell>
  )
}

export function Appointments() {
  return (
    <Shell active="doctors" title="Appointments" sub="Upcoming and past visits"
      actions={<Button leftIcon={<IconPlus width={18} height={18} />}>Book appointment</Button>}>
      <div className="im-grouplabel">Upcoming</div>
      <Card style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span className="im-pillicon"><IconCalendar width={18} height={18} /></span>
        <div style={{ flex: 1 }}><b>Dr. Emily Rodriguez — Cardiology</b><div style={{ color: 'var(--muted)', fontSize: 13 }}>Aug 14, 2026 · 10:30 AM · Downtown Clinic</div></div>
        <span className="im-status im-status--Active"><i />Upcoming</span>
      </Card>
      <div className="im-grouplabel">Past</div>
      <Card style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span className="im-pillicon"><IconCalendar width={18} height={18} /></span>
        <div style={{ flex: 1 }}><b>Dr. James Park — General Practice</b><div style={{ color: 'var(--muted)', fontSize: 13 }}>Jul 3, 2026 · 9:00 AM</div></div>
        <span className="im-status" style={{ color: 'var(--muted)' }}><i style={{ background: 'var(--muted)' }} />Completed</span>
      </Card>
    </Shell>
  )
}

export function Education() {
  return (
    <Shell active="dashboard" title="Learn" sub="Understand your medications with confidence">
      <div className="im-articles">
        {ARTICLES.map((a) => (
          <div className="im-article" key={a.title}>
            <div className="im-article__banner" />
            <div className="im-article__b"><span className="im-tag">{a.tag}</span><b>{a.title}</b><small>{a.read}</small></div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

export function Notifications() {
  return (
    <Shell active="dashboard" title="Notifications" sub="Alerts, reminders and updates"
      actions={<Button variant="ghost">Mark all read</Button>}>
      <Card>
        <div className="im-grouplabel">Today</div>
        <div className="im-notif">
          <span className="im-notif__ic" style={{ background: 'var(--sev-major)' }}><IconAlert width={18} height={18} /></span>
          <div className="im-notif__grow"><b>Major interaction flagged</b><p>Warfarin + Aspirin — review your care plan.</p></div>
          <time>2h</time><span className="im-unread" />
        </div>
        <div className="im-notif">
          <span className="im-notif__ic" style={{ background: 'var(--brand)' }}><IconBell width={18} height={18} /></span>
          <div className="im-notif__grow"><b>Reminder</b><p>Vitamin D 1000IU at 1:00 PM.</p></div>
          <time>4h</time>
        </div>
        <div className="im-grouplabel">Earlier</div>
        <div className="im-notif">
          <span className="im-notif__ic" style={{ background: 'var(--teal-700)' }}><IconCalendar width={18} height={18} /></span>
          <div className="im-notif__grow"><b>Appointment confirmed</b><p>Dr. Rodriguez on Aug 14, 10:30 AM.</p></div>
          <time>1d</time>
        </div>
      </Card>
    </Shell>
  )
}
