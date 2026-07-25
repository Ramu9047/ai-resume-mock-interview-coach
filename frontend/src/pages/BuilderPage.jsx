import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { saveResumeDraft, getResumeDraft, parsePdfToDraft, improveField } from '../api/client'
import AnimatedGradientMesh from '../components/AnimatedGradientMesh'

// ── Template definitions ──────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'meridian',
    name: 'Meridian',
    desc: 'Left accent strip · Space Grotesk headings',
    accent: '#6366F1',
    preview: 'indigo',
  },
  {
    id: 'slatepro',
    name: 'Slate Pro',
    desc: 'Single column · hairline dividers · clean',
    accent: '#10B981',
    preview: 'emerald',
  },
  {
    id: 'apex',
    name: 'Apex',
    desc: 'Asymmetric two-column · skill pills · bold',
    accent: '#F59E0B',
    preview: 'amber',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    desc: 'Compact single-page · classic serif · elegant rules',
    accent: '#64748B',
    preview: 'slate',
  },
]

const ACCENT_COLORS = [
  { id: 'indigo', name: 'Indigo', hex: '#6366F1' },
  { id: 'emerald', name: 'Emerald', hex: '#10B981' },
  { id: 'sky', name: 'Sky', hex: '#0EA5E9' },
  { id: 'slate', name: 'Slate', hex: '#64748B' },
  { id: 'rose', name: 'Rose', hex: '#E11D48' },
]

const BLANK = {
  templateId: 'meridian',
  accentColor: '#6366F1',
  personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' },
  summary: '',
  education: [{ institution: '', degree: '', field: '', year: '', gpa: '' }],
  experience: [{ company: '', role: '', duration: '', bullets: [''] }],
  skills: [],
  projects: [{ name: '', description: '', tech: '', url: '' }],
}

// ── Helper: debounce ──────────────────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

// ── Section accordion wrapper ─────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4
                   bg-navy-800/60 hover:bg-navy-700/60 transition-colors duration-200"
      >
        <span className="flex items-center gap-2 font-display font-semibold text-white text-sm">
          <span className="text-indigo-400">{icon}</span>
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-500"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 py-4 bg-navy-900/40 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Field helpers ─────────────────────────────────────────────────────────────
function Field({ label, action, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        {action}
      </div>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', disabled = false, readOnly = false }) {
  return (
    <input
      type={type}
      disabled={disabled}
      readOnly={readOnly}
      className="input-base disabled:opacity-50 disabled:cursor-not-allowed"
      value={value || ''}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  )
}

// ── AI Improvement Helper Components ─────────────────────────────────────────
function AiImproveButton({
  fieldType,
  text,
  iconOnly = false,
  aiUsageCount,
  setAiUsageCount,
  onSuccess,
  onLoadingChange,
  onError,
}) {
  const [loading, setLoading] = useState(false)
  const trimmed = (text || '').trim()

  // Hide button on empty fields
  if (!trimmed) return null

  async function handleImprove() {
    if (!trimmed || loading) return
    if (aiUsageCount >= 20) {
      if (onError) onError('Limit reached (20/20 max uses)')
      return
    }

    setLoading(true)
    if (onLoadingChange) onLoadingChange(true)
    if (onError) onError(null)

    try {
      const res = await improveField(fieldType, trimmed)
      if (res && res.suggestion) {
        setAiUsageCount(prev => prev + 1)
        if (onSuccess) onSuccess(res.suggestion)
      } else {
        if (onError) onError("Couldn't generate a suggestion — try again")
      }
    } catch (e) {
      console.error(e)
      if (onError) onError("Couldn't generate a suggestion — try again")
    } finally {
      setLoading(false)
      if (onLoadingChange) onLoadingChange(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleImprove}
      disabled={loading}
      title="Improve with AI"
      className={
        iconOnly
          ? "p-1.5 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          : "inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      }
    >
      {loading ? (
        <svg className="w-3.5 h-3.5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <>
          <span className="text-indigo-400 font-bold">✦</span>
          {!iconOnly && <span>Improve with AI</span>}
        </>
      )}
    </button>
  )
}

function SuggestionCard({ suggestion, onUse, onDiscard }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-3 text-xs space-y-2 mt-2 shadow-lg"
    >
      <div className="flex items-center justify-between font-mono text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
        <span>✦ AI Suggestion</span>
        <span className="text-slate-400 font-normal">Fact-Checked Rewrite</span>
      </div>
      <p className="text-slate-200 leading-relaxed font-sans bg-navy-900/80 p-2.5 rounded-lg border border-white/5">
        {suggestion}
      </p>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onUse}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-glow-indigo"
        >
          Use This
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="px-3 py-1 text-slate-400 hover:text-white text-xs transition-colors"
        >
          Discard
        </button>
      </div>
    </motion.div>
  )
}

// ── Resume Preview Templates ──────────────────────────────────────────────────

function MeridianPreview({ data, accentColor }) {
  const pi = data.personalInfo || {}
  const accent = accentColor || data.accentColor || '#6366F1'
  return (
    <div className="builder-preview bg-white" style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, lineHeight: 1.55, boxSizing: 'border-box', display: 'flex' }}>
      {/* Left accent column */}
      <div style={{ width: 7, background: accent, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '32px 28px' }}>
        {/* Header */}
        <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 14, marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: '#0F172A', letterSpacing: -0.5 }}>
            {pi.name || 'Your Name'}
          </div>
          <div style={{ fontSize: 10.5, color: accent, marginTop: 4, fontWeight: 600 }}>
            {[pi.email, pi.phone, pi.location].filter(Boolean).join(' · ')}
          </div>
          {(pi.linkedin || pi.portfolio) && (
            <div style={{ fontSize: 9.5, color: '#64748B', marginTop: 3 }}>
              {[pi.linkedin, pi.portfolio].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
        {/* Summary */}
        {data.summary && (
          <PreviewSection title="Summary" color={accent}>
            <p style={{ color: '#334155', fontSize: 11.5, lineHeight: 1.6 }}>{data.summary}</p>
          </PreviewSection>
        )}
        {/* Experience */}
        {data.experience?.some(e => e.company) && (
          <PreviewSection title="Experience" color={accent}>
            {data.experience.map((exp, i) => exp.company && (
              <div key={i} style={{ marginBottom: 14, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: 12.5 }}>{exp.role} <span style={{ color: accent }}>@ {exp.company}</span></div>
                <div style={{ fontSize: 9.5, color: '#94A3B8', marginBottom: 4 }}>{exp.duration}</div>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <div key={j} style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span style={{ color: accent, marginTop: 1, fontWeight: 700 }}>▸</span>
                    <span style={{ color: '#475569', fontSize: 11 }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}
          </PreviewSection>
        )}
        {/* Education */}
        {data.education?.some(e => e.institution) && (
          <PreviewSection title="Education" color={accent}>
            {data.education.map((ed, i) => ed.institution && (
              <div key={i} style={{ marginBottom: 10, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 11.5 }}>{ed.degree} {ed.field && `in ${ed.field}`}</div>
                <div style={{ color: '#64748B', fontSize: 10 }}>{ed.institution} {ed.year && `· ${ed.year}`} {ed.gpa && `· GPA ${ed.gpa}`}</div>
              </div>
            ))}
          </PreviewSection>
        )}
        {/* Skills */}
        {data.skills?.length > 0 && (
          <PreviewSection title="Skills" color={accent}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {data.skills.map((sk, i) => (
                <span key={i} style={{ background: `${accent}15`, color: accent, borderRadius: 4, padding: '3px 8px', fontSize: 9.5, fontWeight: 600 }}>{sk}</span>
              ))}
            </div>
          </PreviewSection>
        )}
        {/* Projects */}
        {data.projects?.some(p => p.name) && (
          <PreviewSection title="Projects" color={accent}>
            {data.projects.map((pr, i) => pr.name && (
              <div key={i} style={{ marginBottom: 10, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 11.5 }}>{pr.name} {pr.tech && <span style={{ color: '#94A3B8', fontWeight: 400 }}>· {pr.tech}</span>}</div>
                {pr.description && <div style={{ color: '#475569', fontSize: 10.5 }}>{pr.description}</div>}
              </div>
            ))}
          </PreviewSection>
        )}
      </div>
    </div>
  )
}

function SlateProPreview({ data, accentColor }) {
  const pi = data.personalInfo || {}
  const accent = accentColor || data.accentColor || '#10B981'
  return (
    <div className="builder-preview bg-white" style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, lineHeight: 1.55, padding: '34px 32px', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: `2px solid ${accent}`, paddingBottom: 12 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 25, fontWeight: 700, color: '#0F172A', letterSpacing: -0.5 }}>
          {pi.name || 'Your Name'}
        </div>
        <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 4 }}>
          {[pi.email, pi.phone, pi.location, pi.linkedin].filter(Boolean).join(' · ')}
        </div>
      </div>
      {data.summary && <SlateSection title="Summary" accent={accent}><p style={{ color: '#334155', textAlign: 'center', fontStyle: 'italic', fontSize: 11.5 }}>{data.summary}</p></SlateSection>}
      {data.experience?.some(e => e.company) && (
        <SlateSection title="Experience" accent={accent}>
          {data.experience.map((exp, i) => exp.company && (
            <div key={i} style={{ marginBottom: 14, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 12.5 }}>{exp.role}</span>
                <span style={{ color: '#94A3B8', fontSize: 9.5 }}>{exp.duration}</span>
              </div>
              <div style={{ color: accent, fontSize: 10.5, fontWeight: 600, marginBottom: 4 }}>{exp.company}</div>
              {exp.bullets?.filter(Boolean).map((b, j) => (
                <div key={j} style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                  <span style={{ color: accent }}>—</span>
                  <span style={{ color: '#475569', fontSize: 11 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </SlateSection>
      )}
      {data.education?.some(e => e.institution) && (
        <SlateSection title="Education" accent={accent}>
          {data.education.map((ed, i) => ed.institution && (
            <div key={i} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#1E293B', fontSize: 11.5 }}>{ed.degree} {ed.field && `in ${ed.field}`}</span>
                <span style={{ color: '#64748B' }}> · {ed.institution}</span>
              </div>
              <span style={{ color: '#94A3B8', fontSize: 9.5 }}>{ed.year}</span>
            </div>
          ))}
        </SlateSection>
      )}
      {data.skills?.length > 0 && (
        <SlateSection title="Skills" accent={accent}>
          <div style={{ color: '#334155', fontSize: 11 }}>{data.skills.join(' · ')}</div>
        </SlateSection>
      )}
      {data.projects?.some(p => p.name) && (
        <SlateSection title="Projects" accent={accent}>
          {data.projects.map((pr, i) => pr.name && (
            <div key={i} style={{ marginBottom: 10, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <span style={{ fontWeight: 600, color: '#1E293B', fontSize: 11.5 }}>{pr.name}</span>
              {pr.tech && <span style={{ color: accent, fontSize: 9.5 }}> [{pr.tech}]</span>}
              {pr.description && <div style={{ color: '#475569', fontSize: 10.5 }}>{pr.description}</div>}
            </div>
          ))}
        </SlateSection>
      )}
    </div>
  )
}

function ApexPreview({ data, accentColor }) {
  const pi = data.personalInfo || {}
  const accent = accentColor || data.accentColor || '#F59E0B'
  return (
    <div className="builder-preview bg-white" style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, lineHeight: 1.55, display: 'flex', boxSizing: 'border-box' }}>
      {/* Main column 70% */}
      <div style={{ flex: '0 0 68%', padding: '28px 20px 28px 26px', borderRight: '1px solid #E2E8F0' }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5, textTransform: 'uppercase' }}>
            {pi.name || 'Your Name'}
          </div>
          <div style={{ width: 44, height: 3.5, background: accent, marginTop: 4, marginBottom: 8, borderRadius: 2 }} />
          <div style={{ fontSize: 9.5, color: '#64748B' }}>{pi.email} {pi.phone && `· ${pi.phone}`}</div>
        </div>
        {data.summary && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 9.5, color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Profile</div>
            <p style={{ color: '#334155', fontSize: 11 }}>{data.summary}</p>
          </div>
        )}
        {data.experience?.some(e => e.company) && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 9.5, color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Experience</div>
            {data.experience.map((exp, i) => exp.company && (
              <div key={i} style={{ marginBottom: 12, paddingLeft: 10, borderLeft: `2.5px solid ${accent}`, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: 12 }}>{exp.role}</div>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>{exp.company} · {exp.duration}</div>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <div key={j} style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                    <span style={{ color: accent, fontWeight: 700 }}>›</span>
                    <span style={{ color: '#475569', fontSize: 10.5 }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {data.projects?.some(p => p.name) && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 9.5, color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Projects</div>
            {data.projects.map((pr, i) => pr.name && (
              <div key={i} style={{ marginBottom: 10, background: `${accent}10`, borderRadius: 6, padding: '6px 10px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 11 }}>{pr.name}</div>
                {pr.description && <div style={{ color: '#475569', fontSize: 10 }}>{pr.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Side column 30% */}
      <div style={{ flex: 1, padding: '28px 18px', background: '#F8FAFC' }}>
        {(pi.location || pi.linkedin || pi.portfolio) && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 9.5, color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Contact</div>
            {pi.location && <div style={{ color: '#64748B', marginBottom: 3 }}>📍 {pi.location}</div>}
            {pi.linkedin && <div style={{ color: '#64748B', marginBottom: 3, wordBreak: 'break-all' }}>in {pi.linkedin}</div>}
            {pi.portfolio && <div style={{ color: '#64748B', wordBreak: 'break-all' }}>🌐 {pi.portfolio}</div>}
          </div>
        )}
        {data.skills?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 9.5, color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {data.skills.map((sk, i) => (
                <span key={i} style={{ background: `${accent}18`, color: accent, borderRadius: 4, padding: '3px 7px', fontSize: 9.5, fontWeight: 600 }}>{sk}</span>
              ))}
            </div>
          </div>
        )}
        {data.education?.some(e => e.institution) && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 9.5, color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Education</div>
            {data.education.map((ed, i) => ed.institution && (
              <div key={i} style={{ marginBottom: 10, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 10.5 }}>{ed.degree}</div>
                {ed.field && <div style={{ color: '#64748B', fontSize: 10 }}>{ed.field}</div>}
                <div style={{ color: '#94A3B8', fontSize: 9.5 }}>{ed.institution} {ed.year && `· ${ed.year}`}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Preview section helpers ───────────────────────────────────────────────────
function PreviewSection({ title, color, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, borderBottom: `1.5px solid ${color}30`, paddingBottom: 4, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function SlateSection({ title, accent, children }) {
  const borderCol = accent ? `${accent}40` : '#E2E8F0'
  const titleCol = accent || '#1E293B'
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: titleCol, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, borderBottom: `1.5px solid ${borderCol}`, paddingBottom: 4, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function MinimalistPreview({ data, accentColor }) {
  const pi = data.personalInfo || {}
  const accent = accentColor || data.accentColor || '#64748B'
  return (
    <div className="builder-preview bg-white" style={{ fontFamily: "'Georgia', serif", fontSize: 11.5, lineHeight: 1.55, padding: '36px 36px', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: `2px solid ${accent}`, paddingBottom: 14, marginBottom: 18 }}>
        <div style={{ fontFamily: "'Space Grotesk', serif", fontSize: 24, fontWeight: 700, color: '#0F172A', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {pi.name || 'Your Name'}
        </div>
        <div style={{ fontSize: 10.5, color: '#475569', marginTop: 5, fontFamily: "'Inter', sans-serif" }}>
          {[pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio].filter(Boolean).join('  |  ')}
        </div>
      </div>
      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: "'Inter', sans-serif", breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
            Professional Summary
          </div>
          <p style={{ color: '#334155', fontStyle: 'italic', fontSize: 11.5 }}>{data.summary}</p>
        </div>
      )}
      {/* Experience */}
      {data.experience?.some(e => e.company) && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, borderBottom: `1px solid ${accent}40`, paddingBottom: 3, fontFamily: "'Inter', sans-serif", breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
            Experience
          </div>
          {data.experience.map((exp, i) => exp.company && (
            <div key={i} style={{ marginBottom: 12, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1E293B', fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
                <span>{exp.role} — <span style={{ color: accent, fontWeight: 600 }}>{exp.company}</span></span>
                <span style={{ color: '#64748B', fontSize: 9.5, fontWeight: 400 }}>{exp.duration}</span>
              </div>
              {exp.bullets?.filter(Boolean).map((b, j) => (
                <div key={j} style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                  <span style={{ color: accent }}>•</span>
                  <span style={{ color: '#475569', fontSize: 11 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {/* Education */}
      {data.education?.some(e => e.institution) && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, borderBottom: `1px solid ${accent}40`, paddingBottom: 3, fontFamily: "'Inter', sans-serif", breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
            Education
          </div>
          {data.education.map((ed, i) => ed.institution && (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: "'Inter', sans-serif", breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#1E293B', fontSize: 11.5 }}>{ed.degree} {ed.field && `in ${ed.field}`}</span>
                <span style={{ color: '#64748B' }}> · {ed.institution}</span>
              </div>
              <span style={{ color: '#64748B', fontSize: 9.5 }}>{ed.year}</span>
            </div>
          ))}
        </div>
      )}
      {/* Skills */}
      {data.skills?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, borderBottom: `1px solid ${accent}40`, paddingBottom: 3, fontFamily: "'Inter', sans-serif", breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
            Skills
          </div>
          <div style={{ color: '#334155', fontFamily: "'Inter', sans-serif", fontSize: 11 }}>
            {data.skills.join('  •  ')}
          </div>
        </div>
      )}
      {/* Projects */}
      {data.projects?.some(p => p.name) && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, borderBottom: `1px solid ${accent}40`, paddingBottom: 3, fontFamily: "'Inter', sans-serif", breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
            Projects
          </div>
          {data.projects.map((pr, i) => pr.name && (
            <div key={i} style={{ marginBottom: 8, fontFamily: "'Inter', sans-serif", breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <span style={{ fontWeight: 600, color: '#1E293B', fontSize: 11.5 }}>{pr.name}</span>
              {pr.tech && <span style={{ color: accent, fontSize: 9.5 }}> [{pr.tech}]</span>}
              {pr.description && <div style={{ color: '#475569', fontSize: 10.5 }}>{pr.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BuilderPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const previewRef = useRef(null)
  const pdfInputRef = useRef(null)

  const [draft, setDraft] = useState({ ...BLANK })
  const [resumeId, setResumeId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [importMsg, setImportMsg] = useState('')
  const [importingPdf, setImportingPdf] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [aiUsageCount, setAiUsageCount] = useState(0)

  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summarySuggestion, setSummarySuggestion] = useState(null)
  const [summaryError, setSummaryError] = useState(null)

  const [bulletLoadingMap, setBulletLoadingMap] = useState({})
  const [bulletSuggestionMap, setBulletSuggestionMap] = useState({})
  const [bulletErrorMap, setBulletErrorMap] = useState({})

  const STEPS = [
    { id: 0, title: 'Personal Info', icon: '👤' },
    { id: 1, title: 'Education', icon: '🎓' },
    { id: 2, title: 'Experience', icon: '💼' },
    { id: 3, title: 'Skills', icon: '⚡' },
    { id: 4, title: 'Projects', icon: '🚀' },
    { id: 5, title: 'Summary', icon: '✦' },
  ]

  function handleImportFromAnalysis() {
    const raw = localStorage.getItem('rc_analysisData')
    if (!raw) {
      alert('No recent analysis session found. Upload and analyze a resume first!')
      return
    }
    try {
      const data = JSON.parse(raw)
      const extractedSkills = []
      if (Array.isArray(data.resumeKeywords)) {
        data.resumeKeywords.forEach(k => { if (k?.keyword) extractedSkills.push(k.keyword) })
      }
      if (Array.isArray(data.strengths)) {
        data.strengths.forEach(s => {
          const firstWord = s.split(' ')[0]
          if (firstWord && firstWord.length > 3) extractedSkills.push(firstWord.toLowerCase())
        })
      }
      const uniqueSkills = [...new Set([...(draft.skills || []), ...extractedSkills])].slice(0, 15)

      update({
        skills: uniqueSkills,
        summary: data.suggestions?.length ? `Experienced candidate focusing on: ${data.suggestions.slice(0, 2).join('; ')}` : draft.summary,
      })
      setImportMsg('Imported from analysis!')
      setTimeout(() => setImportMsg(''), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  async function handlePdfUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportingPdf(true)
    setImportMsg('')
    try {
      const data = await parsePdfToDraft(file)
      if (data) {
        update({
          personalInfo: { ...BLANK.personalInfo, ...(data.personalInfo || {}) },
          summary: data.summary || draft.summary,
          education: Array.isArray(data.education) && data.education.length ? data.education : draft.education,
          experience: Array.isArray(data.experience) && data.experience.length ? data.experience : draft.experience,
          skills: Array.isArray(data.skills) ? data.skills : draft.skills,
          projects: Array.isArray(data.projects) && data.projects.length ? data.projects : draft.projects,
        })
        setImportMsg('Imported from PDF!')
        setTimeout(() => setImportMsg(''), 3500)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to parse PDF. Please ensure the file is a valid PDF resume.')
    } finally {
      setImportingPdf(false)
      if (pdfInputRef.current) pdfInputRef.current.value = ''
    }
  }

  // Pre-fill from ?sessionId= query param
  useEffect(() => {
    const sid = searchParams.get('sessionId')
    if (sid) {
      setDraft(d => ({ ...d }))
    }
    const savedId = localStorage.getItem('rc_resumeId')
    if (savedId) {
      setResumeId(savedId)
      getResumeDraft(savedId)
        .then(data => setDraft({ ...BLANK, ...data }))
        .catch(() => localStorage.removeItem('rc_resumeId'))
    }
  }, [])

  // ── Auto-save on change ──────────────────────────────────────────────────
  const persist = useCallback(async (data, id) => {
    setSaving(true)
    setSaveMsg('')
    try {
      const saved = await saveResumeDraft({ ...data, resumeId: id })
      if (!id) {
        setResumeId(saved.resumeId)
        localStorage.setItem('rc_resumeId', saved.resumeId)
      }
      setSaveMsg('Draft saved')
      setTimeout(() => setSaveMsg(''), 2500)
    } catch {
      setSaveMsg('Save failed')
    } finally {
      setSaving(false)
    }
  }, [])

  const debouncedSave = useDebounce((data, id) => persist(data, id), 1500)

  function update(patch) {
    setDraft(prev => {
      const next = { ...prev, ...patch }
      debouncedSave(next, resumeId)
      return next
    })
  }

  function updatePi(field, value) {
    update({ personalInfo: { ...draft.personalInfo, [field]: value } })
  }

  function updateArrayItem(key, index, patch) {
    const arr = [...(draft[key] || [])]
    arr[index] = { ...arr[index], ...patch }
    update({ [key]: arr })
  }

  function addArrayItem(key, blank) {
    update({ [key]: [...(draft[key] || []), blank] })
  }

  function removeArrayItem(key, index) {
    update({ [key]: draft[key].filter((_, i) => i !== index) })
  }

  function addSkill() {
    const sk = skillInput.trim()
    if (sk && !draft.skills.includes(sk)) {
      update({ skills: [...draft.skills, sk] })
    }
    setSkillInput('')
  }

  // ── PDF Export ──────────────────────────────────────────────────────────
  // Root cause of blank PDF: previewRef uses transform:scale() + position:absolute
  // inside an overflow:hidden parent. html2canvas sees layout height = 0.
  // Fix: temporarily strip transform, unhide parent overflow, capture at native size, restore.
  async function exportPdf() {
    if (!previewRef.current) return
    setExporting(true)

    const el = previewRef.current
    const parentWrapper = el.parentElement // the relative overflow-hidden wrapper

    // Save element's current styles
    const saved = {
      transform: el.style.transform,
      height: el.style.height,
      minHeight: el.style.minHeight,
      overflow: el.style.overflow,
      position: el.style.position,
      width: el.style.width,
    }
    // Save parent's overflow
    const savedParentOverflow = parentWrapper ? parentWrapper.style.overflow : null

    // Temporarily render the element at its natural full A4 size
    el.style.transform = 'none'
    el.style.position = 'relative'
    el.style.width = '794px'   // 210mm at 96dpi — exact A4 pixel width
    el.style.height = 'auto'
    el.style.minHeight = '1123px'  // 297mm at 96dpi
    el.style.overflow = 'visible'

    // Unhide parent so it doesn't clip the full-height content
    if (parentWrapper) parentWrapper.style.overflow = 'visible'

    // Add pdf-export-mode class to force hide all page break dividers and debug overlays via CSS
    el.classList.add('pdf-export-mode')
    if (parentWrapper) parentWrapper.classList.add('pdf-export-mode')

    // Temporarily hide debug indicators & page-break badges during capture
    const debugElements = el.querySelectorAll('.page-break-divider, .page-break-indicator, [data-debug-overlay]')
    debugElements.forEach(d => d.style.setProperty('display', 'none', 'important'))

    // Two animation frames to ensure layout has settled before html2canvas measures
    void el.getBoundingClientRect()
    await new Promise(r => requestAnimationFrame(r))
    await new Promise(r => requestAnimationFrame(r))

    try {
      const html2pdf = (await import('html2pdf.js')).default
      const name = (draft.personalInfo?.name || 'resume').replace(/\s+/g, '_')
      await html2pdf()
        .set({
          margin: 0,
          filename: `${name}_resume.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            width: 794,
          },
          pagebreak: { mode: ['css', 'legacy'] },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(el)
        .save()
    } finally {
      // Always restore debug elements and layout styles — even if html2pdf throws
      el.classList.remove('pdf-export-mode')
      if (parentWrapper) parentWrapper.classList.remove('pdf-export-mode')
      debugElements.forEach(d => d.style.display = '')
      el.style.transform = saved.transform
      el.style.position = saved.position
      el.style.width = saved.width
      el.style.height = saved.height
      el.style.minHeight = saved.minHeight
      el.style.overflow = saved.overflow
      if (parentWrapper && savedParentOverflow !== null) {
        parentWrapper.style.overflow = savedParentOverflow
      }
      setExporting(false)
    }
  }

  // ── Template preview component ──────────────────────────────────────────
  const PreviewComponent = draft.templateId === 'slatepro'
    ? SlateProPreview
    : draft.templateId === 'apex'
      ? ApexPreview
      : draft.templateId === 'minimalist'
        ? MinimalistPreview
        : MeridianPreview

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedGradientMesh />
      {/* Sub action bar */}
      <div className="border-b border-white/5 bg-navy-800/40 backdrop-blur-sm sticky top-16 z-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm font-bold shadow-glow-indigo">
              ✦
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-white flex items-center gap-2">
                Craft your <span className="text-gradient">standout resume</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Build ATS-formatted, print-ready resumes with live A4 preview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {importMsg && (
              <motion.span
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-xs text-indigo-300 font-semibold"
              >
                {importMsg}
              </motion.span>
            )}
            {saveMsg && (
              <motion.span
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`text-xs ${saveMsg.includes('failed') ? 'text-rose-400' : 'text-emerald-400'}`}
              >
                {saveMsg}
              </motion.span>
            )}

            {/* Hidden PDF Upload Input */}
            <input
              type="file"
              ref={pdfInputRef}
              accept=".pdf"
              className="hidden"
              onChange={handlePdfUpload}
            />
            <button
              onClick={() => pdfInputRef.current?.click()}
              disabled={importingPdf}
              className="btn-secondary text-sm py-2 px-3 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10"
              title="Upload a PDF resume to auto-fill builder form fields"
            >
              {importingPdf ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Parsing PDF...
                </>
              ) : (
                <>📄 Import from PDF</>
              )}
            </button>

            <button
              onClick={handleImportFromAnalysis}
              className="btn-secondary text-sm py-2 px-3 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10"
              title="Pre-fill skills and summary from your recent resume analysis session"
            >
              ✦ Import from Analysis
            </button>
            <button
              onClick={() => persist(draft, resumeId)}
              disabled={saving}
              className="btn-secondary text-sm py-2 px-4"
            >
              {saving ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2M7 8l5-5 5 5M12 3v13" />
                </svg>
              )}
              Save
            </button>
            <button
              id="export-pdf-btn"
              onClick={exportPdf}
              disabled={exporting}
              className="btn-primary text-sm py-2 px-4"
            >
              {exporting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              )}
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* ── LEFT: Form ─────────────────────────────────────────────────── */}
        <div className="w-full lg:w-[46%] xl:w-[44%] space-y-4 overflow-y-auto lg:max-h-[calc(100vh-140px)] lg:pr-2 pb-10">

          {/* Template selector + Muted Accent Color Picker */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-indigo-400">
                Choose Template
              </h2>

              {/* Accent Color Picker */}
              <div className="flex items-center gap-1.5 bg-navy-900/60 border border-white/5 px-2.5 py-1 rounded-full">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mr-1">Accent</span>
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => update({ accentColor: c.hex })}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      (draft.accentColor || TEMPLATES.find(t => t.id === draft.templateId)?.accent) === c.hex
                        ? 'scale-125 ring-2 ring-white/60 shadow-glow-indigo'
                        : 'hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={`Accent Color: ${c.name}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TEMPLATES.map(t => {
                const activeAccent = (draft.templateId === t.id && draft.accentColor) ? draft.accentColor : t.accent
                return (
                  <button
                    key={t.id}
                    id={`template-${t.id}`}
                    onClick={() => update({ templateId: t.id })}
                    className={draft.templateId === t.id ? 'template-card-active' : 'template-card border-white/5'}
                  >
                    {/* Mini colour swatch */}
                    <div className="w-full h-10 rounded-lg mb-2 overflow-hidden flex items-center justify-center"
                         style={{ background: `${activeAccent}15`, border: `1px solid ${activeAccent}30` }}>
                      <span style={{ width: draft.templateId === t.id ? 32 : 20, height: 4, borderRadius: 2, background: activeAccent, transition: 'width 0.3s' }} />
                    </div>
                    <div className="font-display font-bold text-white text-xs text-center">{t.name}</div>
                    <div className="text-slate-500 text-[11px] text-center mt-0.5 leading-tight hidden sm:block">{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Wizard Step Form Container */}
          <div className="glass-card p-6 min-h-[380px] flex flex-col justify-between">
            {activeStep === 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-indigo-400 text-lg">👤</span>
                  <h2 className="font-display font-bold text-white text-base">Personal Info</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full Name"><Input value={draft.personalInfo.name} onChange={v => updatePi('name', v)} placeholder="Jane Smith" /></Field>
                  <Field label="Email"><Input value={draft.personalInfo.email} onChange={v => updatePi('email', v)} placeholder="jane@example.com" type="email" /></Field>
                  <Field label="Phone"><Input value={draft.personalInfo.phone} onChange={v => updatePi('phone', v)} placeholder="+1 555 000 0000" /></Field>
                  <Field label="Location"><Input value={draft.personalInfo.location} onChange={v => updatePi('location', v)} placeholder="San Francisco, CA" /></Field>
                  <Field label="LinkedIn URL"><Input value={draft.personalInfo.linkedin} onChange={v => updatePi('linkedin', v)} placeholder="linkedin.com/in/jane" /></Field>
                  <Field label="Portfolio / GitHub"><Input value={draft.personalInfo.portfolio} onChange={v => updatePi('portfolio', v)} placeholder="github.com/jane" /></Field>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-indigo-400 text-lg">🎓</span>
                  <h2 className="font-display font-bold text-white text-base">Education</h2>
                </div>
                {(draft.education || []).map((ed, i) => (
                  <div key={i} className="border border-white/5 rounded-xl p-4 space-y-3 relative bg-navy-900/40">
                    {draft.education.length > 1 && (
                      <button onClick={() => removeArrayItem('education', i)}
                        className="absolute top-3 right-3 text-xs text-slate-600 hover:text-rose-400 transition-colors">✕</button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Institution"><Input value={ed.institution} onChange={v => updateArrayItem('education', i, { institution: v })} placeholder="MIT" /></Field>
                      <Field label="Degree"><Input value={ed.degree} onChange={v => updateArrayItem('education', i, { degree: v })} placeholder="B.S." /></Field>
                      <Field label="Field of Study"><Input value={ed.field} onChange={v => updateArrayItem('education', i, { field: v })} placeholder="Computer Science" /></Field>
                      <Field label="Graduation Year"><Input value={ed.year} onChange={v => updateArrayItem('education', i, { year: v })} placeholder="2022" /></Field>
                      <Field label="GPA (optional)"><Input value={ed.gpa} onChange={v => updateArrayItem('education', i, { gpa: v })} placeholder="3.9" /></Field>
                    </div>
                  </div>
                ))}
                <button onClick={() => addArrayItem('education', { institution: '', degree: '', field: '', year: '', gpa: '' })}
                  className="btn-ghost text-sm w-full border border-dashed border-white/10">
                  + Add Education
                </button>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-indigo-400 text-lg">💼</span>
                  <h2 className="font-display font-bold text-white text-base">Work Experience</h2>
                </div>
                {(draft.experience || []).map((exp, i) => (
                  <div key={i} className="border border-white/5 rounded-xl p-4 space-y-3 relative bg-navy-900/40">
                    {draft.experience.length > 1 && (
                      <button onClick={() => removeArrayItem('experience', i)}
                        className="absolute top-3 right-3 text-xs text-slate-600 hover:text-rose-400 transition-colors">✕</button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Company"><Input value={exp.company} onChange={v => updateArrayItem('experience', i, { company: v })} placeholder="Acme Corp" /></Field>
                      <Field label="Role / Title"><Input value={exp.role} onChange={v => updateArrayItem('experience', i, { role: v })} placeholder="Software Engineer" /></Field>
                      <Field label="Duration"><Input value={exp.duration} onChange={v => updateArrayItem('experience', i, { duration: v })} placeholder="Jan 2023 – Present" /></Field>
                    </div>
                    <Field label="Bullet Points">
                      <div className="space-y-2.5">
                        {(exp.bullets || ['']).map((bullet, j) => {
                          const key = `${i}-${j}`
                          const isLoading = bulletLoadingMap[key]
                          const suggestion = bulletSuggestionMap[key]
                          const error = bulletErrorMap[key]
                          return (
                            <div key={j} className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-xs font-mono select-none">•</span>
                                <input
                                  className="input-base text-xs flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  value={bullet}
                                  disabled={isLoading}
                                  readOnly={isLoading}
                                  placeholder="Led migration to microservices, reducing latency by 40%…"
                                  onChange={e => {
                                    const newBullets = [...(exp.bullets || [''])]
                                    newBullets[j] = e.target.value
                                    updateArrayItem('experience', i, { bullets: newBullets })
                                  }}
                                />
                                <AiImproveButton
                                  fieldType="bullet"
                                  text={bullet}
                                  iconOnly={true}
                                  aiUsageCount={aiUsageCount}
                                  setAiUsageCount={setAiUsageCount}
                                  onSuccess={(sug) => {
                                    setBulletSuggestionMap(prev => ({ ...prev, [key]: sug }))
                                  }}
                                  onLoadingChange={(loadingState) => {
                                    setBulletLoadingMap(prev => ({ ...prev, [key]: loadingState }))
                                  }}
                                  onError={(err) => {
                                    setBulletErrorMap(prev => ({ ...prev, [key]: err }))
                                  }}
                                />
                                {exp.bullets.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newBullets = exp.bullets.filter((_, idx) => idx !== j)
                                      updateArrayItem('experience', i, { bullets: newBullets })
                                    }}
                                    className="text-xs text-slate-500 hover:text-rose-400 p-1 transition-colors"
                                    title="Remove Bullet"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                              {error && (
                                <div className="text-[11px] text-rose-400 font-medium pl-4 animate-fade-in">
                                  {error}
                                </div>
                              )}
                              {suggestion && (
                                <div className="pl-4">
                                  <SuggestionCard
                                    suggestion={suggestion}
                                    onUse={() => {
                                      const newBullets = [...(exp.bullets || [''])]
                                      newBullets[j] = suggestion
                                      updateArrayItem('experience', i, { bullets: newBullets })
                                      setBulletSuggestionMap(prev => ({ ...prev, [key]: null }))
                                    }}
                                    onDiscard={() => {
                                      setBulletSuggestionMap(prev => ({ ...prev, [key]: null }))
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                        <button
                          type="button"
                          onClick={() => updateArrayItem('experience', i, { bullets: [...(exp.bullets || []), ''] })}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold pt-1 flex items-center gap-1"
                        >
                          + Add Bullet Point
                        </button>
                      </div>
                    </Field>
                  </div>
                ))}
                <button onClick={() => addArrayItem('experience', { company: '', role: '', duration: '', bullets: [''] })}
                  className="btn-ghost text-sm w-full border border-dashed border-white/10">
                  + Add Position
                </button>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-indigo-400 text-lg">⚡</span>
                  <h2 className="font-display font-bold text-white text-base">Skills</h2>
                </div>
                <div className="flex gap-2">
                  <input
                    className="input-base"
                    value={skillInput}
                    placeholder="Type a skill and press Enter…"
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                  />
                  <button onClick={addSkill} className="btn-secondary px-4 shrink-0">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(draft.skills || []).map((sk, i) => (
                    <motion.span
                      key={sk}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300
                                 rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {sk}
                      <button onClick={() => update({ skills: draft.skills.filter((_, j) => j !== i) })}
                        className="text-indigo-400/60 hover:text-rose-400 transition-colors">✕</button>
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-indigo-400 text-lg">🚀</span>
                  <h2 className="font-display font-bold text-white text-base">Projects</h2>
                </div>
                {(draft.projects || []).map((pr, i) => (
                  <div key={i} className="border border-white/5 rounded-xl p-4 space-y-3 relative bg-navy-900/40">
                    {draft.projects.length > 1 && (
                      <button onClick={() => removeArrayItem('projects', i)}
                        className="absolute top-3 right-3 text-xs text-slate-600 hover:text-rose-400 transition-colors">✕</button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Project Name"><Input value={pr.name} onChange={v => updateArrayItem('projects', i, { name: v })} placeholder="Portfolio API" /></Field>
                      <Field label="Tech Stack"><Input value={pr.tech} onChange={v => updateArrayItem('projects', i, { tech: v })} placeholder="React, Node, MongoDB" /></Field>
                      <Field label="URL (optional)"><Input value={pr.url} onChange={v => updateArrayItem('projects', i, { url: v })} placeholder="github.com/…" /></Field>
                    </div>
                    <Field label="Description">
                      <textarea
                        className="input-base h-16"
                        value={pr.description}
                        onChange={e => updateArrayItem('projects', i, { description: e.target.value })}
                        placeholder="What it does and the impact it had…"
                      />
                    </Field>
                  </div>
                ))}
                <button onClick={() => addArrayItem('projects', { name: '', description: '', tech: '', url: '' })}
                  className="btn-ghost text-sm w-full border border-dashed border-white/10">
                  + Add Project
                </button>
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-indigo-400 text-lg">✦</span>
                  <h2 className="font-display font-bold text-white text-base">Professional Summary</h2>
                </div>
                <Field
                  label="2-3 sentence overview"
                  action={
                    <AiImproveButton
                      fieldType="summary"
                      text={draft.summary}
                      aiUsageCount={aiUsageCount}
                      setAiUsageCount={setAiUsageCount}
                      onSuccess={setSummarySuggestion}
                      onLoadingChange={setSummaryLoading}
                      onError={setSummaryError}
                    />
                  }
                >
                  <textarea
                    className="input-base h-32 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={draft.summary}
                    disabled={summaryLoading}
                    readOnly={summaryLoading}
                    placeholder="Concise snapshot of your background, expertise, and career goal…"
                    onChange={e => update({ summary: e.target.value })}
                  />
                  {summaryError && (
                    <div className="text-[11px] text-rose-400 font-medium mt-1.5 animate-fade-in">
                      {summaryError}
                    </div>
                  )}
                  {summarySuggestion && (
                    <SuggestionCard
                      suggestion={summarySuggestion}
                      onUse={() => {
                        update({ summary: summarySuggestion })
                        setSummarySuggestion(null)
                      }}
                      onDiscard={() => setSummarySuggestion(null)}
                    />
                  )}
                </Field>
              </div>
            )}

            {/* Bottom Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5">
              <button
                id="prev-step-btn"
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className="btn-secondary text-xs py-2 px-4"
              >
                ← Previous Step
              </button>
              <span className="text-xs text-slate-400 font-mono font-semibold">
                Step {activeStep + 1} of {STEPS.length}: <span className="text-indigo-400 font-bold">{STEPS[activeStep].title}</span>
              </span>
              <button
                id="next-step-btn"
                onClick={() => setActiveStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                disabled={activeStep === STEPS.length - 1}
                className="btn-primary text-xs py-2 px-4"
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Live Preview ─────────────────────────────────────────── */}
        <div className="w-full lg:w-[54%] xl:w-[56%] lg:sticky lg:top-24 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Preview — A4
            </span>
            <span className="text-xs text-slate-400">
              Template: <span className="text-indigo-400 font-bold">{TEMPLATES.find(t => t.id === draft.templateId)?.name}</span>
            </span>
          </div>

          {/* Scrollable A4 Canvas Viewport Frame */}
          <div className="glass-card p-3 rounded-2xl overflow-y-auto max-h-[calc(100vh-170px)] border border-white/10 shadow-2xl">
            <div
              className="relative mx-auto overflow-hidden rounded-lg bg-white shadow-card transition-all duration-300"
              style={{
                width: '100%',
                height: 'calc(var(--preview-height, 1122px) * var(--preview-scale, 0.46))',
                minHeight: '400px',
              }}
            >
              <div
                ref={previewRef}
                className="absolute top-0 left-0 bg-white"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  height: 'auto',
                  transformOrigin: 'top left',
                  transform: 'scale(var(--preview-scale, 0.46))',
                  boxSizing: 'border-box',
                }}
                id="resume-preview"
              >
                <motion.div
                  key={draft.templateId + (draft.accentColor || '')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <PreviewComponent data={draft} accentColor={draft.accentColor || TEMPLATES.find(t => t.id === draft.templateId)?.accent} />
                </motion.div>
              </div>
              {/* Scale preview and dynamic height adjustment */}
              <PreviewScaler />
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Scroll to preview full document — export PDF for print output.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * PreviewScaler — Approach (b): Pure natural flow pagination.
 * 
 * Rules:
 * - NO justifyContent stretching anywhere in templates.
 * - Content height is always the raw natural scrollHeight of the template.
 * - Container height snaps to the nearest A4 page multiple (so page break lines land cleanly).
 * - Scale factor is purely derived from available container width vs 210mm A4.
 * - A dev debug overlay (bottom-right corner) shows rawHeight, numPages, and scale.
 */
function PreviewScaler() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const canvasBox = el.parentElement
    const previewEl = document.getElementById('resume-preview')

    // Create or reuse a debug overlay element
    let debugEl = canvasBox.querySelector('.preview-debug-overlay')
    if (!debugEl) {
      debugEl = document.createElement('div')
      debugEl.className = 'preview-debug-overlay'
      debugEl.style.cssText = [
        'position: absolute',
        'bottom: 4px',
        'right: 4px',
        'background: rgba(15,23,42,0.82)',
        'color: #94A3B8',
        'font-size: 9px',
        'font-family: monospace',
        'padding: 3px 7px',
        'border-radius: 5px',
        'z-index: 100',
        'pointer-events: none',
        'line-height: 1.6',
      ].join('; ')
      canvasBox.appendChild(debugEl)
    }

    const update = () => {
      if (!canvasBox || !previewEl) return
      const A4_MM_WIDTH = 210
      const PX_PER_MM = 3.7795275591
      const a4PxWidth = A4_MM_WIDTH * PX_PER_MM   // ~793.7px
      const a4PxHeight = 297 * PX_PER_MM           // ~1122.5px
      const boxWidth = canvasBox.clientWidth || 400
      const scale = boxWidth / a4PxWidth

      // Natural content height — NO stretching, just what the template renders
      const innerContent = previewEl.firstElementChild
      const rawHeight = innerContent
        ? innerContent.scrollHeight
        : previewEl.scrollHeight

      // Snap to whole A4 page multiples so page-break dividers align cleanly.
      // A partially-filled final page is expected and normal (Word/Docs behaviour).
      const numPages = Math.max(1, Math.ceil((rawHeight - 10) / a4PxHeight))
      const containerPxHeight = numPages * a4PxHeight

      canvasBox.style.setProperty('--preview-scale', scale)
      // NOTE: The CSS wrapper does calc(var(--preview-height) * var(--preview-scale)),
      // so we pass the RAW unscaled px height here — not pre-multiplied.
      canvasBox.style.setProperty('--preview-height', `${containerPxHeight}px`)
      previewEl.style.transform = `scale(${scale})`
      previewEl.style.height = `${containerPxHeight}px`
      previewEl.style.overflow = 'hidden'

      // Remove old page-break dividers and re-render
      previewEl.querySelectorAll('.page-break-divider').forEach(d => d.remove())
      if (numPages > 1) {
        for (let p = 1; p < numPages; p++) {
          const div = document.createElement('div')
          div.className = 'page-break-divider'
          div.style.cssText = `position: absolute; top: ${p * 297}mm; left: 0; right: 0; border-top: 2px dashed #6366F1; z-index: 20; pointer-events: none;`
          div.innerHTML = `<span style="position:absolute;right:16px;top:-10px;background:#4338CA;color:#FFF;font-size:10px;font-weight:700;padding:2px 10px;border-radius:12px;font-family:system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.25);">Page ${p + 1}</span>`
          previewEl.appendChild(div)
        }
      }

      // Dev debug overlay
      debugEl.innerHTML = `rawH: ${rawHeight}px | pages: ${numPages} | scale: ${scale.toFixed(3)}`
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(canvasBox)
    if (previewEl) ro.observe(previewEl)
    if (previewEl?.firstElementChild) ro.observe(previewEl.firstElementChild)
    return () => ro.disconnect()
  }, [])
  return <span ref={ref} style={{ display: 'none' }} />
}
