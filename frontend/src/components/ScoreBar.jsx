import { motion } from 'framer-motion'

/**
 * Score bar visualization for Precision Dark Linear Theme.
 */
export default function ScoreBar({ score = 0, max = 10, animate = true }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100))

  const fillColour =
    score >= 7.5 ? 'bg-[#FF5A1F]' :
    score >= 5.0 ? 'bg-[#F5A623]' : 'bg-[#F04438]'

  return (
    <div className="w-full space-y-1">
      <div className="w-full h-2 bg-[#1B1B1F] border border-[#26262B] rounded-full overflow-hidden flex">
        {animate ? (
          <motion.div
            className={`h-full ${fillColour}`}
            initial={{ width: '0%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ) : (
          <div className={`h-full ${fillColour}`} style={{ width: `${pct}%` }} />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-[#8A8A8F] font-mono font-medium">
        <span>0</span>
        <span className="font-bold text-[#F5F5F3]">{score.toFixed(1)} / {max}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
