import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AccordionItem from '../components/AccordionItem'
import CircularProgress from '../components/CircularProgress'
import LoadingOverlay from '../components/LoadingOverlay'
import AnimatedGradientMesh from '../components/AnimatedGradientMesh'
import { getInterviewSummary } from '../api/client'

export default function SummaryPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const result = await getInterviewSummary(sessionId)
        if (!cancelled) { setData(result); setLoading(false) }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'Failed to load summary.')
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [sessionId])

  if (loading) return <LoadingOverlay visible message="Building your results…" />

  if (error) return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AnimatedGradientMesh />
      <div className="glass-card p-10 max-w-lg w-full text-center space-y-6 shadow-glow-indigo border-indigo-500/20 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl mx-auto shadow-glow-indigo">
          🏆
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-white">
            No Summary <span className="text-gradient">Available Yet</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {error || 'Complete a mock interview session to view your detailed performance summary and recruiter recommendations.'}
          </p>
        </div>
        <button className="btn-primary w-full py-3.5 text-sm" onClick={() => navigate('/')}>
          ✦ Analyze Resume Now
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
    overallScore >= 8 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' :
    overallScore >= 6 ? 'text-amber-400 border-amber-500/30 bg-amber-500/5' :
                        'text-rose-400 border-rose-500/30 bg-rose-500/5'

  const handlePrint = () => window.print()

  return (
    <div className="page-enter relative min-h-screen">
      <AnimatedGradientMesh />
      <div className="page-wrapper w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
              ✦ INTERVIEW SUMMARY REPORT
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-1">
              Interview Performance <span className="text-gradient">Summary</span> 🎉
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Detailed review of your answer evaluations, scoring metrics, and recruiter recommendations.
            </p>
          </div>
          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="btn-secondary text-xs gap-1.5 py-2.5 px-4 shrink-0 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Print Report
          </button>
        </div>

        {/* Overall score hero */}
        <div className="glass-card p-8 mb-6 flex flex-col sm:flex-row items-center gap-8
                        bg-gradient-to-br from-navy-800/80 to-navy-700/40 animate-slide-up animation-fill-both">
          {/* Circular ring — remap 0-10 score to 0-100 for the ring */}
          <CircularProgress
            score={overallPct}
            label="Interview Score"
            size={160}
          />

          <div className="flex-1 text-center sm:text-left">
            <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-3 ${overallColour}`}>
              <span className="text-sm font-semibold font-display">{overallLabel}</span>
              <span className="text-sm font-mono font-bold">{overallScore.toFixed(1)}/10</span>
            </div>

            <h2 className="font-display text-xl font-semibold text-white mb-3">
              Overall Recommendation
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm">
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
                <div className="mt-4 flex flex-wrap gap-3">
                  {Object.entries(byCategory).map(([cat, scores]) => {
                    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
                    const badgeClass =
                      cat === 'technical'  ? 'badge-technical' :
                      cat === 'behavioral' ? 'badge-behavioral' : 'badge-role-fit'
                    return (
                      <div key={cat} className={`${badgeClass} gap-1.5 py-1 px-2.5`}>
                        <span className="capitalize">{cat}</span>
                        <span className="font-bold">{avg.toFixed(1)}</span>
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
                className="animate-slide-up animation-fill-both"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <AccordionItem item={item} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/5">
          <button
            id="try-another-btn"
            onClick={() => navigate('/')}
            className="btn-primary w-full sm:w-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Try Another Resume
          </button>
          <p className="text-xs text-slate-600 text-center sm:text-left">
            Your session data will be cleared when you start a new upload.
          </p>
        </div>
      </div>
    </div>
  )
}
