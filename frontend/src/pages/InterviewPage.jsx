import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingOverlay from '../components/LoadingOverlay'
import ScoreBar from '../components/ScoreBar'
import AnimatedGradientMesh from '../components/AnimatedGradientMesh'
import { generateQuestions, submitAnswer } from '../api/client'

const categoryLabel = {
  technical:  'Technical',
  behavioral: 'Behavioral',
  'role-fit': 'Role Fit',
}

const categoryBadge = {
  technical:  'badge-technical',
  behavioral: 'badge-behavioral',
  'role-fit': 'badge-role-fit',
}

export default function InterviewPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState([]) // [{score, feedback}] indexed by question order
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loadMsg, setLoadMsg] = useState('Generating your interview questions…')

  // Load questions on mount
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await generateQuestions(sessionId)
        if (!cancelled) {
          setQuestions(data.questions)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'Failed to generate questions. Please try again.')
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [sessionId])

  const currentQuestion = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1
  const answered = results[currentIdx] !== undefined

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setError('')
    setSubmitting(true)
    setLoadMsg('Evaluating your answer…')
    try {
      const result = await submitAnswer(sessionId, currentQuestion.questionId, answer.trim())
      const newResults = [...results]
      newResults[currentIdx] = { ...result, answer: answer.trim() }
      setResults(newResults)
      setShowFeedback(true)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to submit answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (isLast) {
      navigate(`/summary/${sessionId}`)
    } else {
      setCurrentIdx(i => i + 1)
      setAnswer('')
      setShowFeedback(false)
      setError('')
    }
  }

  if (loading) return <LoadingOverlay visible message={loadMsg} />

  if (error && questions.length === 0) return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AnimatedGradientMesh />
      <div className="glass-card p-10 max-w-lg w-full text-center space-y-6 shadow-glow-indigo border-indigo-500/20 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl mx-auto shadow-glow-indigo">
          🎙️
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-white">
            Mock Interview <span className="text-gradient">Unavailable</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {error || 'Could not generate interview questions for this session. Please make sure your resume is analyzed first.'}
          </p>
        </div>
        <button className="btn-primary w-full py-3.5 text-sm" onClick={() => navigate('/')}>
          ✦ Analyze Resume Now
        </button>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen">
      <AnimatedGradientMesh />
      <LoadingOverlay visible={submitting} message="Evaluating your answer…" />

      <div className="page-wrapper w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 page-enter relative z-10 py-8">
        {/* Header section */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            ✦ ADAPTIVE MOCK INTERVIEW
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            Interactive <span className="text-gradient">Mock Technical Interview</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Practice tailored behavioral and technical questions generated from your target job requirements.
          </p>
        </div>

        {/* Question progress tracker */}
        <div className="glass-card px-5 py-3.5 mb-6 flex items-center justify-between">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-slate-300">Progress</span>
          <div className="flex items-center gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300
                  ${i === currentIdx
                    ? 'w-6 h-2 bg-indigo-500 shadow-glow-indigo'
                    : results[i] !== undefined
                      ? 'w-2 h-2 bg-emerald-500'
                      : 'w-2 h-2 bg-white/15'
                  }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 font-mono font-semibold">
            {currentIdx + 1} / {questions.length}
          </span>
        </div>
        {/* Question card */}
        <div className="glass-card p-7 mb-6 animate-slide-up animation-fill-both">
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className={`${categoryBadge[currentQuestion?.category] ?? 'badge'}`}>
              {categoryLabel[currentQuestion?.category] ?? currentQuestion?.category}
            </span>
            <span className="text-xs text-slate-600">Question {currentIdx + 1}</span>
          </div>

          {/* Question text */}
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-white leading-snug">
            {currentQuestion?.question}
          </h2>
        </div>

        {/* Answer area */}
        {!showFeedback ? (
          <div className="space-y-4 animate-fade-in">
            <textarea
              id="answer-textarea"
              className="input-base h-44"
              placeholder="Type your answer here. Be specific — mention tools, methods, and outcomes where possible…"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={submitting}
            />

            {error && (
              <p className="text-sm text-rose-400 animate-fade-in">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">
                {answer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                id="submit-answer-btn"
                onClick={handleSubmit}
                disabled={!answer.trim() || submitting}
                className="btn-primary"
              >
                {submitting ? 'Evaluating…' : 'Submit Answer'}
              </button>
            </div>
          </div>
        ) : (
          /* Feedback panel */
          <div className="space-y-4 animate-slide-up animation-fill-both">
            {/* Score */}
            <div className="glass-card p-5">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Answer Score</p>
              <ScoreBar score={results[currentIdx]?.score ?? 0} animate />
            </div>

            {/* Feedback text */}
            <div className="glass-card p-5">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">AI Feedback</p>
              <p className="text-slate-200 leading-relaxed text-sm">
                {results[currentIdx]?.feedback}
              </p>
            </div>

            {/* Your answer */}
            <details className="glass-card p-5 group cursor-pointer">
              <summary className="text-xs text-slate-500 uppercase tracking-widest list-none flex items-center justify-between">
                Your Answer
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">{results[currentIdx]?.answer}</p>
            </details>

            {/* Next / Finish */}
            <div className="flex justify-end pt-2">
              <button
                id="next-question-btn"
                onClick={handleNext}
                className="btn-primary"
              >
                {isLast ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View My Results
                  </>
                ) : (
                  <>
                    Next Question
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
