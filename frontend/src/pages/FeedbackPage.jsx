import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CircularProgress from '../components/CircularProgress'
import StrengthGapCard from '../components/StrengthGapCard'
import KeywordGapVisualizer from '../components/KeywordGapVisualizer'
import ScoreBreakdown from '../components/ScoreBreakdown'
import LoadingOverlay from '../components/LoadingOverlay'
import AnimatedGradientMesh from '../components/AnimatedGradientMesh'
import { getSession } from '../api/client'

export default function FeedbackPage() {
  const { sessionId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  // Initialize data synchronously from state or localStorage
  const getInitialData = () => {
    console.log('[DEBUG getInitialData] Called with:', {
      paramSessionId: sessionId,
      hasState: !!state,
      stateSessionId: state?.sessionId,
      storedSessionId: localStorage.getItem('rc_sessionId'),
    })
    if (state) {
      console.log('[DEBUG getInitialData] Using location.state:', state)
      return state
    }
    try {
      const stored = localStorage.getItem('rc_analysisData')
      const storedId = localStorage.getItem('rc_sessionId')
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log('[DEBUG getInitialData] Parsed localStorage data:', {
          parsedSessionId: parsed?.sessionId,
          paramSessionId: sessionId,
          matches: parsed?.sessionId === sessionId,
        })
        if (parsed && (parsed.sessionId === sessionId || !sessionId)) {
          console.log('[DEBUG getInitialData] Returning matched localStorage data.')
          return parsed
        } else {
          console.warn('[DEBUG getInitialData] MISMATCH! URL sessionId != stored sessionId:', {
            urlSessionId: sessionId,
            storedSessionId: parsed?.sessionId,
          })
        }
      } else {
        console.log('[DEBUG getInitialData] No rc_analysisData found in localStorage.')
      }
    } catch (e) {
      console.error('[DEBUG getInitialData] Error parsing stored session:', e)
    }
    return null
  }

  const [data, setData] = useState(getInitialData)
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState('')

  console.log('[DEBUG FeedbackPage Render]', {
    paramSessionId: sessionId,
    isLocationStatePopulated: !!state,
    storedRawDataExists: !!localStorage.getItem('rc_analysisData'),
    storedSessionId: localStorage.getItem('rc_sessionId'),
    currentDataSet: !!data,
    currentLoadingState: loading,
  })

  useEffect(() => {
    if (data) {
      setLoading(false)
      return
    }

    if (sessionId) {
      setLoading(true)
      getSession(sessionId)
        .then((res) => {
          setData(res)
          try {
            localStorage.setItem('rc_sessionId', res.sessionId)
            localStorage.setItem('rc_analysisData', JSON.stringify(res))
          } catch (e) {}
          setLoading(false)
        })
        .catch((err) => {
          console.error('Failed to fetch session:', err)
          setError('Session data not found. Please upload your resume again.')
          setLoading(false)
        })
    } else {
      setError('Session data not found. Please upload your resume again.')
      setLoading(false)
    }
  }, [sessionId])

  if (loading) return <LoadingOverlay visible message="Loading analysis…" />

  if (error || !data) return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AnimatedGradientMesh />
      <div className="glass-card p-10 max-w-lg w-full text-center space-y-6 shadow-glow-indigo border-indigo-500/20 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl mx-auto shadow-glow-indigo">
          📄
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-white">
            No Analysis Results <span className="text-gradient">Yet</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {error || "You haven't uploaded a resume for this session yet. Upload your PDF resume to unlock ATS scoring, skill-gap analysis, and tailored mock interviews."}
          </p>
        </div>
        <button className="btn-primary w-full py-3.5 text-sm" onClick={() => navigate('/')}>
          ✦ Analyze Resume Now
        </button>
      </div>
    </div>
  )

  const {
    atsScore = 70,
    formattingScore = atsScore,
    keywordMatchScore = atsScore,
    experienceRelevanceScore = atsScore,
    skillsAlignmentScore = atsScore,
    strengths = [],
    gaps = [],
    suggestions = [],
    jdKeywords = [],
    resumeKeywords = [],
  } = data

  return (
    <div className="page-enter relative min-h-screen">
      <AnimatedGradientMesh />
      <div className="page-wrapper w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-10">
        {/* Page title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            ✦ ATS SCORING & INSIGHTS
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight mb-2">
            Your Resume <span className="text-gradient">Analysis & ATS Score</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Detailed breakdown of your resume's formatting, keyword alignment, experience relevance, and actionable suggestions.
          </p>
        </div>

        {/* Top section: Score + Sub-Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* ATS Score card */}
          <div className="glass-card p-6 flex flex-col items-center justify-center md:col-span-1">
            <CircularProgress score={atsScore} />
          </div>

          {/* Sub-Score Breakdown */}
          <div className="md:col-span-2">
            <ScoreBreakdown
              formattingScore={formattingScore}
              keywordMatchScore={keywordMatchScore}
              experienceRelevanceScore={experienceRelevanceScore}
              skillsAlignmentScore={skillsAlignmentScore}
            />
          </div>
        </div>

        {/* Summary stats + Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Strengths', count: strengths.length, colour: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Gaps', count: gaps.length, colour: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
            { label: 'Tips', count: suggestions.length, colour: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          ].map((s) => (
            <div
              key={s.label}
              className={`glass-card p-4 flex flex-col items-center justify-center border ${s.bg}`}
            >
              <span className={`font-display text-4xl font-bold ${s.colour}`}>{s.count}</span>
              <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{s.label}</span>
            </div>
          ))}

          {/* ATS colour legend */}
          <div className="md:col-span-3 glass-card px-4 py-3 flex items-center gap-3 text-sm">
            <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-slate-400">
              ATS Score of <strong className={`${atsScore >= 75 ? 'text-emerald-400' : atsScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{atsScore}/100</strong> means
              {atsScore >= 75 ? ' your resume is likely to pass automated screening.' :
               atsScore >= 50 ? ' your resume may pass screening for some roles.' :
               ' your resume risks being filtered out by ATS systems.'}
            </span>
          </div>
        </div>

        {/* Strengths / Gaps / Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <StrengthGapCard title="Strengths" items={strengths} variant="strength" />
          </div>
          <div>
            <KeywordGapVisualizer
              gaps={gaps}
              jdKeywords={jdKeywords}
              resumeKeywords={resumeKeywords}
            />
          </div>
        </div>

        <div className="mb-10">
          <StrengthGapCard title="Suggestions to Improve" items={suggestions} variant="suggestion" />
        </div>

        {/* CTA: Start Interview */}
        <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4
                        bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-indigo-500/20">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Ready to interview?</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Get 5 tailored questions based on your resume and answer them live.
            </p>
          </div>
          <button
            id="start-interview-btn"
            onClick={() => navigate(`/interview/${sessionId}`, { state: data })}
            className="btn-primary shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Start Mock Interview
          </button>
        </div>
      </div>
    </div>
  )
}
