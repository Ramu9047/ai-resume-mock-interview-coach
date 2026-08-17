import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingOverlay from '../components/LoadingOverlay'
import ScoreBar from '../components/ScoreBar'
import { evaluateAnswer, generateQuestions } from '../api/client'

export default function InterviewPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answer, setAnswer] = useState('')

  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [evaluating, setEvaluating] = useState(false)

  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  // Speech recognition state
  const [listening, setListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef(null)
  const baseAnswerRef = useRef('')
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onresult = (event) => {
        let finalStr = ''
        let interimStr = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalStr += trans + ' '
          } else {
            interimStr += trans
          }
        }

        if (finalStr) {
          finalTranscriptRef.current += finalStr
        }

        const sessionText = (finalTranscriptRef.current + interimStr).replace(/\s+/g, ' ')
        const prefix = baseAnswerRef.current ? baseAnswerRef.current.trim() + ' ' : ''
        setAnswer((prefix + sessionText).trimStart())
      }

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error)
        setListening(false)
      }

      rec.onend = () => {
        setListening(false)
      }
      recognitionRef.current = rec
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      try {
        baseAnswerRef.current = answer
        finalTranscriptRef.current = ''
        recognitionRef.current.start()
        setListening(true)
      } catch (e) {
        console.error('Speech start error:', e)
      }
    }
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const rawAnalysis = localStorage.getItem('rc_analysisData')
        let parsed = null
        if (rawAnalysis) {
          try { parsed = JSON.parse(rawAnalysis) } catch(e) {}
        }

        const res = await generateQuestions(
          sessionId,
          parsed?.jdKeywords || [],
          parsed?.gaps || []
        )
        const list = res.questions || res || []
        if (!cancelled) { setQuestions(list); setLoadingQuestions(false) }
      } catch (err) {
        if (!cancelled) {
          setQuestions([
            { id: 1, category: 'technical', question: 'How do you optimize React component rendering performance in high-throughput applications?' },
            { id: 2, category: 'behavioral', question: 'Describe a situation where you had to negotiate technical debt priorities with product stakeholders.' },
            { id: 3, category: 'role-fit', question: 'What architectural decisions do you consider when designing scalable micro-frontend architectures?' }
          ])
          setLoadingQuestions(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [sessionId])

  if (loadingQuestions) return <LoadingOverlay visible />

  const currentQ = questions[currentIdx] || {}
  const isLast = currentIdx === questions.length - 1

  const handleNext = async () => {
    if (!answer.trim()) return
    setError('')
    setEvaluating(true)

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }

    try {
      const qId = currentQ.questionId || `q${currentIdx + 1}`
      const evalRes = await evaluateAnswer(sessionId, qId, answer)
      const newResult = {
        question: currentQ.question,
        category: currentQ.category,
        answer,
        score: evalRes.score,
        feedback: evalRes.feedback,
      }
      const updated = [...results, newResult]
      setResults(updated)
      setAnswer('')

      if (isLast) {
        navigate(`/summary/${sessionId}`, { state: { breakdown: updated } })
      } else {
        setCurrentIdx(prev => prev + 1)
      }
    } catch (err) {
      console.error('Answer evaluation error:', err)
      const cleanAns = answer.trim().toLowerCase()
      const isLowQuality = !cleanAns || cleanAns.length < 15 || cleanAns === 'nothing' || cleanAns.includes('nothing')
      const fallbackResult = {
        question: currentQ.question,
        category: currentQ.category,
        answer,
        score: isLowQuality ? 1.0 : 5.0,
        feedback: isLowQuality
          ? 'Minimal response provided. Response does not address the technical or behavioral requirements of the question.'
          : 'Answer recorded for session evaluation.',
      }
      const updated = [...results, fallbackResult]
      setResults(updated)
      setAnswer('')

      if (isLast) {
        navigate(`/summary/${sessionId}`, { state: { breakdown: updated } })
      } else {
        setCurrentIdx(prev => prev + 1)
      }
    } finally {
      setEvaluating(false)
    }
  }

  const categoryLabel = {
    technical: 'Technical Depth',
    behavioral: 'Behavioral Execution',
    'role-fit': 'Role Architecture',
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0B] bg-noise">
      <div className="page-wrapper w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Top Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="credential-line text-[#FF5A1F] mb-2 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
              <span>INTERVIEW SESSION IN PROGRESS</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-[#F5F5F3]">
              Mock Technical Interview
            </h1>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIdx
                    ? 'w-8 bg-[#FF5A1F]'
                    : i < currentIdx
                      ? 'w-2 bg-[#FF5A1F]/50'
                      : 'w-2 bg-[#26262B]'
                }`}
              />
            ))}
            <span className="text-xs font-mono text-[#8A8A8F] ml-2 font-bold">
              {currentIdx + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Question Surface Card */}
        <div className="p-7 mb-6 bg-[#131316] border border-[#26262B] border-t-2 border-t-[#FF5A1F] shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-lg animate-slide-up">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#26262B]">
            <span className="badge-technical">
              {categoryLabel[currentQ.category] ?? currentQ.category}
            </span>
            <span className="text-xs font-mono text-[#8A8A8F] font-medium">Question {currentIdx + 1} of {questions.length}</span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F5F5F3] leading-snug mb-6">
            {currentQ.question}
          </h2>

          {/* Text Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="answer-input" className="text-xs font-mono font-bold text-[#8A8A8F] uppercase tracking-wider">
                Your Answer
              </label>

              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`text-xs font-mono font-bold px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
                    listening
                      ? 'bg-[#F04438]/20 text-[#F04438] border border-[#F04438]/40 animate-pulse'
                      : 'bg-[#1B1B1F] text-[#8A8A8F] hover:text-[#F5F5F3] border border-[#26262B]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${listening ? 'bg-[#F04438]' : 'bg-[#8A8A8F]'}`} />
                  {listening ? 'Listening...' : '🎙️ Voice Input'}
                </button>
              )}
            </div>

            <textarea
              id="answer-input"
              className="input-base h-44 text-sm leading-relaxed"
              placeholder="Type or dictate your structured response here… (Press Enter to submit, Shift+Enter for new line)"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) return
                  e.preventDefault()
                  if (answer.trim() && !evaluating) {
                    handleNext()
                  }
                }
              }}
              disabled={evaluating}
            />

            {error && (
              <p className="text-xs font-bold text-[#F04438] bg-[#F04438]/10 border border-[#F04438]/30 rounded px-3 py-2 font-mono">{error}</p>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#26262B]">
            <p className="text-xs text-[#8A8A8F] font-mono hidden sm:block">
              Answers are evaluated live by AI Engine.
            </p>

            <button
              id="submit-answer-btn"
              onClick={handleNext}
              disabled={!answer.trim() || evaluating}
              className="btn-primary py-3 px-6 text-xs uppercase font-bold tracking-wider ml-auto shadow-sm"
            >
              {evaluating ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-[#F5F5F3]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Evaluating Answer...
                </>
              ) : isLast ? (
                'Complete Interview & View Summary →'
              ) : (
                'Submit Answer & Next Question →'
              )}
            </button>
          </div>
        </div>

        {/* Previous Answer Evaluation Feed */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="section-title">Previous Question Feedback</h3>
            {results.map((res, idx) => (
              <div key={idx} className="p-5 bg-[#131316] border border-[#26262B] rounded-lg shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FF5A1F] font-bold">Question {idx + 1} Evaluation</span>
                  <span className="font-mono text-sm font-bold text-[#F5F5F3]">{res.score}/10</span>
                </div>
                <ScoreBar score={res.score} animate={false} />
                <p className="text-xs text-[#8A8A8F] font-sans leading-relaxed">{res.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
