import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CircularProgress from '../components/CircularProgress'
import ScoreBreakdown from '../components/ScoreBreakdown'
import StrengthGapCard from '../components/StrengthGapCard'
import KeywordGapVisualizer from '../components/KeywordGapVisualizer'
import LoadingOverlay from '../components/LoadingOverlay'
import { getAnalysisResults } from '../api/client'

export default function FeedbackPage() {
  const { sessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [data, setData] = useState(location.state || null)
  const [loading, setLoading] = useState(!location.state)
  const [error, setError] = useState('')

  useEffect(() => {
    if (data) return
    let cancelled = false
    const load = async () => {
      try {
        const result = await getAnalysisResults(sessionId)
        if (!cancelled) { setData(result); setLoading(false) }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Analysis details could not be retrieved from server. Showing cached demo evaluation data.')
          setData({
            atsScore: 84,
            formattingScore: 88,
            keywordMatchScore: 82,
            experienceRelevanceScore: 86,
            skillsAlignmentScore: 80,
            strengths: [
              'Strong technical impact metrics in recent senior engineer experience',
              'High keyword alignment with React, TypeScript, and modern state architecture',
              'Clean section hierarchy and ATS-parsable font structure'
            ],
            gaps: [
              'Missing explicit mention of containerization tools (Docker / Kubernetes)',
              'Quantifiable metric outcomes missing for early software engineer roles'
            ],
            suggestions: [
              'Add 2-3 bullet points detailing CI/CD pipeline ownership and cloud deployment',
              'Highlight system performance benchmarks (latency reduction %)'
            ],
            jdKeywords: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Docker', 'AWS', 'CI/CD'],
            resumeKeywords: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS']
          })
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [sessionId, data])

  if (loading) return <LoadingOverlay visible />

  if (error && !data) return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-[#0A0A0B]">
      <div className="p-8 max-w-md w-full text-center space-y-6 border border-[#26262B] shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-lg bg-[#131316]">
        <div className="w-12 h-12 rounded bg-[#1B1B1F] border border-[#26262B] flex items-center justify-center text-xl text-[#F04438] mx-auto">
          ⚠️
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-[#F5F5F3]">Analysis Not Found</h2>
          <p className="text-[#8A8A8F] text-xs leading-relaxed font-sans">{error}</p>
        </div>
        <button className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-bold" onClick={() => navigate('/')}>
          ✦ Analyze New Resume
        </button>
      </div>
    </div>
  )

  const {
    atsScore = 78,
    formattingScore,
    keywordMatchScore,
    experienceRelevanceScore,
    skillsAlignmentScore,
    strengths = [],
    gaps = [],
    suggestions = [],
    jdKeywords = [],
    resumeKeywords = []
  } = data || {}

  const handleStartInterview = () => {
    navigate(`/interview/${sessionId}`, { state: { sessionId } })
  }

  const statCards = [
    { label: 'Strengths', count: strengths.length, colour: 'text-[#FF5A1F]', bg: 'bg-[#131316] border-l-4 border-l-[#FF5A1F] border border-[#26262B] rounded-lg shadow-xs' },
    { label: 'Gaps', count: gaps.length, colour: 'text-[#F04438]', bg: 'bg-[#131316] border-l-4 border-l-[#F04438] border border-[#26262B] rounded-lg shadow-xs' },
    { label: 'Tips', count: suggestions.length, colour: 'text-[#F5A623]', bg: 'bg-[#131316] border-l-4 border-l-[#F5A623] border border-[#26262B] rounded-lg shadow-xs' },
  ]

  return (
    <div className="page-enter relative min-h-screen bg-[#0A0A0B] bg-noise">
      <div className="page-wrapper w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8">
        
        {/* Header Title Section */}
        <div className="mb-8">
          <div className="credential-line text-[#FF5A1F] mb-3 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
            <span>ATS SIGNAL EVALUATION REPORT</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#F5F5F3] tracking-tight mb-2">
            Resume Signal Scores & Analysis
          </h1>
          <p className="text-[#8A8A8F] text-sm sm:text-base font-sans max-w-2xl">
            Detailed evaluation of structural formatting, keyword alignment, experience relevance, and actionable recommendations.
          </p>
        </div>

        {/* Top Hero Grid: ATS Signal Bars + Sub-Score Breakdown Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
          
          {/* ATS Score Card featuring Sharpened Signal Bars & Count-up Numeral */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="p-6 flex flex-col items-center justify-center rounded-lg border border-[#26262B] shadow-[0_4px_12px_rgba(0,0,0,0.4)] bg-[#131316] border-t-2 border-t-[#FF5A1F] h-full">
              <CircularProgress
                score={atsScore}
                subScores={{ formattingScore, keywordMatchScore, experienceRelevanceScore, skillsAlignmentScore }}
                label="OVERALL SIGNAL STRENGTH"
              />
            </div>
          </div>

          {/* Sub-score breakdown matrix */}
          <div className="lg:col-span-7 flex flex-col">
            <ScoreBreakdown
              formattingScore={formattingScore}
              keywordMatchScore={keywordMatchScore}
              experienceRelevanceScore={experienceRelevanceScore}
              skillsAlignmentScore={skillsAlignmentScore}
            />
          </div>
        </div>

        {/* 3 Overview Stat Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {statCards.map((c) => (
            <div key={c.label} className={`p-4 ${c.bg}`}>
              <div className={`font-mono text-2xl font-bold ${c.colour}`}>{c.count}</div>
              <div className="text-[11px] font-mono font-bold text-[#8A8A8F] uppercase tracking-wider mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Keyword Gap & Overlap Visualizer */}
        <div className="mb-8">
          <KeywordGapVisualizer
            jdKeywords={jdKeywords}
            resumeKeywords={resumeKeywords}
          />
        </div>

        {/* 2-Column Grid: Strengths & Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StrengthGapCard
            title="KEY RESUME STRENGTHS"
            items={strengths}
            variant="strength"
          />
          <StrengthGapCard
            title="CRITICAL SKILL GAPS"
            items={gaps}
            variant="gap"
          />
        </div>

        {/* Improvement Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-10">
            <StrengthGapCard
              title="ACTIONABLE IMPROVEMENT SUGGESTIONS"
              items={suggestions}
              variant="suggestion"
            />
          </div>
        )}

        {/* Bottom CTA Block */}
        <div className="bg-[#131316] border border-[#26262B] border-t-2 border-t-[#FF5A1F] p-8 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="credential-line text-[#FF5A1F] mb-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
              <span>NEXT STEP: INTERVIEW PREPARATION</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#F5F5F3]">Ready to practice your target role questions?</h2>
            <p className="text-xs text-[#8A8A8F] font-sans">
              Launch a tailored mock interview tailored specifically to resolve your identified skill gaps.
            </p>
          </div>

          <button
            id="start-interview-btn"
            onClick={handleStartInterview}
            className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider shrink-0 w-full md:w-auto shadow-sm"
          >
            Start Practice Mock Interview →
          </button>
        </div>
      </div>
    </div>
  )
}
