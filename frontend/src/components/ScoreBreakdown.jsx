import { motion } from 'framer-motion'
import CircularProgress from './CircularProgress'

/**
 * Score Breakdown component displaying individual sub-scores
 * (Formatting, Keyword Match, Experience Relevance, Skills Alignment)
 * alongside the overall ATS score using mini circular progress rings.
 */
export default function ScoreBreakdown({
  formattingScore,
  keywordMatchScore,
  experienceRelevanceScore,
  skillsAlignmentScore,
  loading = false,
}) {
  const isLoading =
    loading ||
    formattingScore === undefined ||
    formattingScore === null

  const metrics = [
    { label: 'Formatting', desc: 'Structure & Readability', score: formattingScore ?? 75, icon: '📄' },
    { label: 'Keyword Match', desc: 'JD Term Overlap', score: keywordMatchScore ?? 70, icon: '🔑' },
    { label: 'Experience Rel.', desc: 'Role Alignment', score: experienceRelevanceScore ?? 80, icon: '💼' },
    { label: 'Skills Alignment', desc: 'Tech & Soft Skills', score: skillsAlignmentScore ?? 78, icon: '⚡' },
  ]

  function getScoreBadge(val) {
    if (val >= 75) return { label: 'Strong', border: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' }
    if (val >= 50) return { label: 'Moderate', border: 'border-amber-500/20 bg-amber-500/10 text-amber-400' }
    return { label: 'Needs Work', border: 'border-rose-500/20 bg-rose-500/10 text-rose-400' }
  }

  return (
    <div className="glass-card p-5 h-full flex flex-col justify-between hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
          <span>📊</span>
          Sub-Score Breakdown
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">0–100 Scale</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((item, idx) => {
          if (isLoading) {
            return (
              <div
                key={item.label}
                className="bg-navy-900/60 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-between text-center animate-pulse"
              >
                <div className="h-3.5 w-16 bg-navy-800 rounded mb-2" />
                <div className="w-[68px] h-[68px] rounded-full bg-navy-800/80 border border-white/5 my-1" />
                <div className="h-4 w-12 bg-navy-800 rounded mt-2" />
              </div>
            )
          }

          const badge = getScoreBadge(item.score)
          return (
            <div
              key={item.label}
              className="bg-navy-900/60 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-between text-center group hover:border-indigo-500/30 transition-all duration-200"
            >
              <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-200">
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>

              <div className="my-1">
                <CircularProgress score={item.score} size={68} stroke={6} label="" />
              </div>

              <span className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${badge.border}`}>
                {badge.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
