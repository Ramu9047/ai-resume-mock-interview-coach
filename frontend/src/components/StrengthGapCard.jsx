/**
 * Renders a labelled list of strength / gap / suggestion strings as pills.
 * @param {'strength'|'gap'|'suggestion'} variant
 * @param {string[]} items
 * @param {string}   title
 */
export default function StrengthGapCard({ title, items = [], variant = 'strength' }) {
  const styles = {
    strength: {
      icon: '✦',
      dot: 'bg-emerald-400',
      pill: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
      heading: 'text-emerald-400',
      glow: 'hover:shadow-glow-emerald',
    },
    gap: {
      icon: '◈',
      dot: 'bg-rose-400',
      pill: 'bg-rose-500/10 border-rose-500/25 text-rose-300',
      heading: 'text-rose-400',
      glow: 'hover:shadow-glow-rose',
    },
    suggestion: {
      icon: '◎',
      dot: 'bg-indigo-400',
      pill: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300',
      heading: 'text-indigo-400',
      glow: '',
    },
  }

  const s = styles[variant]

  if (!items || items.length === 0) return null

  return (
    <div className={`glass-card p-5 transition-all duration-300 ${s.glow}`}>
      <h3 className={`font-display text-sm font-semibold uppercase tracking-widest mb-4 flex items-center gap-2 ${s.heading}`}>
        <span>{s.icon}</span>
        {title}
        <span className="ml-auto text-xs font-mono opacity-60">{items.length}</span>
      </h3>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className={`flex items-start gap-2.5 border rounded-xl px-3 py-2.5 text-sm leading-relaxed ${s.pill}`}
          >
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
