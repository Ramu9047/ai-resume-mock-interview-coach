import { useState } from 'react'
import ScoreBar from './ScoreBar'

const categoryLabel = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  'role-fit': 'Role Fit',
}

/**
 * Collapsible accordion row for the summary breakdown.
 */
export default function AccordionItem({ item, index }) {
  const [open, setOpen] = useState(false)

  const badgeClass =
    item.category === 'technical'  ? 'badge-technical' :
    item.category === 'behavioral' ? 'badge-behavioral' :
                                     'badge-role-fit'

  return (
    <div
      className={`glass-card overflow-hidden transition-all duration-200
                  ${open ? 'border-white/10' : 'hover:border-white/8'}`}
    >
      {/* Header row */}
      <button
        id={`accordion-btn-${index}`}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left group"
        aria-expanded={open}
      >
        {/* Question number */}
        <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center font-display">
          {index + 1}
        </span>

        {/* Question text */}
        <p className="flex-1 text-sm text-slate-200 font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {item.question}
        </p>

        {/* Category + score + chevron */}
        <div className="shrink-0 flex items-center gap-3">
          <span className={`hidden sm:inline-flex ${badgeClass}`}>
            {categoryLabel[item.category] ?? item.category}
          </span>
          <span className={`font-display font-bold text-base ${item.score >= 7 ? 'text-emerald-400' : item.score >= 4 ? 'text-amber-400' : 'text-rose-400'}`}>
            {item.score}<span className="text-slate-500 text-xs font-normal">/10</span>
          </span>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4 animate-fade-in">
          {/* Score bar */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">Score</p>
            <ScoreBar score={item.score} animate={true} />
          </div>

          {/* Answer */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">Your Answer</p>
            <p className="text-sm text-slate-300 leading-relaxed bg-navy-900/50 rounded-lg px-3 py-2.5 border border-white/5">
              {item.answer}
            </p>
          </div>

          {/* Feedback */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">AI Feedback</p>
            <p className="text-sm text-slate-200 leading-relaxed">
              {item.feedback}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
