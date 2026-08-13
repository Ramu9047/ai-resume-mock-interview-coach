import { useState } from 'react'
import ScoreBar from './ScoreBar'

const categoryLabel = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  'role-fit': 'Role Fit',
}

/**
 * Collapsible accordion row for Summary Breakdown in Precision Dark Linear Theme.
 */
export default function AccordionItem({ item, index }) {
  const [open, setOpen] = useState(false)

  const badgeClass =
    item.category === 'technical'  ? 'badge-technical' :
    item.category === 'behavioral' ? 'badge-behavioral' :
                                     'badge-role-fit'

  return (
    <div
      className={`bg-[#131316] border border-[#26262B] rounded-lg overflow-hidden transition-all duration-150 shadow-xs
                  ${open ? 'border-[#FF5A1F] ring-1 ring-[#FF5A1F]/30' : 'hover:border-[#3D3D42]'}`}
    >
      {/* Header row */}
      <button
        id={`accordion-btn-${index}`}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left group"
        aria-expanded={open}
      >
        {/* Question number */}
        <span className="shrink-0 w-6 h-6 rounded bg-[#FF5A1F] text-[#F5F5F3] text-xs font-mono font-bold flex items-center justify-center">
          {index + 1}
        </span>

        {/* Question text */}
        <p className="flex-1 text-sm sm:text-base text-[#F5F5F3] font-bold leading-snug line-clamp-2 group-hover:text-[#FF5A1F] transition-colors font-display">
          {item.question}
        </p>

        {/* Category + score + chevron */}
        <div className="shrink-0 flex items-center gap-3">
          <span className={`hidden sm:inline-flex ${badgeClass}`}>
            {categoryLabel[item.category] ?? item.category}
          </span>
          <span className={`font-mono font-bold text-base ${item.score >= 7 ? 'text-[#FF5A1F]' : item.score >= 4 ? 'text-[#F5A623]' : 'text-[#F04438]'}`}>
            {item.score}<span className="text-[#8A8A8F] text-xs font-normal">/10</span>
          </span>
          <svg
            className={`w-4 h-4 text-[#8A8A8F] transition-transform duration-150 ${open ? 'rotate-180 text-[#FF5A1F]' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="px-5 pb-5 border-t border-[#26262B] pt-4 space-y-4 animate-fade-in bg-[#1B1B1F]">
          {/* Score bar */}
          <div>
            <p className="text-[11px] font-mono font-bold text-[#FF5A1F] uppercase tracking-widest mb-1.5">Score Breakdown</p>
            <ScoreBar score={item.score} animate={true} />
          </div>

          {/* Answer */}
          <div>
            <p className="text-[11px] font-mono font-bold text-[#8A8A8F] uppercase tracking-widest mb-1.5">Your Submitted Answer</p>
            <p className="text-xs text-[#F5F5F3] leading-relaxed bg-[#131316] rounded-md px-3.5 py-2.5 border border-[#26262B] font-sans">
              {item.answer}
            </p>
          </div>

          {/* Feedback */}
          <div>
            <p className="text-[11px] font-mono font-bold text-[#8A8A8F] uppercase tracking-widest mb-1.5">AI Evaluator Feedback</p>
            <p className="text-xs text-[#F5F5F3] leading-relaxed font-sans font-medium">
              {item.feedback}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
