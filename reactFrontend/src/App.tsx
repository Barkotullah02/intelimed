import { useState, useEffect, useRef, type ReactNode } from 'react'
import './App.css'

/* ============================================================
   SVG ICONS (inline, no external dependency)
   ============================================================ */
const Icons = {
  ShieldCheck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Pill: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
      <path d="m8.5 8.5 7 7"/>
    </svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  Info: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Brain: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
      <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
      <path d="M6 18a4 4 0 0 1-1.967-.516"/>
      <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  ),
  ClipboardCheck: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="m9 14 2 2 4-4"/>
    </svg>
  ),
  ShieldAlert: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  ),
  BellRing: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      <path d="M4 2C2.8 3.7 2 5.7 2 8"/><path d="M22 8c0-2.3-.8-4.3-2-6"/>
    </svg>
  ),
  Stethoscope: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
      <circle cx="20" cy="10" r="2"/>
    </svg>
  ),
  BookOpen: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Repeat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/>
      <path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

/* ============================================================
   HOOKS
   ============================================================ */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])

  return scrolled
}

/* ============================================================
   REUSABLE COMPONENTS
   ============================================================ */
function RevealDiv({ children, className = '', delay = 0 }: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useScrollReveal()
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : ''
  return (
    <div ref={ref} className={`reveal ${delayClass} ${className}`}>
      {children}
    </div>
  )
}

/* ============================================================
   LOGO
   ============================================================ */
function Logo({ white = false }: { white?: boolean }) {
  return (
    <a href="#" className="nav-logo" style={white ? { color: '#fff' } : undefined}>
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <rect width="36" height="36" rx="10" fill="url(#logo-grad)" />
        <path d="M18 8C18 8 12 14 12 20C12 23.3 14.7 26 18 26C21.3 26 24 23.3 24 20C24 14 18 8 18 8Z" fill="white" fillOpacity="0.9" />
        <circle cx="18" cy="19" r="3" fill="url(#logo-grad2)" fillOpacity="0.8" />
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36">
            <stop stopColor="#02c39a" />
            <stop offset="1" stopColor="#028090" />
          </linearGradient>
          <linearGradient id="logo-grad2" x1="15" y1="16" x2="21" y2="22">
            <stop stopColor="#02c39a" />
            <stop offset="1" stopColor="#00a896" />
          </linearGradient>
        </defs>
      </svg>
      IntelliMeds
    </a>
  )
}

/* ============================================================
   NAVBAR
   ============================================================ */
function Navbar() {
  const scrolled = useScrolled()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Logo />

        <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <li><a href="#home" onClick={() => setMobileOpen(false)}>Home</a></li>
          <li><a href="#drug-check" onClick={() => setMobileOpen(false)}>Drug Check</a></li>
          <li><a href="#about" onClick={() => setMobileOpen(false)}>About</a></li>
          <li><a href="#contact" onClick={() => setMobileOpen(false)}>Contact</a></li>
          <li><a href="#drug-check" className="nav-cta" onClick={() => setMobileOpen(false)}>Check Interactions</a></li>
        </ul>

        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <Icons.X /> : <Icons.Menu />}
        </button>
      </div>
    </nav>
  )
}

/* ============================================================
   FLOATING DECORATIONS
   ============================================================ */
function FloatingPills() {
  return (
    <>
      <div className="floating-pill" style={{ width: 80, height: 32, top: '15%', left: '8%', animationDuration: '18s', animationDelay: '0s' }} />
      <div className="floating-pill" style={{ width: 60, height: 24, top: '25%', right: '12%', animationDuration: '22s', animationDelay: '3s' }} />
      <div className="floating-pill" style={{ width: 50, height: 20, bottom: '30%', left: '15%', animationDuration: '20s', animationDelay: '6s' }} />
      <div className="floating-pill" style={{ width: 70, height: 28, bottom: '20%', right: '8%', animationDuration: '24s', animationDelay: '2s' }} />
      <div className="floating-pill" style={{ width: 40, height: 16, top: '60%', left: '5%', animationDuration: '16s', animationDelay: '8s' }} />
      <div className="floating-pill" style={{ width: 55, height: 22, top: '45%', right: '5%', animationDuration: '19s', animationDelay: '4s' }} />
    </>
  )
}

function MoleculeDecorations() {
  return (
    <>
      <div className="molecule-deco" style={{ top: '20%', right: '18%', animationDelay: '1s' }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="20" r="8" stroke="#02c39a" strokeWidth="1.5" fill="rgba(2,195,154,0.08)" />
          <circle cx="20" cy="55" r="6" stroke="#00a896" strokeWidth="1.5" fill="rgba(0,168,150,0.06)" />
          <circle cx="60" cy="55" r="6" stroke="#028090" strokeWidth="1.5" fill="rgba(2,128,144,0.06)" />
          <line x1="36" y1="26" x2="24" y2="50" stroke="#02c39a" strokeWidth="1" opacity="0.4" />
          <line x1="44" y1="26" x2="56" y2="50" stroke="#02c39a" strokeWidth="1" opacity="0.4" />
          <line x1="26" y1="55" x2="54" y2="55" stroke="#00a896" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>
      <div className="molecule-deco" style={{ bottom: '25%', left: '10%', animationDelay: '7s' }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="15" r="6" stroke="#028090" strokeWidth="1.5" fill="rgba(2,128,144,0.06)" />
          <circle cx="15" cy="45" r="5" stroke="#02c39a" strokeWidth="1.5" fill="rgba(2,195,154,0.06)" />
          <circle cx="45" cy="45" r="5" stroke="#00a896" strokeWidth="1.5" fill="rgba(0,168,150,0.06)" />
          <line x1="27" y1="20" x2="18" y2="40" stroke="#028090" strokeWidth="1" opacity="0.3" />
          <line x1="33" y1="20" x2="42" y2="40" stroke="#028090" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>
    </>
  )
}

/* ============================================================
   HERO SECTION
   ============================================================ */
function Hero() {
  const [drugA, setDrugA] = useState('')
  const [drugB, setDrugB] = useState('')
  const [checking, setChecking] = useState(false)

  const handleCheck = () => {
    if (!drugA.trim() || !drugB.trim()) {
      alert('Please enter both medications to check their interaction.')
      return
    }
    setChecking(true)
    setTimeout(() => {
      setChecking(false)
      alert(`Interaction check for "${drugA}" and "${drugB}" — This is a mockup. The full app will display detailed interaction analysis.`)
    }, 1800)
  }

  return (
    <section className="hero" id="home">
      <div className="hero-bg" />
      <div className="hero-mesh" />
      <FloatingPills />
      <MoleculeDecorations />

      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <Icons.ShieldCheck />
            Trusted by healthcare professionals
          </div>
          <h1>Know Your Medications.<br /><span>Stay Safe.</span></h1>
          <p className="hero-subtitle">
            Instantly check for dangerous drug interactions between any two medications.
            Powered by AI to give you clear, actionable guidance — before you take your next dose.
          </p>
          <div className="hero-trust">
            <div className="trust-item"><Icons.CheckCircle /> Evidence-based</div>
            <div className="trust-item"><Icons.CheckCircle /> AI-powered</div>
            <div className="trust-item"><Icons.CheckCircle /> 100% Free</div>
          </div>
        </div>

        <div className="drug-selector-card" id="drug-check">
          <div className="selector-header">
            <span className="selector-title">Drug Interaction Checker</span>
            <div className="selector-icon"><Icons.Pill /></div>
          </div>

          <div className="drug-inputs">
            <div className="drug-input-group">
              <label htmlFor="drug-a">Drug A</label>
              <div className="drug-input-wrapper">
                <input
                  id="drug-a"
                  type="text"
                  className="drug-input"
                  placeholder="e.g. Aspirin"
                  autoComplete="off"
                  value={drugA}
                  onChange={e => setDrugA(e.target.value)}
                />
                <Icons.Search />
              </div>
            </div>

            <div className="vs-badge">VS</div>

            <div className="drug-input-group">
              <label htmlFor="drug-b">Drug B</label>
              <div className="drug-input-wrapper">
                <input
                  id="drug-b"
                  type="text"
                  className="drug-input"
                  placeholder="e.g. Ibuprofen"
                  autoComplete="off"
                  value={drugB}
                  onChange={e => setDrugB(e.target.value)}
                />
                <Icons.Search />
              </div>
            </div>
          </div>

          <button className="check-btn" onClick={handleCheck} disabled={checking}>
            {checking ? (
              <>
                <span className="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <Icons.Activity />
                Check Interaction
              </>
            )}
          </button>

          <div className="selector-footer">
            <Icons.Info />
            Results are for informational purposes only. Always consult your doctor.
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   HOW IT WORKS
   ============================================================ */
function HowItWorks() {
  const steps = [
    { icon: <Icons.Search />, title: 'Select Your Medications', desc: 'Search and select two drugs from our comprehensive database of over 10,000 medications.' },
    { icon: <Icons.Brain />, title: 'AI Analyzes Interactions', desc: 'Our AI engine cross-references clinical data to detect potential drug-drug interactions instantly.' },
    { icon: <Icons.ClipboardCheck />, title: 'Get Safe Guidance', desc: 'Receive clear, actionable advice on what to do, what to avoid, and when to consult your doctor.' },
  ]

  return (
    <section className="how-it-works" id="about">
      <div className="section-inner">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">Three Steps to Safer Medications</h2>
        <p className="section-subtitle">
          No complicated forms. No medical jargon. Just enter your medications and get instant, clear answers.
        </p>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <RevealDiv key={i} delay={i} className="step-card">
              <div className="step-number">{i + 1}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </RevealDiv>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FEATURES
   ============================================================ */
function Features() {
  const features = [
    { icon: <Icons.ShieldAlert />, color: 'teal', title: 'Drug Interaction Checker', desc: 'Detect harmful interactions between any two medications before they cause problems. Updated with the latest clinical data.' },
    { icon: <Icons.Sparkles />, color: 'dark', title: 'AI-Powered Explanations', desc: 'Complex medical interactions explained in plain language. Understand severity levels, timing, and what actions to take.' },
    { icon: <Icons.BellRing />, color: 'secondary', title: 'Medication Reminders', desc: 'Set up smart reminders for your medications. Never miss a dose and maintain proper spacing between drugs.' },
    { icon: <Icons.Stethoscope />, color: 'dark', title: 'Doctor Consultations', desc: 'Connect with licensed healthcare professionals for personalized advice on your medication regimen.' },
    { icon: <Icons.BookOpen />, color: 'teal', title: 'Patient Education', desc: 'Access a library of easy-to-understand articles about your medications, side effects, and best practices.' },
    { icon: <Icons.Repeat />, color: 'secondary', title: 'Drug Alternatives', desc: 'If an interaction is detected, explore safer alternative medications suggested by our AI recommendation engine.' },
  ]

  return (
    <section className="features">
      <div className="section-inner">
        <div className="section-label">Features</div>
        <h2 className="section-title">Everything You Need for Medication Safety</h2>
        <p className="section-subtitle">
          Comprehensive tools designed to keep you informed and protected throughout your medication journey.
        </p>

        <div className="features-grid">
          {features.map((f, i) => (
            <RevealDiv key={i} delay={i} className="feature-card">
              <div className={`feature-icon ${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </RevealDiv>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   STATS
   ============================================================ */
function Stats() {
  const stats = [
    { number: '500+', label: 'Drug Interactions Checked' },
    { number: '10K+', label: 'Medications in Database' },
    { number: '98%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'Always Available' },
  ]

  return (
    <section className="stats">
      <div className="stats-grid">
        {stats.map((s, i) => (
          <RevealDiv key={i} delay={i} className="stat-item">
            <div className="stat-number">{s.number}</div>
            <div className="stat-label">{s.label}</div>
          </RevealDiv>
        ))}
      </div>
    </section>
  )
}

/* ============================================================
   CTA
   ============================================================ */
function CtaSection() {
  return (
    <section className="cta-section">
      <div className="cta-inner">
        <h2 className="section-title">Ready to Check Your Medications?</h2>
        <p className="section-subtitle">
          Don't leave your health to chance. Get instant, AI-powered interaction analysis in seconds.
        </p>
        <button
          className="cta-btn"
          onClick={() => document.getElementById('drug-check')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Icons.ArrowRight />
          Start Checking Now
        </button>
      </div>
    </section>
  )
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo white />
            <p>Making medication safety accessible to everyone. AI-powered drug interaction detection for patients, caregivers, and healthcare professionals.</p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#drug-check">Drug Check</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Drug Database</a></li>
              <li><a href="#">Interaction Guide</a></li>
              <li><a href="#">Patient Education</a></li>
              <li><a href="#">For Doctors</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Accessibility</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-disclaimer">
          <p className="disclaimer-text">
            <strong>Medical Disclaimer:</strong> IntelliMeds provides information for educational purposes only.
            It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
          <span className="footer-bottom">&copy; 2026 IntelliMeds. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

/* ============================================================
   APP
   ============================================================ */
function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Stats />
      <CtaSection />
      <Footer />
    </>
  )
}

export default App
