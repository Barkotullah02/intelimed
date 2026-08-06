import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import type { Severity } from './data'
import { SEVERITY_LABEL } from './data'
import { IconSearch } from './icons'

/* Button — mirrors the Figma Button component (Primary gradient / Deep / Soft / Ghost) */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'deep' | 'soft' | 'ghost'
  block?: boolean
  leftIcon?: ReactNode
}
export function Button({ variant = 'primary', block, leftIcon, className = '', children, ...rest }: BtnProps) {
  return (
    <button className={`im-btn im-btn--${variant}${block ? ' im-btn--block' : ''} ${className}`} {...rest}>
      {leftIcon}
      {children}
    </button>
  )
}

/* SeverityBadge — mirrors the Figma SeverityBadge component */
export function SeverityBadge({ level, label }: { level: Severity; label?: string }) {
  return (
    <span className={`im-badge im-badge--${level}`}>
      <i />
      {label ?? SEVERITY_LABEL[level]}
    </span>
  )
}

/* SearchField — mirrors the Figma SearchField component */
export function SearchField({
  value, onChange, placeholder = 'Search medications…',
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="im-search">
      <IconSearch width={18} height={18} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  )
}

export function Card({ className = '', children, ...rest }: { className?: string; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return <div className={`im-card ${className}`} {...rest}>{children}</div>
}

export function StatCard({ value, label, tone = 'brand' }: { value: string; label: string; tone?: 'brand' | 'moderate' | 'minor' | 'major' }) {
  return (
    <div className="im-stat">
      <span className={`im-stat__dot im-dot--${tone}`} />
      <span className="im-stat__value tnum">{value}</span>
      <span className="im-stat__label">{label}</span>
    </div>
  )
}

export function Avatar({ initials = 'SC', size = 44 }: { initials?: string; size?: number }) {
  return <span className="im-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials}</span>
}

export function Field({ label, value, placeholder, type = 'text' }: { label: string; value?: string; placeholder?: string; type?: string }) {
  return (
    <label className="im-field">
      <span className="im-field__label">{label}</span>
      <input className="im-field__input" defaultValue={value} placeholder={placeholder} type={type} />
    </label>
  )
}

export function SectionTitle({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="im-sectiontitle">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {sub && <p className="im-sub">{sub}</p>}
    </div>
  )
}
