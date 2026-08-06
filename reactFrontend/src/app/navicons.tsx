import type { SVGProps } from 'react'
export { IconGrid, IconShield, IconDatabase, IconBell, IconStethoscope, IconSparkle, IconUser } from './icons'

export const IconShieldAdmin = (p: SVGProps<SVGSVGElement>) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    <path d="M12 8v4M12 15v.1" />
  </svg>
)
