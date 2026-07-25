import { useEffect, useRef, useState } from 'react'

/**
 * Animated SVG circular progress ring.
 * @param {number}  score      - value 0–100
 * @param {number}  size       - diameter in px (default 180)
 * @param {number}  stroke     - ring stroke width (default 12)
 * @param {string}  label      - label below the number (default "ATS Score")
 */
export default function CircularProgress({ score = 0, size = 180, stroke = 12, label = 'ATS Score', showSublabel = true }) {
  const [displayed, setDisplayed] = useState(0)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference
  const isMini = size < 120

  // Colour based on score range
  const colour =
    score >= 75 ? '#10B981' : // emerald
    score >= 50 ? '#F59E0B' : // amber
                  '#F43F5E'  // rose

  const glow =
    score >= 75 ? 'rgba(16,185,129,0.4)' :
    score >= 50 ? 'rgba(245,158,11,0.4)' :
                  'rgba(244,63,94,0.4)'

  // Animate count-up
  useEffect(() => {
    let start = null
    let animId = null
    const duration = 1200
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * score))
      if (progress < 1) {
        animId = requestAnimationFrame(step)
      }
    }
    animId = requestAnimationFrame(step)
    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [score])

  const label2 =
    score >= 75 ? 'Excellent' :
    score >= 50 ? 'Moderate' :
                  'Needs Work'

  return (
    <div className={`flex flex-col items-center ${isMini ? 'gap-1.5' : 'gap-3'}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          {/* Filled arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={colour}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.05s linear',
              filter: `drop-shadow(0 0 ${isMini ? '4px' : '8px'} ${glow})`,
            }}
          />
        </svg>

        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className={`font-display font-bold text-white leading-none ${isMini ? 'text-lg' : 'text-4xl'}`}>
            {displayed}
          </span>
          {!isMini && showSublabel && (
            <span className="text-xs font-medium mt-1" style={{ color: colour }}>
              {label2}
            </span>
          )}
        </div>
      </div>

      {label && (
        <p className={`${isMini ? 'text-xs font-medium text-slate-300 text-center leading-tight' : 'text-sm font-medium text-slate-400 uppercase tracking-widest'}`}>
          {label}
        </p>
      )}
    </div>
  )
}
