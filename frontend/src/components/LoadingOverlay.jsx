import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STAGES = [
  { id: 1, label: 'Reading your resume...', sub: 'Parsing structure, sections & text content', duration: 4000 },
  { id: 2, label: 'Comparing against job requirements...', sub: 'Matching core competencies & key qualifications', duration: 6000 },
  { id: 3, label: 'Calculating ATS score...', sub: 'Evaluating formatting, keyword density & relevance', duration: 5000 },
  { id: 4, label: 'Finalizing insights...', sub: 'Generating personalized strengths & interview tips', duration: 8000 },
]

/**
 * Animated progress sequence loading overlay for resume analysis.
 * Features a dynamic progress bar, timed stage steps with checkmarks,
 * and glowing status indicators.
 *
 * @param {boolean} visible
 */
export default function LoadingOverlay({ visible }) {
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!visible) {
      setActiveStageIndex(0)
      setProgress(0)
      return
    }

    // Smooth asymptotic progress animation up to 98% over ~40s
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      // Asymptotic curve: moves fast initially, then continuously crawls up to 98%
      const nextProgress = Math.min(98, Math.floor(98 * (1 - Math.exp(-elapsed / 12000))))
      setProgress(nextProgress)
    }, 100)

    // Stage progression timers
    const timer1 = setTimeout(() => setActiveStageIndex(1), 4500)  // 4.5s
    const timer2 = setTimeout(() => setActiveStageIndex(2), 12000) // 12s
    const timer3 = setTimeout(() => setActiveStageIndex(3), 22000) // 22s

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [visible])

  if (!visible) return null

  const currentStage = STAGES[activeStageIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4
                 bg-navy-950/85 backdrop-blur-md animate-fade-in"
      aria-live="polite"
      aria-label={currentStage.label}
    >
      <div className="w-full max-w-md glass-card p-8 shadow-card-hover border-indigo-500/20 relative overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-indigo-300">
              AI Analysis in Progress
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-navy-900 rounded-full overflow-hidden mb-8 p-0.5 border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full shadow-glow-indigo"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: 0.2 }}
          />
        </div>

        {/* Dynamic Stage Message Box */}
        <div className="min-h-[64px] mb-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-display text-lg font-bold text-white mb-1 flex items-center gap-2">
                <span>{currentStage.label}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {currentStage.sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4-Step Progress Indicator List */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStageIndex
            const isCurrent = idx === activeStageIndex
            const isPending = idx > activeStageIndex

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                  isCurrent ? 'text-white font-semibold scale-[1.02]' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {/* Step indicator circle / checkmark */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-mono text-[10px] font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                      : isCurrent
                        ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-300 shadow-glow-indigo'
                        : 'bg-navy-900 border border-white/5 text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span>{stage.id}</span>
                  )}
                </div>

                {/* Stage label */}
                <span className="flex-1 truncate">{stage.label}</span>

                {/* Pulsing indicator for active stage */}
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping shrink-0" />
                )}
              </div>
            )
          })}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-[11px] text-slate-500 font-mono border-t border-white/5 pt-4">
          Powered by LLaMA 3.3 70B · Groq Acceleration
        </div>
      </div>
    </div>
  )
}
