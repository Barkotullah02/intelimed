import { useEffect, useState } from 'react'
import { Shell } from '../AppShell'
import { Button, Card, StatCard, SeverityBadge, SearchField, Avatar } from '../ui'
import {
  IconPill, IconCheck, IconClose, IconPlus, IconChevron, IconAlert, IconShield,
  IconArrowLeft, IconPhone, IconMessage, IconSend, IconBell, IconCalendar, IconLogout,
} from '../icons'
import {
  ARTICLES, SEVERITY_LABEL,
  type Severity,
} from '../data'
import { useDrugs } from '../useApi'
import { useAuth } from '../auth/AuthContext'
import { drugApi, interactionApi, aiApi, doctorApi, reminderApi } from '../../api/services'
import type { InteractionCheckResponse, DrugInteractionSummary, DoctorResponse, ReminderResponse, InteractionHistory } from '../../api/types'

/* ---------- shared selection store for the checker → result flow ---------- */
type PickedDrug = { id: string; name: string }
function saveSelection(drugs: PickedDrug[]) { sessionStorage.setItem('im-check', JSON.stringify(drugs)) }
function loadSelection(): PickedDrug[] {
  try { return JSON.parse(sessionStorage.getItem('im-check') || '[]') } catch { return [] }
}

/** Backend severities are UPPERCASE; the UI severity type is lowercase. */
function toSeverity(s: string): Severity {
  const v = (s || '').toLowerCase()
  return v === 'major' || v === 'moderate' || v === 'minor' ? v : 'unknown'
}

/** Read a query param from the hash, e.g. `#/app/drug?id=abc`. */
function hashParam(name: string): string | null {
  const q = location.hash.split('?')[1]
  return q ? new URLSearchParams(q).get(name) : null
}

function initialsFrom(name: string): string {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || '—'
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (isNaN(then)) return ''
  const s = Math.max(0, (Date.now() - then) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

/* ============================ Dashboard ============================ */
export function Dashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState<InteractionHistory[]>([])
  const [reminders, setReminders] = useState<ReminderResponse[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([
      interactionApi.history().catch(() => []),
      reminderApi.list().catch(() => []),
    ]).then(([h, r]) => {
      if (!alive) return
      setHistory(h); setReminders(r); setLoaded(true)
    })
    return () => { alive = false }
  }, [])

  const flagged = history.filter((h) => ['MAJOR', 'MODERATE'].includes((h.highestSeverity || '').toUpperCase())).length
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <Shell active="dashboard" title={`Welcome, ${firstName}`} sub="Here’s your medication overview">
      <div className="im-grid-4">
        <StatCard value={String(reminders.length)} label="Active reminders" tone="brand" />
        <StatCard value={String(flagged)} label="Interactions flagged" tone="moderate" />
        <StatCard value={String(history.length)} label="Checks run" tone="brand" />
        <StatCard value="—" label="Upcoming appointment" tone="minor" />
      </div>

      <div className="im-cta">
        <div className="im-cta__text">
          <h2>Check a new interaction</h2>
          <p>Add two or more medications to get an instant severity rating.</p>
        </div>
        <a href="#/app/checker"><Button variant="soft">Open checker</Button></a>
      </div>

      <div className="im-cols-2">
        <Card>
          <div className="im-panel-title">Recent checks</div>
          {!loaded && <p style={{ color: 'var(--muted)', fontSize: 14, margin: '8px 0 0' }}>Loading…</p>}
          {loaded && history.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14, margin: '8px 0 0' }}>No checks yet — try the interaction checker.</p>}
          {history.slice(0, 5).map((h) => (
            <div className="im-listrow" key={h.id}>
              <span className="im-listrow__grow"><b>{h.resultSummary}</b><small>{relativeTime(h.checkedAt)}</small></span>
              <SeverityBadge level={toSeverity(h.highestSeverity)} />
            </div>
          ))}
        </Card>
        <Card>
          <div className="im-panel-title">Your reminders</div>
          {loaded && reminders.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14, margin: '8px 0 0' }}>No reminders set.</p>}
          {reminders.slice(0, 4).map((r) => (
            <div className="im-listrow" key={r.id}>
              <span className="im-pillicon"><IconPill width={18} height={18} /></span>
              <span className="im-listrow__grow"><b>{r.drugName}</b><small>{r.reminderTime}{r.dosage ? ` · ${r.dosage}` : ''}</small></span>
            </div>
          ))}
        </Card>
      </div>
    </Shell>
  )
}

/* ============================ Interaction Checker ============================ */
export function Checker() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<PickedDrug[]>(loadSelection())
  const [results, setResults] = useState<PickedDrug[]>([])
  const [searching, setSearching] = useState(false)

  // Debounced live search against the real drug catalogue.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    const t = setTimeout(() => {
      drugApi.search(q)
        .then((rows) => setResults(rows.map((d) => ({ id: d.id, name: d.brandName || d.genericName }))))
        .catch(() => setResults([]))
        .finally(() => setSearching(false))
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const suggestions = results.filter((r) => !selected.some((s) => s.id === r.id)).slice(0, 8)

  function add(d: PickedDrug) { setSelected((s) => [...s, d]); setQuery('') }
  function remove(id: string) { setSelected((s) => s.filter((x) => x.id !== id)) }
  function run() { saveSelection(selected); location.hash = '#/app/result' }

  return (
    <Shell active="checker" title="Interaction Checker" sub="Add medications to check for interactions">
      <div className="im-cols-2">
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SearchField value={query} onChange={setQuery} placeholder="Search 1,900+ medications…" />
          {query.trim().length >= 2 && (
            <div className="im-suggest">
              {suggestions.map((d) => (
                <button key={d.id} onClick={() => add(d)}>
                  <span>{d.name}</span>
                </button>
              ))}
              {suggestions.length === 0 && <button disabled>{searching ? 'Searching…' : 'No matches'}</button>}
            </div>
          )}
          <div className="im-chips">
            {selected.map((d) => (
              <span className="im-chip" key={d.id}>{d.name}<button onClick={() => remove(d.id)} aria-label={`Remove ${d.name}`}><IconClose width={14} height={14} /></button></span>
            ))}
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
            <li>You get a clinical-grade severity rating for each pair.</li>
          </ol>
        </Card>
      </div>
    </Shell>
  )
}

/* ============================ Interaction Result (HERO) ============================ */
const SEV_RANK: Severity[] = ['major', 'moderate', 'minor', 'unknown']

// Honest, generic guidance keyed only on severity tier (the dataset has no per-pair text).
const SEV_GUIDANCE: Record<Severity, { do: string[]; avoid: string[] }> = {
  major: {
    do: ['Contact your doctor or pharmacist before taking these together', 'Watch closely for new or unusual symptoms'],
    avoid: ['Don’t start or stop either medicine on your own', 'Don’t combine without professional advice'],
  },
  moderate: {
    do: ['Mention this combination to your doctor or pharmacist', 'Monitor how you feel and report side effects'],
    avoid: ['Don’t assume it’s safe long-term without review'],
  },
  minor: {
    do: ['Usually manageable — follow your normal instructions', 'Ask your pharmacist if unsure'],
    avoid: ['Don’t ignore persistent side effects'],
  },
  unknown: {
    do: ['Evidence is limited — check with your doctor or pharmacist'],
    avoid: ['Don’t treat “unknown” as “safe”'],
  },
}

export function Result() {
  const selected = loadSelection()
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [data, setData] = useState<InteractionCheckResponse | null>(null)

  useEffect(() => {
    if (selected.length < 2) { setState('error'); return }
    let alive = true
    interactionApi.check(selected.map((d) => d.id))
      .then((res) => { if (alive) { setData(res); setState('ok') } })
      .catch(() => { if (alive) setState('error') })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pairs = data?.interactions ?? []
  const worst: Severity = toSeverity(data?.highestSeverity ?? 'unknown')
  const none = state === 'ok' && pairs.length === 0
  const guidance = SEV_GUIDANCE[worst]

  return (
    <Shell active="checker" title="Interaction result" sub="Based on the medications you selected">
      <a href="#/app/checker" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 14 }}>
        <IconArrowLeft width={16} height={16} /> Back to checker
      </a>

      {state === 'loading' && <Card><p style={{ margin: 0, color: 'var(--muted)' }}>Checking {selected.length} medications against the interaction database…</p></Card>}

      {state === 'error' && (
        <Card style={{ borderLeft: '4px solid var(--sev-moderate)' }}>
          <div className="im-panel-title">Nothing to check</div>
          <p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Add at least two medications on the checker, then try again.</p>
          <div style={{ marginTop: 12 }}><a href="#/app/checker"><Button variant="soft">Back to checker</Button></a></div>
        </Card>
      )}

      {state === 'ok' && (
        <div className="im-result">
          <div className={`im-sevbanner im-sevbanner--${none ? 'minor' : worst}`}>
            <span className="im-sevbanner__ic"><IconAlert width={24} height={24} /></span>
            <div>
              <h2>{none ? 'No known interaction' : `${SEVERITY_LABEL[worst]} interaction`}</h2>
              <div className="pair">{selected.map((d) => d.name).join(' + ')}</div>
            </div>
            {!none && <span className="im-sevbanner__badge"><SeverityBadge level={worst} /></span>}
          </div>

          <Card>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}>
              {none
                ? 'No interactions were found between the medications you selected in our database. This does not guarantee safety — always confirm with your doctor or pharmacist.'
                : `We found ${pairs.length} interacting pair${pairs.length > 1 ? 's' : ''} among your medications. The highest severity is ${SEVERITY_LABEL[worst].toLowerCase()}.`}
            </p>
          </Card>

          {!none && (
            <Card>
              <div className="im-panel-title">Interacting pairs</div>
              {[...pairs]
                .sort((a, b) => SEV_RANK.indexOf(toSeverity(a.severity)) - SEV_RANK.indexOf(toSeverity(b.severity)))
                .map((p, i) => (
                  <div className="im-listrow" key={i}>
                    <span className="im-listrow__grow"><b>{p.drugA}</b> <small>+ {p.drugB}</small></span>
                    <SeverityBadge level={toSeverity(p.severity)} />
                  </div>
                ))}
            </Card>
          )}

          {!none && (
            <div className="im-plan">
              <Card>
                <div className="im-panel-title" style={{ color: '#0a8a63' }}>What to do</div>
                <ul className="im-planlist im-planlist--do">
                  {guidance.do.map((d) => (<li key={d}><span className="m"><IconCheck width={13} height={13} /></span>{d}</li>))}
                </ul>
              </Card>
              <Card>
                <div className="im-panel-title" style={{ color: '#c92a2f' }}>What to avoid</div>
                <ul className="im-planlist im-planlist--dont">
                  {guidance.avoid.map((d) => (<li key={d}><span className="m"><IconClose width={13} height={13} /></span>{d}</li>))}
                </ul>
              </Card>
            </div>
          )}

          <Card style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="#/app/consultations"><Button leftIcon={<IconMessage width={18} height={18} />}>Talk to your doctor</Button></a>
            <span className="im-legend" style={{ marginLeft: 'auto' }}>
              <span><i style={{ background: 'var(--sev-major)' }} />Major</span>
              <span><i style={{ background: 'var(--sev-moderate)' }} />Moderate</span>
              <span><i style={{ background: 'var(--sev-minor)' }} />Minor</span>
            </span>
          </Card>
          <p className="im-disclaimer">This tool provides general information and is not a substitute for professional medical advice. Always consult your doctor or pharmacist.</p>
        </div>
      )}
    </Shell>
  )
}

/* ============================ Drug Database ============================ */
const CLASSES = ['All', 'Cardiovascular', 'Antibiotics', 'Pain', 'Diabetes']
export function Database() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const { drugs, source } = useDrugs()
  const list = drugs.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <Shell active="database" title="Drug Database" sub="Browse medications and their known interactions"
      actions={<span className={`im-tag`} style={{ background: source === 'live' ? 'var(--sev-minor-bg)' : 'var(--surface-2)', color: source === 'live' ? '#0a8a63' : 'var(--muted)' }}>{source === 'live' ? '● Live API' : source === 'loading' ? 'Loading…' : '○ Sample data'}</span>}>
      <div style={{ maxWidth: 460 }}><SearchField value={query} onChange={setQuery} placeholder="Search the database…" /></div>
      <div className="im-filterrow">
        {CLASSES.map((c) => (
          <button key={c} className={`im-filter${filter === c ? ' im-filter--active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
      <div className="im-druglist">
        {list.map((d) => (
          <a className="im-drugcard" key={d.id} href={`#/app/drug?id=${d.id}`}>
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
function DetailBlock({ title, text }: { title: string; text?: string | null }) {
  if (!text || !text.trim()) return null
  return (
    <>
      <div className="im-panel-title" style={{ marginTop: 16 }}>{title}</div>
      <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{text}</p>
    </>
  )
}

export function DrugDetail() {
  const id = hashParam('id')
  const [drug, setDrug] = useState<Awaited<ReturnType<typeof drugApi.get>> | null>(null)
  const [inter, setInter] = useState<DrugInteractionSummary[]>([])
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    if (!id) { setState('error'); return }
    let alive = true
    Promise.all([drugApi.get(id), interactionApi.forDrug(id, 40).catch(() => [])])
      .then(([d, ix]) => { if (alive) { setDrug(d); setInter(ix); setState('ok') } })
      .catch(() => { if (alive) setState('error') })
    return () => { alive = false }
  }, [id])

  if (state === 'loading') {
    return <Shell active="database" title="Loading…" sub=""><Card><p style={{ margin: 0, color: 'var(--muted)' }}>Loading medication…</p></Card></Shell>
  }
  if (state === 'error' || !drug) {
    return (
      <Shell active="database" title="Medication not found" sub="">
        <Card style={{ borderLeft: '4px solid var(--sev-moderate)' }}>
          <p style={{ margin: 0, color: 'var(--muted)' }}>We couldn’t load this medication.</p>
          <div style={{ marginTop: 12 }}><a href="#/app/database"><Button variant="soft">Back to database</Button></a></div>
        </Card>
      </Shell>
    )
  }

  const name = drug.brandName || drug.genericName
  const subParts = [drug.genericName, drug.categoryName || drug.dosageForm].filter(Boolean)

  return (
    <Shell active="database" title={name} sub={subParts.join(' · ')}
      actions={<Button variant="soft" leftIcon={<IconPlus width={18} height={18} />}>Add to my meds</Button>}>
      <a href="#/app/database" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 14 }}>
        <IconArrowLeft width={16} height={16} /> Back to database
      </a>
      <div className="im-cols-2">
        <Card>
          <div className="im-panel-title">Known interactions {inter.length > 0 && <span className="im-tag">{inter.length}</span>}</div>
          {inter.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14, margin: '8px 0 0' }}>No interactions recorded for this medication.</p>}
          {inter.map((x) => (
            <a className="im-listrow" key={x.otherDrugId} href={`#/app/drug?id=${x.otherDrugId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="im-listrow__grow"><b>{x.otherDrugName}</b></span>
              <SeverityBadge level={toSeverity(x.severity)} />
            </a>
          ))}
        </Card>
        <Card>
          {(drug.description || drug.uses) ? (
            <>
              <DetailBlock title="Overview" text={drug.description || drug.uses} />
              <DetailBlock title="Uses" text={drug.uses && drug.uses !== drug.description ? drug.uses : null} />
            </>
          ) : (
            <>
              <div className="im-panel-title">Overview</div>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>No description on file for this medication.</p>
            </>
          )}
          <DetailBlock title="Dosage" text={drug.dosage} />
          <DetailBlock title="Side effects" text={drug.sideEffects} />
          <DetailBlock title="Contraindications" text={drug.contraindications} />
          <DetailBlock title="Pregnancy safety" text={drug.pregnancySafety} />
          <DetailBlock title="Storage" text={drug.storage} />
        </Card>
      </div>
    </Shell>
  )
}

/* ============================ Reminders ============================ */
export function Reminders() {
  const [reminders, setReminders] = useState<ReminderResponse[] | null>(null)
  const [taken, setTaken] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let alive = true
    reminderApi.list()
      .then((r) => { if (alive) setReminders(r) })
      .catch(() => { if (alive) setReminders([]) })
    return () => { alive = false }
  }, [])

  return (
    <Shell active="reminders" title="Reminders" sub="Stay on track with your daily doses"
      actions={<Button leftIcon={<IconPlus width={18} height={18} />}>Add reminder</Button>}>
      <Card>
        <div className="im-panel-title">Your reminders</div>
        {!reminders && <p style={{ color: 'var(--muted)', fontSize: 14, margin: '8px 0 0' }}>Loading…</p>}
        {reminders && reminders.length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '8px 0 0' }}>No reminders yet. Add one to get started.</p>
        )}
        {reminders?.map((r) => (
          <div className="im-listrow" key={r.id}>
            <span className="im-pillicon"><IconPill width={18} height={18} /></span>
            <span className="im-listrow__grow">
              <b>{r.drugName}</b>
              <small>{r.reminderTime}{r.frequency ? ` · ${r.frequency}` : ''}{r.dosage ? ` · ${r.dosage}` : ''}</small>
            </span>
            <button className={`im-check${taken[r.id] ? ' im-check--on' : ''}`} onClick={() => setTaken((t) => ({ ...t, [r.id]: !t[r.id] }))} aria-label="Mark taken">
              {taken[r.id] && <IconCheck width={13} height={13} />}
            </button>
          </div>
        ))}
      </Card>
    </Shell>
  )
}

/* ============================ Doctors ============================ */
export function Doctors() {
  const [doctors, setDoctors] = useState<DoctorResponse[] | null>(null)

  useEffect(() => {
    let alive = true
    doctorApi.verified()
      .then((d) => { if (alive) setDoctors(d) })
      .catch(() => { if (alive) setDoctors([]) })
    return () => { alive = false }
  }, [])

  return (
    <Shell active="doctors" title="Doctors" sub="Verified professionals available to consult">
      {!doctors && <Card><p style={{ margin: 0, color: 'var(--muted)' }}>Loading doctors…</p></Card>}
      {doctors && doctors.length === 0 && (
        <Card>
          <div className="im-panel-title">No verified doctors yet</div>
          <p style={{ color: 'var(--muted)', margin: '6px 0 0', fontSize: 14 }}>
            Doctors appear here once an administrator approves their credentials.
          </p>
        </Card>
      )}
      {doctors && doctors.length > 0 && (
        <div className="im-cols-2">
          {doctors.map((d) => (
            <Card key={d.id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Avatar initials={initialsFrom(d.fullName)} size={52} />
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 16 }}>Dr. {d.fullName}</b>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{d.specialization}{d.hospital ? ` · ${d.hospital}` : ''}</div>
                {d.experienceYears ? <div style={{ color: 'var(--text-brand)', fontSize: 12.5, marginTop: 4 }}>{d.experienceYears} yrs experience</div> : null}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href="#/app/consultations"><Button variant="soft" aria-label="Consult"><IconPhone width={18} height={18} /></Button></a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  )
}

/* ============================ AI Assistant ============================ */
type ChatMsg = { role: 'ai' | 'me'; text: string }

export function Assistant() {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', text: `Hi ${user?.name?.split(' ')[0] ?? 'there'} 👋 I can explain interactions, side effects and timing. What would you like to know?` },
  ])

  async function send(prompt?: string) {
    const content = (prompt ?? text).trim()
    if (!content || busy) return
    setText('')
    setMessages((m) => [...m, { role: 'me', text: content }])
    setBusy(true)
    try {
      const res = await aiApi.explain(content)
      setMessages((m) => [...m, { role: 'ai', text: res.explanation }])
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Sorry — I couldn’t reach the assistant just now. Please try again.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell active="assistant" title="IntelliMeds Assistant" sub="Ask about your medications — informational only">
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: 460 }}>
        <div className="im-chat" style={{ flex: 1 }}>
          {messages.map((m, i) => (
            <div key={i} className={`im-bubble im-bubble--${m.role === 'ai' ? 'ai' : 'me'}`} style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
          ))}
          {busy && <div className="im-bubble im-bubble--ai">Thinking…</div>}
        </div>
        <div className="im-promptchips">
          <button onClick={() => send('What are the side effects of warfarin?')}>Warfarin side effects</button>
          <button onClick={() => send('Is it safe to take ibuprofen with lisinopril?')}>Ibuprofen + lisinopril</button>
        </div>
        <form className="im-chatinput" onSubmit={(e) => { e.preventDefault(); send() }}>
          <SearchField value={text} onChange={setText} placeholder="Message the assistant…" />
          <button className="send" aria-label="Send" type="submit" disabled={busy}><IconSend width={20} height={20} /></button>
        </form>
      </Card>
      <p className="im-disclaimer">AI responses are informational only and not a substitute for professional medical advice.</p>
    </Shell>
  )
}

/* ============================ Profile ============================ */
export function Profile() {
  const { user, logout } = useAuth()
  async function signOut() { await logout(); location.hash = '#/login' }
  return (
    <Shell active="profile" title="Profile" sub="Your account and health information">
      <Card style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <Avatar initials={(user?.name ?? 'Sarah Chen').split(' ').map((s) => s[0]).slice(0, 2).join('')} size={72} />
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 20 }}>{user?.name ?? 'Sarah Chen'}</b>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>{user?.email ?? 'sarah.chen@email.com'}</div>
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
            <button className="danger" onClick={signOut}><IconLogout width={18} height={18} />Sign out</button>
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
