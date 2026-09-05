import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { ApiEnvelope, AuthResponse } from './types'

export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8080/api'

const ACCESS_KEY = 'im_access'
const REFRESH_KEY = 'im_refresh'

export const tokenStore = {
  get access() { return localStorage.getItem(ACCESS_KEY) },
  get refresh() { return localStorage.getItem(REFRESH_KEY) },
  set(auth: Pick<AuthResponse, 'accessToken' | 'refreshToken'>) {
    localStorage.setItem(ACCESS_KEY, auth.accessToken)
    localStorage.setItem(REFRESH_KEY, auth.refreshToken)
  },
  clear() { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY) },
}

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the bearer token to every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.access
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, try a one-shot refresh, then replay the original request.
let refreshing: Promise<string | null> | null = null
async function doRefresh(): Promise<string | null> {
  const refresh = tokenStore.refresh
  if (!refresh) return null
  try {
    const res = await axios.post<ApiEnvelope<AuthResponse>>(`${API_BASE}/auth/refresh-token`, { refreshToken: refresh })
    tokenStore.set(res.data.data)
    return res.data.data.accessToken
  } catch {
    tokenStore.clear()
    return null
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      refreshing ??= doRefresh().finally(() => { refreshing = null })
      const newToken = await refreshing
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
    }
    return Promise.reject(error)
  },
)

/** Unwrap the `{ success, message, data }` envelope down to `data`. */
export async function unwrap<T>(p: Promise<AxiosResponse<ApiEnvelope<T>>>): Promise<T> {
  const res = await p
  if (!res.data.success) throw new Error(res.data.message || 'Request failed')
  return res.data.data
}
