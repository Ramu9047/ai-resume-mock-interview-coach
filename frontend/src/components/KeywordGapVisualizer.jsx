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
      <div className="glass-card p-5 hover:shadow-glow-rose transition-all duration-300">
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest mb-4 flex items-center gap-2 text-rose-400">
          <span>◈</span>
          Gaps to Address
          <span className="ml-auto text-xs font-mono opacity-60">{gaps.length}</span>
        </h3>
        <ul className="space-y-2">
          {gaps.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 border rounded-xl px-3 py-2.5 text-sm leading-relaxed bg-rose-500/10 border-rose-500/25 text-rose-300"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-rose-400" />
              {item}
            </li>
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
    <div className="glass-card p-5 hover:shadow-glow-rose transition-all duration-300 relative space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest flex items-center gap-2 text-rose-400">
          <span>◈</span>
          Keyword Gap &amp; Overlap Visualizer
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> High (≥4×)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Mid (2-3×)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" /> Low (1×)
          </span>
          <span className="font-mono opacity-60">{gaps.length}</span>
        </div>
      </div>

      {/* Horizontal Overlap Comparison Bar */}
      {totalJdKeywords > 0 && (
        <div className="bg-navy-900/80 border border-white/5 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Keyword Overlap Match
            </span>
            <span className="font-mono text-emerald-400">
              {matchedKeywords.length} / {totalJdKeywords} keywords matched ({overlapPercentage}%)
            </span>
          </div>

          {/* Dual Progress Bar */}
          <div className="w-full h-3 bg-navy-950 rounded-full overflow-hidden flex border border-white/5">
            <motion.div
              className="h-full bg-emerald-500 shadow-glow-emerald"
              initial={{ width: '0%' }}
              animate={{ width: `${overlapPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <motion.div
              className="h-full bg-rose-500/40"
              initial={{ width: '0%' }}
              animate={{ width: `${100 - overlapPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
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
