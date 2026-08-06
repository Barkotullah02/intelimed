import type { ReactNode } from 'react'
import { SeverityBadge, Avatar } from '../ui'
import {
  IconHome, IconBell, IconStethoscope, IconUser, IconPlus, IconPill, IconCheck,
  IconAlert, IconChevron, IconSend, IconArrowLeft, IconMessage,
} from '../icons'
import { REMINDERS, DOCTORS } from '../data'

type Tab = 'home' | 'reminders' | 'doctors' | 'profile'

function Phone({ title, children, tab, showFab = true }: { title: string; children: ReactNode; tab?: Tab; showFab?: boolean }) {
  return (
    <div>
      <div className="im-phone__title">{title}</div>
      <div className="im-phone">
        <div className="im-phone__status"><span className="tnum">9:41</span><span>IntelliMeds</span></div>
        <div className="im-phone__body">{children}</div>
        <nav className="im-tabbar">
          <button className={`im-tab${tab === 'home' ? ' im-tab--active' : ''}`}><IconHome width={22} height={22} />Home</button>
          <button className={`im-tab${tab === 'reminders' ? ' im-tab--active' : ''}`}><IconBell width={22} height={22} />Reminders</button>
          {showFab
            ? <div className="im-fabwrap"><button className="im-fab"><IconPlus width={24} height={24} /></button><small>Check</small></div>
            : <div style={{ width: 60 }} />}
          <button className={`im-tab${tab === 'doctors' ? ' im-tab--active' : ''}`}><IconStethoscope width={22} height={22} />Doctors</button>
          <button className={`im-tab${tab === 'profile' ? ' im-tab--active' : ''}`}><IconUser width={22} height={22} />Profile</button>
        </nav>
      </div>
    </div>
  )
}

export function MobileScreens() {
  return (
    <div className="im-app" style={{ padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto 24px' }}>
        <span className="eyebrow">IntelliMeds · Mobile</span>
        <h1 style={{ fontSize: 28, letterSpacing: '-.03em', marginTop: 8 }}>The 5-tab app</h1>
        <p style={{ color: 'var(--muted)' }}>Home · Reminders · Check (center FAB) · Doctors · Profile — plus the Check result and detail flows.</p>
      </div>
      <div className="im-phones" style={{ justifyContent: 'center' }}>
        {/* Home */}
        <Phone title="Home" tab="home">
          <div className="im-row" style={{ justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: 12, color: 'var(--muted)' }}>Good morning</div><b style={{ fontSize: 18 }}>Sarah</b></div>
            <Avatar initials="SC" size={40} />
          </div>
          <div className="im-mstat">
            <div className="p"><b className="tnum">8</b><small>Meds</small></div>
            <div className="p"><b className="tnum">2</b><small>Flags</small></div>
            <div className="p"><b className="tnum">3</b><small>Today</small></div>
          </div>
          <div className="im-mcta"><b>Check an interaction</b><p>Add meds for an instant severity rating.</p><button className="im-btn im-btn--soft">Open checker</button></div>
          <div className="im-mcard">
            <b style={{ fontSize: 14 }}>Recent checks</b>
            <div className="im-listrow"><span className="im-listrow__grow"><b>Warfarin + Aspirin</b></span><SeverityBadge level="major" /></div>
            <div className="im-listrow"><span className="im-listrow__grow"><b>Metformin + Vit D</b></span><SeverityBadge level="minor" /></div>
          </div>
        </Phone>

        {/* Reminders */}
        <Phone title="Reminders" tab="reminders">
          <div className="im-row" style={{ justifyContent: 'space-between' }}><b style={{ fontSize: 18 }}>Reminders</b><span className="im-pillicon"><IconPlus width={18} height={18} /></span></div>
          <div className="im-mcard" style={{ textAlign: 'center' }}>
            <b className="tnum" style={{ fontSize: 34 }}>92%</b>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>adherence this week</div>
          </div>
          {REMINDERS.map((r, i) => (
            <div className="im-mcard" key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12 }}>
              <span className="im-pillicon"><IconPill width={18} height={18} /></span>
              <span className="im-listrow__grow"><b style={{ fontSize: 13 }}>{r.name}</b><small>{r.time}</small></span>
              <span className={`im-check${i < 2 ? ' im-check--on' : ''}`}>{i < 2 && <IconCheck width={12} height={12} />}</span>
            </div>
          ))}
        </Phone>

        {/* Check (FAB destination) */}
        <Phone title="Check (FAB)" showFab>
          <b style={{ fontSize: 18 }}>Interaction Checker</b>
          <div className="im-search"><input placeholder="Search medications…" readOnly /></div>
          <div className="im-chips"><span className="im-chip">Warfarin</span><span className="im-chip">Aspirin</span></div>
          <button className="im-btn im-btn--primary im-btn--block">Check interactions</button>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>The center FAB opens this screen from anywhere.</p>
        </Phone>

        {/* Check Result flow */}
        <Phone title="Check result" showFab={false}>
          <div className="im-row" style={{ gap: 6, color: 'var(--muted)', fontSize: 13 }}><IconArrowLeft width={16} height={16} />Back</div>
          <div className="im-sevbanner im-sevbanner--major" style={{ padding: 18, borderRadius: 18 }}>
            <span className="im-sevbanner__ic" style={{ width: 40, height: 40 }}><IconAlert width={20} height={20} /></span>
            <div><h2 style={{ fontSize: 18 }}>Major</h2><div className="pair" style={{ fontSize: 13 }}>Warfarin + Aspirin</div></div>
          </div>
          <div className="im-mcard"><b style={{ fontSize: 13, color: '#0a8a63' }}>Do</b><ul className="im-planlist im-planlist--do" style={{ marginTop: 8 }}><li><span className="m"><IconCheck width={12} height={12} /></span>Watch for unusual bleeding</li></ul></div>
          <div className="im-mcard"><b style={{ fontSize: 13, color: '#c92a2f' }}>Don’t</b><ul className="im-planlist im-planlist--dont" style={{ marginTop: 8 }}><li><span className="m">✕</span>Don’t stop either on your own</li></ul></div>
          <button className="im-btn im-btn--primary im-btn--block"><IconMessage width={16} height={16} />Talk to your doctor</button>
        </Phone>

        {/* Doctors */}
        <Phone title="Doctors" tab="doctors">
          <b style={{ fontSize: 18 }}>My doctors</b>
          {DOCTORS.map((d) => (
            <div className="im-mcard" key={d.name} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Avatar initials={d.initials} size={40} />
              <span className="im-listrow__grow"><b style={{ fontSize: 13 }}>{d.name}</b><small>{d.specialty}</small></span>
              <span className="im-pillicon"><IconMessage width={16} height={16} /></span>
            </div>
          ))}
        </Phone>

        {/* Profile */}
        <Phone title="Profile" tab="profile">
          <div className="im-mcard" style={{ textAlign: 'center' }}>
            <Avatar initials="SC" size={64} />
            <b style={{ display: 'block', marginTop: 8 }}>Sarah Chen</b>
            <small style={{ color: 'var(--muted)' }}>sarah.chen@email.com</small>
          </div>
          <div className="im-mcard im-settings" style={{ padding: '4px 16px' }}>
            <button><IconBell width={18} height={18} />Notifications<span className="im-nav__spacer" /><IconChevron width={16} height={16} /></button>
            <button><IconUser width={18} height={18} />Account<span className="im-nav__spacer" /><IconChevron width={16} height={16} /></button>
            <button className="danger">Sign out</button>
          </div>
        </Phone>

        {/* AI Assistant flow */}
        <Phone title="AI Assistant" showFab={false}>
          <b style={{ fontSize: 18 }}>Assistant</b>
          <div className="im-chat" style={{ flex: 1 }}>
            <div className="im-bubble im-bubble--ai" style={{ fontSize: 13 }}>Hi! Ask me anything about your meds.</div>
            <div className="im-bubble im-bubble--me" style={{ fontSize: 13 }}>Ibuprofen with lisinopril?</div>
            <div className="im-bubble im-bubble--ai" style={{ fontSize: 13 }}>That’s a moderate interaction — prefer paracetamol for occasional pain.</div>
          </div>
          <div className="im-chatinput"><div className="im-search"><input placeholder="Message…" readOnly /></div><button className="send"><IconSend width={18} height={18} /></button></div>
        </Phone>
      </div>
    </div>
  )
}
