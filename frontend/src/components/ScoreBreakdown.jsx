import { motion } from 'framer-motion'

/**
 * Sub-Score Breakdown Matrix component for Precision Dark Linear Theme.
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
    if (val >= 75) return { label: 'Strong', border: 'border-[#FF5A1F]/30 bg-[#FF5A1F]/10 text-[#FF5A1F]' }
    if (val >= 50) return { label: 'Moderate', border: 'border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]' }
    return { label: 'Needs Work', border: 'border-[#F04438]/30 bg-[#F04438]/10 text-[#F04438]' }
  }

  return (
    <div className="bg-[#131316] border border-[#26262B] p-6 h-full flex flex-col justify-between rounded-lg border-t-2 border-t-[#FF5A1F] shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-4 border-b border-[#26262B] pb-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5A1F] flex items-center gap-2">
          <span>✦ SIGNAL BREAKDOWN MATRIX</span>
        </h3>
        <span className="text-[11px] text-[#8A8A8F] font-mono font-medium">0–100 Scale</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((item, idx) => {
          if (isLoading) {
            return (
              <div
                key={item.label}
                className="bg-[#1B1B1F] border border-[#26262B] rounded-md p-3.5 flex flex-col items-center justify-between text-center animate-pulse"
              >
                <div className="h-3.5 w-16 bg-[#26262B] rounded mb-2" />
                <div className="w-12 h-10 bg-[#26262B] rounded my-2" />
                <div className="h-4 w-12 bg-[#26262B] rounded mt-2" />
              </div>
            )
          }

          const badge = getScoreBadge(item.score)
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className="bg-[#1B1B1F] border border-[#26262B] rounded-md p-3.5 flex flex-col items-center justify-between text-center group hover:border-[#3D3D42] transition-all duration-150 shadow-xs"
            >
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#F5F5F3]">
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>

              {/* Sub-score JetBrains Mono Score */}
              <div className="font-mono text-2xl font-bold text-[#F5F5F3] my-1">
                {item.score}<span className="text-xs text-[#8A8A8F] font-normal">/100</span>
              </div>

              <span className={`mt-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${badge.border}`}>
                {badge.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
