import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DropZone from '../components/DropZone'
import LoadingOverlay from '../components/LoadingOverlay'
import { analyzeResume } from '../api/client'

export default function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!file) { setError('Please select a PDF resume first.'); return }
    setError('')
    setLoading(true)
    try {
      const data = await analyzeResume(file, jd)
      localStorage.setItem('rc_sessionId', data.sessionId)
      localStorage.setItem('rc_analysisData', JSON.stringify(data))
      navigate(`/feedback/${data.sessionId}`, { state: data })
    } catch (err) {
      console.error('Resume Analysis Error:', err)
      const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message
      if (err?.code === 'ERR_NETWORK' || !err?.response) {
        setError('Network Error: Unable to reach the backend server. Please verify VITE_API_BASE_URL and CORS settings.')
      } else {
        setError(detail || "We couldn't analyze your resume right now. Please try again in a moment.")
      }
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingOverlay visible={loading} />

      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 sm:py-16 page-enter relative overflow-hidden bg-[#0A0A0B] bg-noise">
        
        {/* Centered Hero Headline & Signal Scanner Badge */}
        <div className="text-center mb-10 max-w-3xl mx-auto relative z-10 flex flex-col items-center">
          
          {/* Custom ATS Signal Scanner Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#131316] border border-[#26262B] mb-6 shadow-xs">
            <div className="flex items-end gap-1 h-3.5">
              <motion.span animate={{ height: [6, 14, 8, 14] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} className="w-1 rounded-xs bg-[#FF5A1F]" />
              <motion.span animate={{ height: [12, 6, 14, 6] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} className="w-1 rounded-xs bg-[#FF5A1F]" />
              <motion.span animate={{ height: [5, 12, 7, 12] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }} className="w-1 rounded-xs bg-[#FF5A1F]" />
              <motion.span animate={{ height: [10, 5, 12, 5] }} transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }} className="w-1 rounded-xs bg-[#F5A623]" />
            </div>
            <span className="text-[11px] font-mono font-bold text-[#8A8A8F] uppercase tracking-wider">
              ATS Signal Analysis Engine
            </span>
          </div>

          {/* Archivo 800 High-Contrast Headline */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F5F5F3] leading-[1.05] mb-5 tracking-tight">
            Land your <span className="text-[#FF5A1F] inline-block">dream role</span> <br className="hidden sm:inline" />
            with precision AI coaching.
          </h1>

          <p className="text-[#8A8A8F] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-sans">
            Upload your resume for instant ATS signal scoring, skill-gap analysis,
            and tailored technical mock interviews — in under two minutes.
          </p>
        </div>

        {/* Upload Card */}
        <div className="w-full max-w-2xl bg-[#131316] border border-[#26262B] p-6 sm:p-8 space-y-6 relative z-10 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-lg">
          
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded bg-[#1B1B1F] text-[#FF5A1F] border border-[#26262B] text-[11px] font-mono font-bold flex items-center justify-center">1</span>
              <p className="text-xs font-bold text-[#F5F5F3] uppercase tracking-wider font-mono">Upload Resume (PDF)</p>
            </div>
            <DropZone file={file} onFile={setFile} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#26262B]" />
            <span className="text-[10px] text-[#8A8A8F] uppercase tracking-widest font-mono font-bold bg-[#1B1B1F] px-2.5 py-0.5 border border-[#26262B] rounded">
              Optional Job Match
            </span>
            <div className="flex-1 h-px bg-[#26262B]" />
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded bg-[#1B1B1F] text-[#8A8A8F] border border-[#26262B] text-[11px] font-mono font-bold flex items-center justify-center">2</span>
              <p className="text-xs font-bold text-[#8A8A8F] uppercase tracking-wider font-mono">Paste Job Description</p>
            </div>
            <textarea
              id="job-description"
              className="input-base h-32 text-xs leading-relaxed"
              placeholder="Paste target job posting details to enable keyword overlap matching & tailored interview questions… (Press Enter to analyze, Shift+Enter for new line)"
              value={jd}
              onChange={e => setJd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) return
                  e.preventDefault()
                  if (file && !loading) {
                    handleAnalyze()
                  }
                }
              }}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <div id="upload-error" className="flex items-start gap-2 text-xs text-[#F04438] bg-[#F04438]/10 border border-[#F04438]/30 rounded-md px-4 py-3 animate-fade-in font-bold font-mono">
              <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#F04438]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* CTA Button: Solid Ignite Orange-Red */}
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="btn-primary w-full py-3.5 text-sm font-bold tracking-wide uppercase"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Analyze Resume Signals
          </button>

          <p className="text-center text-[11px] text-[#8A8A8F] font-mono">
            🔒 Private & ephemeral. Session data is automatically purged.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-10 max-w-lg relative z-10">
          {['Signal Bars Score', 'Keyword Gap Analysis', 'Mock Interview', 'Answer Evaluation', 'Career Guidance'].map(f => (
            <span key={f} className="text-[11px] font-mono text-[#8A8A8F] border border-[#26262B] px-3 py-1 rounded bg-[#131316]">
              {f}
            </span>
          ))}
          <button
            onClick={() => navigate('/builder')}
            className="text-[11px] font-mono text-[#F5F5F3] bg-[#1B1B1F] border border-[#26262B]
                       hover:border-[#FF5A1F] px-3.5 py-1 rounded
                       transition-all duration-150 font-bold flex items-center gap-1 shadow-xs hover:scale-105"
          >
            ✦ Resume Builder →
          </button>
        </div>
      </div>
    </>
  )
}
