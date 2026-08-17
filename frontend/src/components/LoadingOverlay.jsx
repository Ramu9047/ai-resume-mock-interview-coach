import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STAGES = [
  { id: 1, label: 'Parsing resume structure & syntax...', sub: 'Extracting contact details, sections & typography hierarchy', duration: 4000 },
  { id: 2, label: 'Matching against job requirements...', sub: 'Evaluating core technical competencies & key qualifications', duration: 6000 },
  { id: 3, label: 'Calculating ATS signal scores...', sub: 'Measuring keyword density, formatting & experience relevance', duration: 5000 },
  { id: 4, label: 'Formulating technical interview questions...', sub: 'Generating role-specific behavioral & architectural prompts', duration: 8000 },
]

/**
 * Sharpened Signal Bars loading overlay for Precision Dark Linear Theme.
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

    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const nextProgress = Math.min(98, Math.floor(98 * (1 - Math.exp(-elapsed / 12000))))
      setProgress(nextProgress)
    }, 100)

    const timer1 = setTimeout(() => setActiveStageIndex(1), 4500)
    const timer2 = setTimeout(() => setActiveStageIndex(2), 12000)
    const timer3 = setTimeout(() => setActiveStageIndex(3), 22000)

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
                 bg-[#0A0A0B]/90 animate-fade-in"
      aria-live="polite"
      aria-label={currentStage.label}
    >
      <div className="w-full max-w-md bg-[#131316] border border-[#26262B] p-8 rounded-lg shadow-[0_16px_40px_rgba(0,0,0,0.7)] relative overflow-hidden">
        
        {/* Sharpened Ignite Orange-Red Audio Equalizer Bars */}
        <div className="flex items-center justify-center gap-1.5 h-12 mb-6 bg-[#1B1B1F] p-2 rounded border border-[#26262B]">
          {[0.4, 0.95, 0.65, 1.0, 0.75, 0.5].map((scaleFactor, i) => (
            <motion.div
              key={i}
              className="w-2 bg-[#FF5A1F] rounded-xs"
              animate={{
                height: ['15%', `${scaleFactor * 100}%`, '25%'],
              }}
              transition={{
                duration: 0.6 + i * 0.12,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#26262B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF5A1F]">
              AI ANALYSIS IN PROGRESS
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-[#F5F5F3]">
            {progress}%
          </span>
        </div>

        {/* Dynamic Stage Message Box */}
        <div className="min-h-[56px] mb-6 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="font-display text-base font-bold text-[#F5F5F3] mb-1">
                {currentStage.label}
              </h3>
              <p className="text-xs text-[#8A8A8F] leading-relaxed font-sans">
                {currentStage.sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ignite Progress Track */}
        <div className="w-full h-1.5 bg-[#1B1B1F] rounded-full overflow-hidden border border-[#26262B] mb-6">
          <motion.div
            className="h-full bg-[#FF5A1F]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: 0.2 }}
          />
        </div>

        {/* 4-Step Progress List */}
        <div className="space-y-2.5 pt-3 border-t border-[#26262B]">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStageIndex
            const isCurrent = idx === activeStageIndex

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-3 text-xs font-mono transition-all duration-150 ${
                  isCurrent ? 'text-[#F5F5F3] font-bold' : isCompleted ? 'text-[#FF5A1F]' : 'text-[#8A8A8F]/60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F]'
                      : isCurrent
                        ? 'bg-[#FF5A1F] text-[#F5F5F3]'
                        : 'bg-[#1B1B1F] border border-[#26262B] text-[#8A8A8F]'
                  }`}
                >
                  {isCompleted ? '✓' : stage.id}
                </div>

                <span className="flex-1 truncate text-xs font-semibold">{stage.label}</span>

                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-ping shrink-0" />
                )}
              </div>
            )
          })}
        </div>

        {/* Monospace Credential Line */}
        <div className="mt-6 text-center text-[10px] font-mono text-[#8A8A8F] border-t border-[#26262B] pt-3 font-medium">
          AI ENGINE · ACCELERATED
        </div>
      </div>
    </div>
  )
}
