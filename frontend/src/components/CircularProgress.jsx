import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Sharpened Instrument Signal Bars ATS Score Display
 * Precision Linear execution featuring thin, sharp-edged vertical bars with
 * tick-mark measurement lines, count-up numeric score in JetBrains Mono,
 * and stepped #FF5A1F Ignite accent coloring.
 *
 * @param {number}  score       - overall score (0–100)
 * @param {object}  subScores   - optional object containing formattingScore, keywordMatchScore, experienceRelevanceScore, skillsAlignmentScore
 * @param {string}  label       - label text (default "ATS MATCH RATING")
 */
export default function CircularProgress({
  score = 0,
  subScores = null,
  label = 'ATS MATCH RATING',
  showSublabel = true,
}) {
  const [displayed, setDisplayed] = useState(0)

  const bars = [
    { key: 'Formatting', score: subScores?.formattingScore ?? Math.min(100, Math.max(40, score + 4)) },
    { key: 'Keywords', score: subScores?.keywordMatchScore ?? Math.min(100, Math.max(30, score - 6)) },
    { key: 'Experience', score: subScores?.experienceRelevanceScore ?? Math.min(100, Math.max(45, score + 2)) },
    { key: 'Skills', score: subScores?.skillsAlignmentScore ?? Math.min(100, Math.max(35, score - 3)) },
  ]

  // Count-up animation from 0 to score
  useEffect(() => {
    let start = null
    let animId = null
    const duration = 1000
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // Cubic ease out
      setDisplayed(Math.round(eased * score))
      if (progress < 1) animId = requestAnimationFrame(step)
    }
    animId = requestAnimationFrame(step)
    return () => { if (animId) cancelAnimationFrame(animId) }
  }, [score])

  const getBarColor = (val) => {
    if (val >= 75) return 'bg-[#FF5A1F]' // Ignite
    if (val >= 50) return 'bg-[#F5A623]' // Warning Gold
    return 'bg-[#F04438]' // Danger Red
  }

  const getTextColor = (val) => {
    if (val >= 75) return 'text-[#FF5A1F]'
    if (val >= 50) return 'text-[#F5A623]'
    return 'text-[#F04438]'
  }

  const ratingLabel =
    score >= 75 ? 'Strong Match' :
    score >= 50 ? 'Moderate Match' :
                  'Needs Work'

  return (
    <div className="flex flex-col items-center justify-center p-2 space-y-4 w-full">
      {/* Score Header & Sharpened Instrument Signal Bars */}
      <div className="flex items-end justify-center gap-6 sm:gap-8 w-full">
        
        {/* Count-up Score Numeral in JetBrains Mono */}
        <div className="flex flex-col items-start justify-end">
          <div className="flex items-baseline font-mono text-5xl sm:text-6xl font-bold text-[#F5F5F3] tracking-tight">
            {displayed}
            <span className="text-lg text-[#8A8A8F] font-normal ml-1">/100</span>
          </div>
          {showSublabel && (
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider mt-1.5 ${getTextColor(score)}`}>
              ✦ {ratingLabel}
            </span>
          )}
        </div>

        {/* Sharpened Instrument Signal Bars Frame with Tick-Marks */}
        <div className="relative flex items-end gap-2.5 h-24 bg-[#1B1B1F] p-3 rounded border border-[#26262B] shadow-inner">
          {/* Subtle tick-marks overlay (20%, 40%, 60%, 80%) */}
          <div className="absolute inset-x-0 inset-y-2 pointer-events-none flex flex-col justify-between opacity-20 border-r border-dashed border-[#8A8A8F]">
            <div className="w-full border-t border-dashed border-[#8A8A8F]" />
            <div className="w-full border-t border-dashed border-[#8A8A8F]" />
            <div className="w-full border-t border-dashed border-[#8A8A8F]" />
            <div className="w-full border-t border-dashed border-[#8A8A8F]" />
          </div>

          {bars.map((bar, idx) => {
            const heightPct = Math.max(15, Math.min(100, bar.score))
            const barColor = getBarColor(bar.score)
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group relative z-10">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#0A0A0B] border border-[#26262B] text-[#F5F5F3] text-[10px] font-mono py-0.5 px-2 rounded whitespace-nowrap pointer-events-none shadow-md z-20">
                  {bar.key}: {bar.score}%
                </div>
                {/* Thin sharp-edged vertical bar with 2px radius */}
                <motion.div
                  initial={{ height: '0%' }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: 'easeOut' }}
                  className={`w-3.5 sm:w-4 rounded-xs ${barColor} shadow-xs`}
                />
                <span className="text-[9px] font-mono text-[#8A8A8F] font-bold uppercase">
                  {bar.key.slice(0, 3)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Label */}
      {label && (
        <p className="text-[11px] font-mono font-bold text-[#8A8A8F] uppercase tracking-widest text-center border-t border-[#26262B] pt-3 w-full">
          {label}
        </p>
      )}
    </div>
  )
}
