import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HowItWorksModal from './HowItWorksModal'
import FlagLogoMark from './FlagLogoMark'

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
      <header className="sticky top-0 z-40 w-full border-b border-[#26262B] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo / Wordmark in Archivo 800 */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight text-[#F5F5F3] hover:opacity-90 transition-opacity group"
          >
            <FlagLogoMark size={28} className="group-hover:scale-105 transition-transform shadow-xs" />
            <span>
              ResumeCoach <span className="text-[#FF5A1F] font-mono text-xs font-bold">AI</span>
            </span>
          </Link>

          {/* Quiet Monospace Credential Line (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono font-medium text-[#8A8A8F] bg-[#131316] px-3.5 py-1 rounded border border-[#26262B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
            <span>ENGINE · GROQ LLAMA 3.3 70B</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            {links.map((link) => {
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                    active ? 'text-[#FF5A1F] bg-[#1B1B1F] border border-[#26262B]' : 'text-[#8A8A8F] hover:text-[#F5F5F3] hover:bg-[#131316]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            {/* My Results (if session exists) */}
            {sessionInfo && (
              <button
                onClick={handleMyResults}
                className={`relative px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all duration-150 ${
                  location.pathname.includes('/feedback')
                    ? 'text-[#FF5A1F] bg-[#1B1B1F] border border-[#26262B]'
                    : 'text-[#F5F5F3] bg-[#131316] border border-[#26262B] hover:bg-[#1B1B1F]'
                }`}
              >
                <span>My Results</span>
                {sessionInfo.score !== null && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/30">
                    {sessionInfo.score}/100
                  </span>
                )}
              </button>
            )}

            {/* How It Works Trigger */}
            <button
              onClick={() => setHowItWorksOpen(true)}
              className="ml-1 text-xs text-[#8A8A8F] hover:text-[#F5F5F3] px-3.5 py-1.5 rounded-md transition-colors font-medium flex items-center gap-1.5 border border-transparent hover:border-[#26262B] hover:bg-[#131316]"
            >
              <span>❓</span> How It Works
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#F5F5F3] p-2 rounded-md border border-[#26262B] bg-[#131316]"
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
            transition={{ duration: 0.2 }}
            className="md:hidden sticky top-16 z-30 bg-[#0A0A0B] border-b border-[#26262B] px-4 py-4 space-y-2 shadow-lg"
          >
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'bg-[#1B1B1F] text-[#FF5A1F] border border-[#26262B]'
                    : 'text-[#8A8A8F] hover:text-[#F5F5F3] hover:bg-[#131316]'
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
                className="w-full text-left px-4 py-2.5 rounded-md text-sm font-semibold text-[#F5F5F3] bg-[#131316] border border-[#26262B] flex items-center justify-between"
              >
                <span>My Results</span>
                {sessionInfo.score !== null && (
                  <span className="text-xs font-mono font-bold text-[#FF5A1F]">
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
              className="w-full text-left px-4 py-2.5 rounded-md text-sm font-semibold text-[#FF5A1F] hover:bg-[#131316] flex items-center gap-2"
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
