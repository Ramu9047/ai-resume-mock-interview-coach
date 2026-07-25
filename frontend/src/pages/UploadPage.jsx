import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DropZone from '../components/DropZone'
import LoadingOverlay from '../components/LoadingOverlay'
import AnimatedGradientMesh from '../components/AnimatedGradientMesh'
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
      // Persist sessionId and analysis data so pages and builder can pre-fill
      localStorage.setItem('rc_sessionId', data.sessionId)
      localStorage.setItem('rc_analysisData', JSON.stringify(data))
      navigate(`/feedback/${data.sessionId}`, { state: data })
    } catch (err) {
      console.error('Resume Analysis Error:', err)
      const detail = err?.response?.data?.detail ?? err?.response?.data?.message
      setError(detail || "We couldn't analyze your resume right now. Please try again in a moment.")
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingOverlay visible={loading} message="Analyzing your resume…" />

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 page-enter relative">
        <AnimatedGradientMesh />
        {/* Hero headline */}
        <div className="text-center mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20
                          text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered · Groq LLaMA 3.3 70B
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-5">
            Land your{' '}
            <span className="gradient-text">dream role</span>
            <br />with AI coaching
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Upload your resume for instant ATS scoring, skill-gap analysis,
            and a personalised mock interview — all in under two minutes.
          </p>
        </div>

        {/* Upload card */}
        <div className="w-full max-w-2xl glass-card p-8 space-y-6">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center font-display">1</span>
              <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Upload Resume (PDF)</p>
            </div>
            <DropZone file={file} onFile={setFile} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-slate-600 uppercase tracking-widest">Optional</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-navy-700 text-slate-500 text-xs font-bold flex items-center justify-center font-display">2</span>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Paste Job Description</p>
            </div>
            <textarea
              id="job-description"
              className="input-base h-36"
              placeholder="Paste the job description here to get tailored ATS analysis and interview questions that match the role…"
              value={jd}
              onChange={e => setJd(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <div id="upload-error" className="flex items-start gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 animate-fade-in">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="btn-primary w-full py-4 text-base"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Analyze Resume
          </button>

          <p className="text-center text-xs text-slate-600">
            Your resume is never stored permanently. Sessions expire automatically.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10 max-w-lg">
          {['ATS Score', 'Skill Gap Analysis', 'Mock Interview', 'Answer Scoring', 'Career Suggestions'].map(f => (
            <span key={f} className="text-xs text-slate-500 border border-white/8 px-3 py-1.5 rounded-full bg-white/2">
              {f}
            </span>
          ))}
          <button
            onClick={() => navigate('/builder')}
            className="text-xs text-indigo-400 border border-indigo-500/30 bg-indigo-500/8
                       hover:bg-indigo-500/15 hover:border-indigo-500/50 px-3 py-1.5 rounded-full
                       transition-all duration-200 font-medium"
          >
            ✦ Resume Builder
          </button>
        </div>
      </div>
    </>
  )
}
