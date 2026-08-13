import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Replaces the plain-text "Gaps to Address" pill list on FeedbackPage.
 *
 * Chip sizing is based on how often the keyword appears in the JD:
 *   lg (≥4 occurrences): px-4 py-2   text-sm
 *   md (2-3 occurrences): px-3 py-1.5 text-sm
 *   sm (1 occurrence):    px-2.5 py-1 text-xs
 *
 * Chip color encodes severity:
 *   high (≥4): rose
 *   mid  (2-3): amber
 *   low  (1):  slate
 *
 * Falls back to the existing pill list style if jdKeywords is absent or empty.
 *
 * @param {string[]}             gaps
 * @param {Object.<string,number>} jdKeywords     — word→count from JD (may be null)
 * @param {Object.<string,number>} resumeKeywords — word→count from resume (may be null)
 */
export default function KeywordGapVisualizer({ gaps = [], jdKeywords = [], resumeKeywords = [] }) {
  const [tooltip, setTooltip] = useState(null) // { text, x, y }

  const normalizeMap = (data) => {
    if (!data) return {}
    if (Array.isArray(data)) {
      const obj = {}
      data.forEach(item => {
        if (item && item.keyword) obj[item.keyword] = item.count
      })
      return obj
    }
    return data
  }

  const jdMap = normalizeMap(jdKeywords)
  const resumeMap = normalizeMap(resumeKeywords)

  const hasFrequencyData = jdMap && Object.keys(jdMap).length > 0

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Find the best-matching key in the frequency map for a gap sentence. */
  function matchFrequency(gap, freqMap) {
    if (!freqMap || !gap) return 0
    const lower = gap.toLowerCase()
    let best = 0
    for (const [key, count] of Object.entries(freqMap)) {
      if (lower.includes(key)) best = Math.max(best, count)
    }
    // Also try first meaningful word of gap phrase
    const firstWord = lower.split(/\s+/).find(w => w.length > 3)
    if (firstWord && freqMap[firstWord]) best = Math.max(best, freqMap[firstWord])
    return best
  }

  function chipTier(jdCount) {
    if (jdCount >= 4) return 'high'
    if (jdCount >= 2) return 'mid'
    return 'low'
  }

  function chipSize(jdCount) {
    if (jdCount >= 4) return 'px-4 py-2 text-sm'
    if (jdCount >= 2) return 'px-3 py-1.5 text-sm'
    return 'px-2.5 py-1 text-xs'
  }

  function chipClass(tier) {
    if (tier === 'high') return 'keyword-chip-high'
    if (tier === 'mid')  return 'keyword-chip-mid'
    return 'keyword-chip-low'
  }

  // ── Fallback: plain pill list ──────────────────────────────────────────────
  if (!hasFrequencyData) {
    return (
      <div className="glass-card p-6 border-l-4 border-l-rose-600 rounded-tr-3xl rounded-bl-3xl rounded-tl-md rounded-br-md bg-white shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-rose-700">
            <span>◈</span>
            GAPS TO ADDRESS
          </h3>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
            {gaps.length}
          </span>
        </div>
        <ul className="space-y-2.5">
          {gaps.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-start gap-3 border rounded-xl px-3.5 py-3 text-sm leading-relaxed bg-rose-50/80 border-rose-200/90 text-rose-900 hover:-translate-x-0.5 transition-transform duration-150"
            >
              <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-rose-500" />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
    )
  }

  // ── Main: visual chip cloud ────────────────────────────────────────────────
  const enriched = gaps.map(gap => {
    const jdCount     = matchFrequency(gap, jdMap)
    const resumeCount = matchFrequency(gap, resumeMap)
    const tier        = chipTier(jdCount)
    return { gap, jdCount, resumeCount, tier }
  })

  // Sort: high severity first, then alpha
  enriched.sort((a, b) => {
    if (b.jdCount !== a.jdCount) return b.jdCount - a.jdCount
    return a.gap.localeCompare(b.gap)
  })

  // Calculate overlap stats
  const jdKeys = Object.keys(jdMap)
  const totalJdKeywords = jdKeys.length
  const matchedKeywords = jdKeys.filter(k => (resumeMap[k] || 0) > 0)
  const overlapPercentage = totalJdKeywords > 0
    ? Math.round((matchedKeywords.length / totalJdKeywords) * 100)
    : 0

  return (
    <div className="bg-[#131316] border border-[#26262B] border-l-4 border-l-[#F04438] rounded-lg p-6 shadow-[0_4px_12px_rgba(0,0,0,0.4)] relative space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#26262B] pb-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[#F04438]">
          <span>◈</span>
          KEYWORD GAP & OVERLAP VISUALIZER
        </h3>
        <div className="flex items-center gap-3 text-[11px] font-mono text-[#8A8A8F]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F04438] inline-block" /> High (≥4×)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] inline-block" /> Mid (2-3×)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#8A8A8F] inline-block" /> Low (1×)
          </span>
        </div>
      </div>

      {/* Horizontal Overlap Comparison Bar */}
      {totalJdKeywords > 0 && (
        <div className="bg-[#1B1B1F] border border-[#26262B] rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#F5F5F3] flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
              Keyword Overlap Match
            </span>
            <span className="font-mono text-[#FF5A1F] font-bold">
              {matchedKeywords.length} / {totalJdKeywords} keywords matched ({overlapPercentage}%)
            </span>
          </div>

          {/* Dual Progress Bar */}
          <div className="w-full h-2.5 bg-[#0A0A0B] rounded-full overflow-hidden flex border border-[#26262B]">
            <motion.div
              className="h-full bg-[#FF5A1F]"
              initial={{ width: '0%' }}
              animate={{ width: `${overlapPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <motion.div
              className="h-full bg-[#F04438]/30"
              initial={{ width: '0%' }}
              animate={{ width: `${100 - overlapPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8A8A8F] pt-1 font-mono font-medium">
            <span>In Resume ({matchedKeywords.length})</span>
            <span>Missing in Resume ({totalJdKeywords - matchedKeywords.length})</span>
          </div>
        </div>
      )}

      {/* Hint text */}
      <p className="text-xs text-slate-500 leading-relaxed">
        Chip size &amp; color reflect how often this skill appears in the job description.
        Larger &amp; red chips represent higher priority skills missing from your resume.
      </p>

      {/* Chip cloud */}
      <motion.div layout className="flex flex-wrap gap-2.5">
        <AnimatePresence>
          {enriched.map(({ gap, jdCount, resumeCount, tier }, i) => (
            <motion.button
              key={gap}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className={`${chipClass(tier)} ${chipSize(jdCount)} relative group`}
              aria-label={`Keyword gap: ${gap}. Appears ${jdCount} times in JD, ${resumeCount} times in resume.`}
              onMouseEnter={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                setTooltip({ gap, jdCount, resumeCount, id: gap })
              }}
              onMouseLeave={() => setTooltip(null)}
              onFocus={e => setTooltip({ gap, jdCount, resumeCount, id: gap })}
              onBlur={() => setTooltip(null)}
            >
              {/* Priority dot */}
              {tier === 'high' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              )}
              {tier === 'mid' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}

              <span className="font-medium leading-none">{gap}</span>

              {/* Inline tooltip */}
              <AnimatePresence>
                {tooltip?.id === gap && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                               bg-navy-700 border border-white/10 rounded-lg px-3 py-2
                               text-xs text-slate-200 whitespace-nowrap shadow-card pointer-events-none"
                    role="tooltip"
                  >
                    <div className="font-semibold text-white mb-0.5 truncate max-w-[220px]">{gap}</div>
                    <div className="text-slate-400">
                      In JD: <span className="text-indigo-300 font-semibold">{jdCount}×</span>
                      {' · '}
                      In resume: <span className="text-emerald-300 font-semibold">{resumeCount}×</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                                    border-l-4 border-r-4 border-t-4
                                    border-l-transparent border-r-transparent border-t-navy-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
