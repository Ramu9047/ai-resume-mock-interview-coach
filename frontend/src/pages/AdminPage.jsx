import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  getAnalyticsOverview,
  getAtsOverTime,
  getTopGaps,
  getTopJdKeywords,
  adminLogin,
  adminLogout,
  verifyAdminSession,
} from '../api/client'

// ── Colours matching the design system ───────────────────────────────────────
const INDIGO  = '#6366F1'
const EMERALD = '#10B981'
const AMBER   = '#F59E0B'
const ROSE    = '#FB7185'
const SLATE   = '#475569'

const CHART_STYLE = {
  background: 'transparent',
  fontSize: 11,
  fontFamily: 'Inter, sans-serif',
}

const TOOLTIP_STYLE = {
  backgroundColor: '#0F1629',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: '#E2E8F0',
  fontSize: 12,
}

// ── Bar gradient for top gaps ─────────────────────────────────────────────────
function gapColor(index, total) {
  const t = index / Math.max(total - 1, 1)
  return `hsl(${Math.round(340 - t * 140)}, 80%, 65%)`
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-5"
      style={{ borderColor: `${accent}25` }}
    >
      <div className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">{label}</div>
      <div className="font-display text-4xl font-bold" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </motion.div>
  )
}

// ── Custom axis tick ─────────────────────────────────────────────────────────
function DateTick({ x, y, payload }) {
  const parts = (payload?.value || '').split('-')
  const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : payload?.value
  return (
    <text x={x} y={y + 12} textAnchor="middle" fill="#64748B" fontSize={10} fontFamily="Inter,sans-serif">
      {label}
    </text>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function AtsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2">
      <div className="text-slate-400 text-xs mb-1">{label}</div>
      <div className="font-semibold" style={{ color: INDIGO }}>Avg ATS: {payload[0].value.toFixed(1)}</div>
      {payload[1] && <div className="text-slate-500 text-xs">{payload[1].value} sessions</div>}
    </div>
  )
}

function GapTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ ...TOOLTIP_STYLE, maxWidth: 280 }} className="px-3 py-2">
      <div className="text-slate-300 text-xs leading-relaxed">{payload[0].payload.gap}</div>
      <div className="font-semibold text-rose-300 mt-1">{payload[0].value} sessions</div>
    </div>
  )
}

function KwTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2">
      <div className="text-slate-300 font-mono text-xs">{payload[0].payload.keyword}</div>
      <div className="font-semibold text-emerald-300 mt-1">{payload[0].value}× in JDs</div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth]   = useState(true)
  const [adminKey, setAdminKey]           = useState('')
  const [loginError, setLoginError]       = useState('')
  const [loginLoading, setLoginLoading]   = useState(false)
  const [showKey, setShowKey]             = useState(false)

  const [overview, setOverview]   = useState(null)
  const [atsTime,  setAtsTime]    = useState([])
  const [topGaps,  setTopGaps]    = useState([])
  const [topKw,    setTopKw]      = useState([])
  const [loading,  setLoading]    = useState(false)
  const [error,    setError]      = useState('')

  // 1. Verify session on mount
  useEffect(() => {
    async function initAuth() {
      const isValid = await verifyAdminSession()
      if (isValid) {
        setAuthenticated(true)
        loadAnalytics()
      }
      setCheckingAuth(false)
    }
    initAuth()
  }, [])

  // 2. Fetch analytics when authenticated
  async function loadAnalytics() {
    setLoading(true)
    setError('')
    try {
      const [ov, at, tg, tk] = await Promise.all([
        getAnalyticsOverview(),
        getAtsOverTime(),
        getTopGaps(),
        getTopJdKeywords(),
      ])
      setOverview(ov)
      setAtsTime(at)
      setTopGaps(tg)
      setTopKw(tk)
    } catch (e) {
      console.error(e)
      if (e.response?.status === 401) {
        setAuthenticated(false)
        setLoginError('Admin session expired. Please re-authenticate.')
      } else {
        setError('Could not load analytics. Is the backend running?')
      }
    } finally {
      setLoading(false)
    }
  }

  // 3. Handle Login Submission
  async function handleLogin(e) {
    e.preventDefault()
    if (!adminKey.trim() || loginLoading) return
    setLoginLoading(true)
    setLoginError('')

    try {
      const res = await adminLogin(adminKey.trim())
      if (res?.token) {
        setAuthenticated(true)
        setAdminKey('')
        loadAnalytics()
      }
    } catch (err) {
      console.error(err)
      if (err.response?.status === 429) {
        setLoginError(err.response?.data?.error || 'Too many failed attempts. Rate limited for 15 minutes.')
      } else if (err.response?.status === 401) {
        setLoginError(err.response?.data?.error || 'Invalid admin credential.')
      } else {
        setLoginError('Login failed. Please verify backend server is running.')
      }
    } finally {
      setLoginLoading(false)
    }
  }

  // 4. Handle Logout
  async function handleLogout() {
    await adminLogout()
    setAuthenticated(false)
    setOverview(null)
    setAtsTime([])
    setTopGaps([])
    setTopKw([])
    setLoginError('')
  }

  // Truncate long gap strings for axis label
  function shortGap(g) {
    return g?.length > 28 ? g.substring(0, 26) + '…' : g
  }

  // ── Render Checking Auth State ─────────────────────────────────────────────
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <svg className="w-5 h-5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Verifying security authorization...
        </div>
      </div>
    )
  }

  // ── Render Unauthenticated Security Gate ────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-navy-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 z-10"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl font-bold mx-auto shadow-glow-indigo">
              🔒
            </div>
            <h1 className="font-display text-xl font-bold text-white tracking-tight">
              Admin Analytics Gate
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restricted portal. Dedicated security credential required to access telemetry and platform metrics.
            </p>
          </div>

          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
            >
              <span className="font-bold text-rose-400 shrink-0">⚠️</span>
              <span>{loginError}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Admin Secret Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter secret credential..."
                  required
                  className="input-base pr-10 font-mono text-sm py-2.5"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading || !adminKey.trim()}
              className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Unlock Analytics'
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 flex items-center justify-center text-[11px] text-slate-500">
            <span>Protected Resource · Security Audit Active</span>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Render Authenticated Dashboard ─────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 bg-navy-800/40 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="btn-ghost text-sm p-2" title="Return Home">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="font-display text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Analytics Dashboard
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Secured Admin Telemetry · Rate-Limited & Audited</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 hidden md:block">/admin</span>
            <button
              onClick={handleLogout}
              className="btn-secondary text-xs py-1.5 px-3 text-rose-300 border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-1.5"
            >
              <span>🔒</span> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Error state */}
        {error && (
          <div className="glass-card p-6 text-rose-400 text-center border-rose-500/20 mb-6">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse h-28" />
            ))}
          </div>
        )}

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Sessions"
              value={overview.totalSessions.toLocaleString()}
              sub="All-time resume analyses"
              accent={INDIGO}
              delay={0}
            />
            <StatCard
              label="Avg ATS Score"
              value={`${overview.avgAtsScore}%`}
              sub="Across all sessions"
              accent={overview.avgAtsScore >= 70 ? EMERALD : overview.avgAtsScore >= 50 ? AMBER : ROSE}
              delay={0.08}
            />
            <StatCard
              label="Resume Drafts"
              value={overview.totalResumeDrafts.toLocaleString()}
              sub="Builder drafts saved"
              accent={AMBER}
              delay={0.16}
            />
          </div>
        )}

        {/* ── ATS over time + Top Gaps ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line chart: ATS over time */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="chart-card"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-base font-semibold text-white">ATS Score Over Time</h2>
              <span className="text-xs text-slate-500 bg-navy-700/60 px-2.5 py-1 rounded-full">Last 30 days · daily avg</span>
            </div>
            {atsTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={atsTime} style={CHART_STYLE} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={<DateTick />} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                  <Tooltip content={<AtsTooltip />} cursor={{ stroke: INDIGO, strokeWidth: 1, strokeDasharray: '4 2' }} />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke={INDIGO}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: INDIGO, stroke: '#0F1629', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sessionCount"
                    stroke={EMERALD}
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    dot={false}
                    opacity={0.4}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-600 text-sm">
                No session data yet
              </div>
            )}
            <div className="flex gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-4 h-0.5 bg-indigo-500 inline-block rounded" /> Avg ATS
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-4 border-t border-dashed border-emerald-500 inline-block opacity-50" /> Session volume
              </span>
            </div>
          </motion.div>

          {/* Bar chart: Top 10 skill gaps */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.33 }}
            className="chart-card"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-base font-semibold text-white">Most Frequent Skill Gaps</h2>
              <span className="text-xs text-slate-500 bg-navy-700/60 px-2.5 py-1 rounded-full">Top 10 · all sessions</span>
            </div>
            {topGaps.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topGaps} layout="vertical" style={CHART_STYLE} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="gap"
                    width={130}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    tickFormatter={shortGap}
                  />
                  <Tooltip content={<GapTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {topGaps.map((_, i) => (
                      <Cell key={i} fill={gapColor(i, topGaps.length)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-600 text-sm">
                No gap data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Top JD Keywords (full width) ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42 }}
          className="chart-card"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-semibold text-white">Most Common JD Keywords</h2>
            <span className="text-xs text-slate-500 bg-navy-700/60 px-2.5 py-1 rounded-full">
              Top 15 · aggregated across all job descriptions
            </span>
          </div>
          {topKw.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topKw} style={CHART_STYLE} margin={{ top: 4, right: 8, left: -20, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="keyword"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip content={<KwTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" fill={EMERALD} radius={[4, 4, 0, 0]} opacity={0.85}>
                  {topKw.map((_, i) => (
                    <Cell key={i} fill={`hsl(${162 - i * 4}, 70%, ${55 - i * 1.5}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">
              No keyword data yet — run some resume analyses first.
            </div>
          )}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-center text-xs text-slate-700 mt-8"
        >
          Internal dashboard · Analytics cached for 5 minutes · Secured & IP Audited
        </motion.p>
      </div>
    </div>
  )
}

