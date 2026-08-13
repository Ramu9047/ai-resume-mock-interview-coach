import { motion, AnimatePresence } from 'framer-motion'

/**
 * HowItWorksModal — Precision Dark Linear / Raycast Theme
 * Modal explaining the 4-step ResumeCoach process with #131316 surfaces,
 * #26262B structural borders, Archivo headers, and crisp Ignite (#FF5A1F) step badges.
 */
export default function HowItWorksModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const steps = [
    {
      step: '01',
      title: 'Upload & Parse',
      desc: 'Upload your PDF resume and target Job Description for instant AI parsing and keyword tokenization.',
      icon: '📄',
    },
    {
      step: '02',
      title: 'ATS Signal Scoring',
      desc: 'Unlock an overall ATS score plus 4 sub-score breakdowns (Formatting, Keywords, Relevance, Skills) via Groq LLaMA 3.3 70B.',
      icon: '⚡',
    },
    {
      step: '03',
      title: 'Interactive Mock Interview',
      desc: 'Practice customized behavioral and technical interview questions generated specifically from your target role gaps.',
      icon: '🎙️',
    },
    {
      step: '04',
      title: 'Build & Export PDF',
      desc: 'Pre-fill parsed insights into ATS-optimized templates and export a clean, print-ready PDF resume.',
      icon: '🚀',
    },
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A0A0B]/85"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#131316] border border-[#26262B] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.7)] rounded-lg space-y-6 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#26262B] pb-4">
            <div>
              <div className="credential-line text-[#FF5A1F] mb-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
                SYSTEM ARCHITECTURE
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F5F5F3] flex items-center gap-2">
                How ResumeCoach AI Works
              </h2>
              <p className="text-xs text-[#8A8A8F] mt-1 font-sans">Four simple steps to land your target technical role</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#8A8A8F] hover:text-[#F5F5F3] p-2 text-lg font-mono font-bold rounded hover:bg-[#1B1B1F] transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((s, idx) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#1B1B1F] border border-[#26262B] hover:border-[#3D3D42] rounded-md p-4 space-y-2 relative transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{s.icon}</span>
                  {/* Ignite Orange-Red Step Badge */}
                  <span className="text-[10px] font-mono font-bold text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 px-2 py-0.5 rounded uppercase tracking-wider">
                    STEP {s.step}
                  </span>
                </div>
                <h3 className="font-display text-sm font-bold text-[#F5F5F3]">{s.title}</h3>
                <p className="text-xs text-[#8A8A8F] leading-relaxed font-sans">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-between border-t border-[#26262B]">
            <span className="text-[11px] font-mono text-[#8A8A8F]">
              ENGINE · GROQ LLAMA 3.3 70B
            </span>
            <button onClick={onClose} className="btn-primary py-2 px-5 text-xs shadow-sm">
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
