import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth, roleHome } from './AuthContext'
import { tokenStore } from '../../api/client'

/**
 * Gate a route to one or more roles.
 * - Not signed in  → bounce to the appropriate login (`loginHash`).
 * - Wrong role     → bounce to that role's own home.
 * - Session still resolving → render nothing (brief).
 *
 * This is UX only; the Spring API independently enforces every rule.
 */
export function RequireRole({
  allow, loginHash = '#/login', children,
}: {
  allow: string[]
  loginHash?: string
  children: ReactNode
}) {
  const { user } = useAuth()
  const hasToken = !!tokenStore.access
  const allowed = user != null && allow.includes(user.role)

  useEffect(() => {
    if (!hasToken) { location.hash = loginHash; return }
    if (user != null && !allowed) { location.hash = roleHome(user.role) }
  }, [hasToken, user, allowed, loginHash])

  if (!hasToken) return null
  if (user == null) {
    return <div className="im-app" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', color: 'var(--muted)' }}>Loading…</div>
  }
  if (!allowed) return null
  return <>{children}</>
}
