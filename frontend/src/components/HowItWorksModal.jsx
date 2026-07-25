import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Modal explaining the 4-step ResumeCoach process:
 * 1. Upload & Extract → 2. AI Analysis & Scoring → 3. Mock Interview → 4. Build & Export
 */
export default function HowItWorksModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const steps = [
    {
      step: '01',
      title: 'Upload & Extract',
      desc: 'Upload your PDF resume and optional target Job Description for instant text parsing and keyword tokenization.',
      icon: '📄',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      step: '02',
      title: 'AI Analysis & Scoring',
      desc: 'Get an overall ATS score plus 4 sub-score breakdowns (Formatting, Keywords, Relevance, Skills) powered by LLaMA 3.3 70B.',
      icon: '⚡',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      step: '03',
      title: 'Interactive Mock Interview',
      desc: 'Practice customized behavioral and technical interview questions tailored specifically to your resume gaps.',
      icon: '🎙️',
      color: 'from-indigo-500 to-emerald-400',
    },
    {
      step: '04',
      title: 'Build & Export PDF',
      desc: 'Pre-fill parsed insights into 3 ATS-tailored resume templates (Meridian, Slate Pro, Apex) and export a print-ready PDF.',
      icon: '🚀',
      color: 'from-emerald-400 to-teal-500',
    },
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl glass-card p-6 sm:p-8 shadow-card-hover border-indigo-500/20 space-y-6 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <span>✦</span> How ResumeCoach AI Works
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Four simple steps to land your dream technical role</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 text-lg rounded-lg hover:bg-white/5 transition-colors"
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-navy-900/60 border border-white/5 rounded-xl p-4 space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    Step {s.step}
                  </span>
                </div>
                <h3 className="font-display text-sm font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex justify-end">
            <button onClick={onClose} className="btn-primary py-2 px-6 text-xs">
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
