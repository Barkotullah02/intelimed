import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = (p: P) => ({
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const, ...p,
})

export const IconGrid = (p: P) => (<svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>)
export const IconShield = (p: P) => (<svg {...base(p)}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>)
export const IconPill = (p: P) => (<svg {...base(p)}><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(45 12 12)"/><path d="M8.5 8.5l7 7"/></svg>)
export const IconBell = (p: P) => (<svg {...base(p)}><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10.5 20a2 2 0 003 0"/></svg>)
export const IconStethoscope = (p: P) => (<svg {...base(p)}><path d="M5 3v6a4 4 0 008 0V3"/><path d="M9 15a6 6 0 006 6 5 5 0 005-5v-2"/><circle cx="19" cy="10" r="2"/></svg>)
export const IconSparkle = (p: P) => (<svg {...base(p)}><path d="M12 3l1.8 4.9L18.5 9l-4.7 1.1L12 15l-1.8-4.9L5.5 9l4.7-1.1z"/><path d="M18 15l.8 2 .2.8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>)
export const IconUser = (p: P) => (<svg {...base(p)}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>)
export const IconSearch = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>)
export const IconPlus = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14"/></svg>)
export const IconClose = (p: P) => (<svg {...base(p)}><path d="M6 6l12 12M18 6L6 18"/></svg>)
export const IconCheck = (p: P) => (<svg {...base(p)}><path d="M5 12l4.5 4.5L19 7"/></svg>)
export const IconChevron = (p: P) => (<svg {...base(p)}><path d="M9 6l6 6-6 6"/></svg>)
export const IconArrowLeft = (p: P) => (<svg {...base(p)}><path d="M15 6l-6 6 6 6"/></svg>)
export const IconAlert = (p: P) => (<svg {...base(p)}><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5v.1"/></svg>)
export const IconCalendar = (p: P) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>)
export const IconBook = (p: P) => (<svg {...base(p)}><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M19 3v16"/></svg>)
export const IconClock = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>)
export const IconHome = (p: P) => (<svg {...base(p)}><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/></svg>)
export const IconSend = (p: P) => (<svg {...base(p)}><path d="M4 12l16-8-6 16-3-6z"/></svg>)
export const IconPhone = (p: P) => (<svg {...base(p)}><path d="M5 4h4l2 5-2 1a12 12 0 005 5l1-2 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>)
export const IconMessage = (p: P) => (<svg {...base(p)}><path d="M4 5h16v11H9l-5 4z"/></svg>)
export const IconLogout = (p: P) => (<svg {...base(p)}><path d="M15 4h4v16h-4"/><path d="M11 16l4-4-4-4M15 12H3"/></svg>)
export const IconHeart = (p: P) => (<svg {...base(p)}><path d="M12 20s-7-4.6-9.2-9C1.3 8 3 4.5 6.3 4.5c2 0 3.2 1.2 3.7 2 .5-.8 1.7-2 3.7-2C17 4.5 18.7 8 17.2 11 15 15.4 12 20 12 20z"/></svg>)
export const IconDatabase = (p: P) => (<svg {...base(p)}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>)
