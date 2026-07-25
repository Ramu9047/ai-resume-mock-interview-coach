import { useEffect, useRef, useState } from 'react'

/**
 * Animated horizontal score bar (0–10).
 * @param {number}  score
 * @param {boolean} animate - whether to play fill animation on mount
 */
export default function ScoreBar({ score = 0, animate = true }) {
  const [width, setWidth] = useState(0)
  const pct = Math.min(Math.max((score / 10) * 100, 0), 100)

  const colour =
    score >= 7 ? 'from-emerald-500 to-emerald-400' :
    score >= 4 ? 'from-amber-500 to-amber-400' :
                 'from-rose-500 to-rose-400'

  const textColour =
    score >= 7 ? 'text-emerald-400' :
    score >= 4 ? 'text-amber-400' :
                 'text-rose-400'

  useEffect(() => {
    if (!animate) { setWidth(pct); return }
    const t = setTimeout(() => setWidth(pct), 100)
    return () => clearTimeout(t)
  }, [pct, animate])

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colour} transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className={`font-display text-sm font-bold w-12 text-right ${textColour}`}>
        {score}<span className="text-slate-500 font-normal text-xs">/10</span>
      </span>
    </div>
  )
}
