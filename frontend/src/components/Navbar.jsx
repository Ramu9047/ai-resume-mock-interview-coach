import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HowItWorksModal from './HowItWorksModal'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)
  const [sessionInfo, setSessionInfo] = useState(null)

  // Do not render navbar on unlisted internal admin page
  if (location.pathname.includes('/admin')) {
    return null
  }

  // Check localStorage for previous session & ATS score
  useEffect(() => {
    const sessionId = localStorage.getItem('rc_sessionId')
    const rawData = localStorage.getItem('rc_analysisData')
    if (sessionId) {
      let score = null
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData)
          score = parsed.atsScore
        } catch (e) {
          console.error(e)
        }
      }
      setSessionInfo({ sessionId, score })
    }
  }, [location.pathname])

  const links = [
    { label: 'Analyze Resume', path: '/' },
    { label: 'Resume Builder', path: '/builder' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === ''
    return location.pathname.startsWith(path)
  }

  const handleMyResults = () => {
    let cachedData = null
    const raw = localStorage.getItem('rc_analysisData')
    if (raw) {
      try { cachedData = JSON.parse(raw) } catch(e) {}
    }
    navigate(`/feedback/${sessionInfo.sessionId}`, { state: cachedData })
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-navy-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo / Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white hover:opacity-90 transition-opacity group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-glow-indigo group-hover:scale-105 transition-transform">
              ✦
            </div>
            <span>
              ResumeCoach <span className="text-gradient">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-indigo-500/15 border border-indigo-500/40 rounded-xl shadow-glow-indigo -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}

            {/* My Results (if session exists) */}
            {sessionInfo && (
              <button
                onClick={handleMyResults}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
                  location.pathname.includes('/feedback')
                    ? 'text-white bg-indigo-500/20 border border-indigo-500/50 shadow-glow-indigo'
                    : 'text-slate-300 hover:text-white bg-navy-900 border border-white/8 hover:border-indigo-500/30'
                }`}
              >
                <span>My Results</span>
                {sessionInfo.score !== null && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    sessionInfo.score >= 75
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : sessionInfo.score >= 50
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {sessionInfo.score}/100
                  </span>
                )}
              </button>
            )}

            {/* How It Works Trigger */}
            <button
              onClick={() => setHowItWorksOpen(true)}
              className="ml-2 text-xs text-slate-400 hover:text-indigo-300 px-3 py-2 rounded-xl transition-colors font-medium flex items-center gap-1.5"
            >
              <span>❓</span> How It Works
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-xl border border-white/5 bg-navy-900/60"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden sticky top-16 z-30 bg-navy-950/95 border-b border-white/10 backdrop-blur-xl px-4 py-4 space-y-2 shadow-2xl"
          >
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {sessionInfo && (
              <button
                onClick={() => {
                  setMobileOpen(false)
                  handleMyResults()
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-navy-900 border border-white/10 flex items-center justify-between"
              >
                <span>My Results</span>
                {sessionInfo.score !== null && (
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {sessionInfo.score}/100
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => {
                setMobileOpen(false)
                setHowItWorksOpen(true)
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-300 hover:bg-indigo-500/10 flex items-center gap-2"
            >
              <span>❓</span> How It Works
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How It Works Modal */}
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </>
  )
}
