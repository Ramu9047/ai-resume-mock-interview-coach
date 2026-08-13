import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import AccordionItem from '../components/AccordionItem'
import CircularProgress from '../components/CircularProgress'
import LoadingOverlay from '../components/LoadingOverlay'
import { getInterviewSummary } from '../api/client'

export default function SummaryPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      // 1. Prioritize state passed directly from InterviewPage session
      if (location.state?.breakdown && location.state.breakdown.length > 0) {
        const breakdown = location.state.breakdown
        const total = breakdown.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0)
        const overallScore = Math.round((total / breakdown.length) * 10) / 10

        let recommendation = 'Candidate demonstrates strong technical depth and clear communication skills.'
        if (overallScore < 4.0) {
          recommendation = 'Candidate provided minimal or insufficient responses. Significant technical preparation, structured practice, and mock interviews are recommended before interviewing for this role.'
        } else if (overallScore < 6.5) {
          recommendation = 'Candidate demonstrated basic technical awareness but requires more structured answers with concrete STAR-method impact metrics.'
        }

        if (!cancelled) {
          setData({ overallScore, recommendation, breakdown })
          setLoading(false)
        }
        return
      }

      // 2. Fetch from backend API
      try {
        const result = await getInterviewSummary(sessionId)
        if (!cancelled) { setData(result); setLoading(false) }
      } catch (err) {
        if (!cancelled) {
          setError('No completed interview data found for this session.')
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [sessionId, location.state])

  if (loading) return <LoadingOverlay visible />

  if (error) return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-[#0A0A0B]">
      <div className="p-8 max-w-md w-full text-center space-y-6 border border-[#26262B] shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-lg bg-[#131316]">
        <div className="w-12 h-12 rounded bg-[#1B1B1F] border border-[#26262B] flex items-center justify-center text-xl text-[#F04438] mx-auto">
          🏆
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-[#F5F5F3]">
            No Summary Available
          </h2>
          <p className="text-[#8A8A8F] text-xs leading-relaxed font-sans">
            {error || 'Complete a mock interview session to view your detailed performance summary and recruiter recommendations.'}
          </p>
        </div>
        <button className="btn-primary w-full py-3 text-xs uppercase font-bold tracking-wider" onClick={() => navigate('/')}>
          ✦ Analyze Resume Signals
        </button>
      </div>
    </div>
  )

  const { overallScore = 0, breakdown = [], recommendation = '' } = data
  const overallPct = Math.round((overallScore / 10) * 100)

  const overallLabel =
    overallScore >= 8 ? 'Outstanding' :
    overallScore >= 6 ? 'Good' :
    overallScore >= 4 ? 'Needs Work' : 'Poor'

  const overallColour =
    overallScore >= 8 ? 'text-[#FF5A1F] border-[#FF5A1F]/30 bg-[#FF5A1F]/10' :
    overallScore >= 6 ? 'text-[#F5A623] border-[#F5A623]/30 bg-[#F5A623]/10' :
                        'text-[#F04438] border-[#F04438]/30 bg-[#F04438]/10'

  const handlePrint = () => window.print()

  return (
    <div className="page-enter relative min-h-screen bg-[#0A0A0B] bg-noise">
      <div className="page-wrapper w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="credential-line text-[#FF5A1F] mb-2 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
              <span>INTERVIEW SUMMARY REPORT</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#F5F5F3] tracking-tight mb-1">
              Interview Performance Report
            </h1>
            <p className="text-[#8A8A8F] text-sm sm:text-base font-sans">
              Detailed review of your answer evaluations, scoring metrics, and recruiter recommendations.
            </p>
          </div>
          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="btn-secondary text-xs gap-1.5 py-2 px-4 shrink-0 self-start sm:self-auto shadow-xs"
          >
            <svg className="w-4 h-4 text-[#8A8A8F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Print Report
          </button>
        </div>

        {/* Overall score hero with Signal Bars ATS score visualization */}
        <div className="p-8 mb-6 flex flex-col sm:flex-row items-center gap-8
                        bg-[#131316] border border-[#26262B] shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg border-t-2 border-t-[#FF5A1F] animate-slide-up">
          {/* Signal Bars Visualization */}
          <div className="w-full sm:w-72">
            <CircularProgress
              score={overallPct}
              label="OVERALL INTERVIEW SIGNAL"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className={`inline-flex items-center gap-2 border px-3 py-1 mb-3 rounded shadow-xs ${overallColour}`}>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider">{overallLabel}</span>
              <span className="text-xs font-mono font-bold">{overallScore.toFixed(1)}/10</span>
            </div>

            <h2 className="font-display text-2xl font-bold text-[#F5F5F3] mb-2">
              Overall Recruiter Recommendation
            </h2>
            <p className="text-[#8A8A8F] leading-relaxed text-sm font-sans font-medium">
              {recommendation}
            </p>

            {/* Per-category breakdown */}
            {breakdown.length > 0 && (() => {
              const byCategory = breakdown.reduce((acc, item) => {
                const cat = item.category ?? 'other'
                if (!acc[cat]) acc[cat] = []
                acc[cat].push(item.score)
                return acc
              }, {})
              return (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(byCategory).map(([cat, scores]) => {
                    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
                    const badgeClass =
                      cat === 'technical'  ? 'badge-technical' :
                      cat === 'behavioral' ? 'badge-behavioral' : 'badge-role-fit'
                    return (
                      <div key={cat} className={`${badgeClass} gap-1.5 py-1 px-2.5 shadow-xs`}>
                        <span className="capitalize">{cat}</span>
                        <span className="font-bold font-mono">{avg.toFixed(1)}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Q&A Breakdown */}
        <div className="mb-8">
          <h2 className="section-title">Question-by-Question Breakdown</h2>
          <div className="space-y-3">
            {breakdown.map((item, i) => (
              <div
                key={i}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <AccordionItem item={item} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#26262B]">
          <button
            id="try-another-btn"
            onClick={() => navigate('/')}
            className="btn-primary w-full sm:w-auto uppercase tracking-wide font-bold text-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Try Another Resume
          </button>
          <p className="text-xs text-[#8A8A8F] font-mono font-medium text-center sm:text-left">
            Session data is cleared upon starting a new analysis.
          </p>
        </div>
      </div>
    </div>
  )
}
