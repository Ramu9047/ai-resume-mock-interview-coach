import { motion } from 'framer-motion'

/**
 * Renders a labelled list of strength / gap / suggestion strings with Precision Dark Linear styling.
 * @param {'strength'|'gap'|'suggestion'} variant
 * @param {string[]} items
 * @param {string}   title
 */
export default function StrengthGapCard({ title, items = [], variant = 'strength' }) {
  const styles = {
    strength: {
      icon: '✦',
      dot: 'bg-[#FF5A1F]',
      card: 'border-l-4 border-l-[#FF5A1F] bg-[#131316] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-[#26262B]',
      pill: 'bg-[#1B1B1F] border border-[#26262B] text-[#F5F5F3]',
      heading: 'text-[#FF5A1F] font-mono text-xs font-bold uppercase tracking-widest',
    },
    gap: {
      icon: '◈',
      dot: 'bg-[#F04438]',
      card: 'border-l-4 border-l-[#F04438] bg-[#131316] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-[#26262B]',
      pill: 'bg-[#1B1B1F] border border-[#26262B] text-[#F5F5F3]',
      heading: 'text-[#F04438] font-mono text-xs font-bold uppercase tracking-widest',
    },
    suggestion: {
      icon: '◎',
      dot: 'bg-[#F5A623]',
      card: 'border-t-4 border-t-[#F5A623] bg-[#131316] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-[#26262B]',
      pill: 'bg-[#1B1B1F] border border-[#26262B] text-[#F5F5F3]',
      heading: 'text-[#F5A623] font-mono text-xs font-bold uppercase tracking-widest',
    },
  }

  const s = styles[variant]

  if (!items || items.length === 0) return null

  return (
    <div className={`p-6 transition-all duration-150 ${s.card}`}>
      <div className="flex items-center justify-between mb-4 border-b border-[#26262B] pb-3">
        <h3 className={`flex items-center gap-2 ${s.heading}`}>
          <span>{s.icon}</span>
          {title}
        </h3>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1B1B1F] border border-[#26262B] text-[#8A8A8F]">
          {items.length}
        </span>
      </div>

      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className={`flex items-start gap-3 rounded-md px-3.5 py-3 text-sm leading-relaxed ${s.pill}`}
          >
            <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
            <span className="font-sans font-medium text-[#F5F5F3] text-xs sm:text-sm">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
