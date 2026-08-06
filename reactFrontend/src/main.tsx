import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import AppRoot from './app/AppRoot.tsx'
import './index.css'

const APP_PREFIXES = ['#/login', '#/register', '#/app', '#/admin', '#/mobile']
const isAppRoute = (h: string) => APP_PREFIXES.some((p) => h.startsWith(p))

function Root() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return isAppRoute(hash) ? <AppRoot /> : <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
