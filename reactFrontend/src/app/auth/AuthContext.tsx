import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../../api/services'
import { tokenStore } from '../../api/client'
import type { CurrentUser } from '../../api/types'

import type { ProfessionalDetails } from '../../api/types'

type AuthState = {
  user: CurrentUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<CurrentUser | null>
  register: (
    name: string, email: string, password: string, role: string,
    professional?: ProfessionalDetails,
  ) => Promise<CurrentUser | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

/** Where each role lands after authenticating. */
export function roleHome(role: string | undefined): string {
  switch (role) {
    case 'ROLE_ADMIN': return '#/admin/dashboard'
    case 'ROLE_HEALTHCARE_PROFESSIONAL': return '#/doctor/dashboard'
    default: return '#/app/dashboard'
  }
}

function messageFrom(e: unknown): string {
  if (typeof e === 'object' && e !== null) {
    const anyE = e as { response?: { data?: { message?: string } }; message?: string }
    return anyE.response?.data?.message ?? anyE.message ?? 'Something went wrong'
  }
  return 'Something went wrong'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore a session if a token is already stored.
  useEffect(() => {
    if (!tokenStore.access) return
    authApi.me().then(setUser).catch(() => tokenStore.clear())
  }, [])

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    error,
    async login(email, password) {
      setLoading(true); setError(null)
      try {
        await authApi.login(email, password)
        const me = await authApi.me()
        setUser(me)
        return me
      } catch (e) { setError(messageFrom(e)); return null } finally { setLoading(false) }
    },
    async register(name, email, password, role, professional) {
      setLoading(true); setError(null)
      try {
        await authApi.register(name, email, password, role, professional)
        const me = await authApi.me()
        setUser(me)
        return me
      } catch (e) { setError(messageFrom(e)); return null } finally { setLoading(false) }
    },
    async logout() {
      // Clearing local tokens is what matters; never let a failed server call block sign-out.
      try { await authApi.logout() } catch { /* ignore */ }
      setUser(null)
    },
  }), [user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
