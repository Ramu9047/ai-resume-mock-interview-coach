import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FlagLogoMark from './FlagLogoMark'
import HowItWorksModal from './HowItWorksModal'

export default function Footer() {
  const location = useLocation()
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)
  const [activeLegalModal, setActiveLegalModal] = useState(null) // 'privacy' | 'terms' | null

  // Hide footer on unlisted internal admin page
  if (location.pathname.includes('/admin')) {
    return null
  }

  return (
    <>
      <footer className="w-full bg-[#070708] border-t border-[#26262B] text-[#8A8A8F] pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Main 4-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#1F1F24]">
            
            {/* Column 1: Brand Logo & Description */}
            <div className="space-y-4">
              <Link
                to="/"
                className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight text-[#F5F5F3] hover:opacity-90 transition-opacity group"
              >
                <FlagLogoMark size={28} className="group-hover:scale-105 transition-transform shadow-xs" />
                <span>
                  ResumeCoach <span className="text-[#FF5A1F] font-mono text-xs font-bold">AI</span>
                </span>
              </Link>
              <p className="text-xs leading-relaxed text-[#8A8A8F] font-sans">
                AI-powered personal career & resume coach. Track ATS scores, analyze job descriptions, practice live mock interviews, and build print-ready resumes — all in one place.
              </p>
            </div>

            {/* Column 2: Key Features */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#F5F5F3]">
                KEY FEATURES
              </h3>
              <ul className="space-y-2 text-xs font-sans">
                {[
                  'Smart ATS Signal Scoring & Insights',
                  'Instant Resume PDF Parser',
                  'Interactive Mock Interview Coach',
                  'AI Bullet Point Optimizer',
                  'Modern Print-Ready Layouts',
                  'Data Privacy & Security Controls',
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[#8A8A8F] hover:text-[#F5F5F3] transition-colors">
                    <svg className="w-3 h-3 text-[#FF5A1F] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Support & Legal */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#F5F5F3]">
                SUPPORT & LEGAL
              </h3>
              <ul className="space-y-2 text-xs font-sans">
                <li>
                  <button
                    onClick={() => setHowItWorksOpen(true)}
                    className="hover:text-[#F5F5F3] transition-colors text-left cursor-pointer flex items-center gap-1.5 group"
                  >
                    <span className="text-[#8A8A8F] group-hover:text-[#FF5A1F] transition-colors font-mono">›</span>
                    <span>Help & How It Works</span>
                  </button>
                </li>
                <li>
                  <Link to="/" className="hover:text-[#F5F5F3] transition-colors flex items-center gap-1.5 group">
                    <span className="text-[#8A8A8F] group-hover:text-[#FF5A1F] transition-colors font-mono">›</span>
                    <span>ATS Resume Analyzer</span>
                  </Link>
                </li>
                <li>
                  <Link to="/builder" className="hover:text-[#F5F5F3] transition-colors flex items-center gap-1.5 group">
                    <span className="text-[#8A8A8F] group-hover:text-[#FF5A1F] transition-colors font-mono">›</span>
                    <span>AI Resume Builder</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('privacy')}
                    className="hover:text-[#F5F5F3] transition-colors text-left cursor-pointer flex items-center gap-1.5 group"
                  >
                    <span className="text-[#8A8A8F] group-hover:text-[#FF5A1F] transition-colors font-mono">›</span>
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('terms')}
                    className="hover:text-[#F5F5F3] transition-colors text-left cursor-pointer flex items-center gap-1.5 group"
                  >
                    <span className="text-[#8A8A8F] group-hover:text-[#FF5A1F] transition-colors font-mono">›</span>
                    <span>Terms of Service</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Security & Trust */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#F5F5F3]">
                SECURITY & TRUST
              </h3>
              <div className="space-y-3 text-xs font-sans">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-[#34C77B]/10 border border-[#34C77B]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#34C77B]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5F5F3] text-xs">SSL/TLS Transmit Security</h4>
                    <p className="text-[11px] text-[#8A8A8F]">Encrypted REST API communication</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-[#34C77B]/10 border border-[#34C77B]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#34C77B]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5F5F3] text-xs">Zero Career Data Selling</h4>
                    <p className="text-[11px] text-[#8A8A8F]">Resumes & personal info are never shared</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-[#34C77B]/10 border border-[#34C77B]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#34C77B]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5F5F3] text-xs">Local Browser Storage</h4>
                    <p className="text-[11px] text-[#8A8A8F]">Scores & draft resumes stay on your device</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-[#34C77B]/10 border border-[#34C77B]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#34C77B]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5F5F3] text-xs">Ephemeral AI Evaluation</h4>
                    <p className="text-[11px] text-[#8A8A8F]">Data processed securely without model training</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
            <p className="text-[#8A8A8F]">
              © {new Date().getFullYear()} ResumeCoach AI. All rights reserved.
            </p>
            <p className="text-[#F5F5F3] font-bold tracking-wide flex items-center gap-1.5">
              <span>Designed & Developed By</span>
              <span className="text-[#FF5A1F] font-extrabold uppercase font-display tracking-wider">RAMAKRISHNAN S</span>
            </p>
          </div>
        </div>
      </footer>

      {/* How It Works Modal */}
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />

      {/* Legal Modals */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0B]/85 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#131316] border border-[#26262B] p-6 rounded-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#26262B] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F5F5F3]">
                {activeLegalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="text-[#8A8A8F] hover:text-[#F5F5F3] font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-[#8A8A8F] leading-relaxed space-y-2 max-h-60 overflow-y-auto font-sans">
              {activeLegalModal === 'privacy' ? (
                <>
                  <p>At ResumeCoach AI, your privacy is our top priority. We process resume data locally in your browser and temporarily via secure AI endpoints to generate feedback and ATS scores.</p>
                  <p>We do not sell, rent, or monetize user career data or personal details. All session files are automatically cleaned up.</p>
                </>
              ) : (
                <>
                  <p>By using ResumeCoach AI, you agree to submit valid resume information for personal career preparation purposes.</p>
                  <p>The AI-generated ATS scores, mock interview questions, and feedback are for guidance and self-improvement.</p>
                </>
              )}
            </div>
            <div className="pt-3 border-t border-[#26262B] flex justify-end">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="btn-primary text-xs py-1.5 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
