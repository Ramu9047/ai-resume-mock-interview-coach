import axios from 'axios'

const client = axios.create({
  // In dev, Vite's proxy forwards /api → http://localhost:8080
  // In production, VITE_API_BASE_URL points to deployed Render backend
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 120000, // 120s — Groq LLM responses with sub-scores
  headers: { 'Accept': 'application/json' },
})

// ── Resume ────────────────────────────────────────────────────────────────────

/**
 * POST /api/resume/analyze
 * @param {File} resumeFile
 * @param {string} [jobDescription]
 * @returns {Promise<{sessionId, atsScore, strengths, gaps, suggestions}>}
 */
export async function analyzeResume(resumeFile, jobDescription = '') {
  const form = new FormData()
  form.append('resume', resumeFile)
  if (jobDescription.trim()) {
    form.append('jobDescription', jobDescription.trim())
  }
  const { data } = await client.post('/api/resume/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * GET /api/resume/session/:sessionId
 * @param {string} sessionId
 * @returns {Promise<Object>}
 */
export async function getSession(sessionId) {
  const { data } = await client.get(`/api/resume/session/${sessionId}`)
  return data
}
export const getAnalysisResults = getSession

/**
 * POST /api/resume/parse-pdf
 * Parses uploaded PDF directly into a structured draft.
 * @param {File} pdfFile
 */
export async function parsePdfToDraft(pdfFile) {
  const form = new FormData()
  form.append('resume', pdfFile)
  const { data } = await client.post('/api/resume/parse-pdf', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * POST /api/resume/improve-field
 * Generates an AI suggestion for summary or experience bullet.
 * @param {string} fieldType 'summary' | 'bullet'
 * @param {string} text
 */
export async function improveField(fieldType, text) {
  const { data } = await client.post('/api/resume/improve-field', { fieldType, text })
  return data
}

// ── Interview ─────────────────────────────────────────────────────────────────

/**
 * POST /api/interview/generate-questions
 * @param {string} sessionId
 * @returns {Promise<{questions: Array<{questionId, question, category}>}>}
 */
export async function generateQuestions(sessionId) {
  const { data } = await client.post('/api/interview/generate-questions', { sessionId })
  return data
}

/**
 * POST /api/interview/submit-answer
 * @param {string} sessionId
 * @param {string} questionId
 * @param {string} answer
 * @returns {Promise<{score, feedback}>}
 */
export async function submitAnswer(sessionId, questionId, answer) {
  const { data } = await client.post('/api/interview/submit-answer', {
    sessionId,
    questionId,
    answer,
  })
  return data
}
export const evaluateAnswer = submitAnswer

/**
 * GET /api/interview/summary/:sessionId
 * @param {string} sessionId
 * @returns {Promise<{overallScore, breakdown, recommendation}>}
 */
export async function getInterviewSummary(sessionId) {
  const { data } = await client.get(`/api/interview/summary/${sessionId}`)
  return data
}

// ── Resume Builder ────────────────────────────────────────────────────────────

/**
 * POST /api/builder/resume
 * Creates or updates a resume draft. Pass resumeId to update.
 * @param {Object} draft
 * @returns {Promise<Object>} saved draft with resumeId
 */
export async function saveResumeDraft(draft) {
  const { data } = await client.post('/api/builder/resume', draft)
  return data
}

/**
 * GET /api/builder/resume/:resumeId
 * @param {string} resumeId
 * @returns {Promise<Object>} draft
 */
export async function getResumeDraft(resumeId) {
  const { data } = await client.get(`/api/builder/resume/${resumeId}`)
  return data
}

/**
 * DELETE /api/builder/resume/:resumeId
 */
export async function deleteResumeDraft(resumeId) {
  await client.delete(`/api/builder/resume/${resumeId}`)
}

// Automatically attach X-Admin-Token header if admin session exists
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('rc_adminToken')
  if (token) {
    config.headers['X-Admin-Token'] = token
  }
  return config
})

// ── Admin Auth ────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/auth/login
 * @param {string} adminKey
 */
export async function adminLogin(adminKey) {
  const { data } = await client.post('/api/admin/auth/login', { adminKey })
  if (data?.token) {
    sessionStorage.setItem('rc_adminToken', data.token)
  }
  return data
}

/**
 * POST /api/admin/auth/logout
 */
export async function adminLogout() {
  try {
    await client.post('/api/admin/auth/logout')
  } catch (e) {
    console.error(e)
  } finally {
    sessionStorage.removeItem('rc_adminToken')
  }
}

/**
 * GET /api/admin/auth/verify
 */
export async function verifyAdminSession() {
  const token = sessionStorage.getItem('rc_adminToken')
  if (!token) return false
  try {
    const { data } = await client.get('/api/admin/auth/verify')
    return data?.valid === true
  } catch (e) {
    sessionStorage.removeItem('rc_adminToken')
    return false
  }
}

// ── Analytics ─────────────────────────────────────────────────────────────────

/** GET /api/analytics/overview */
export async function getAnalyticsOverview() {
  const { data } = await client.get('/api/analytics/overview')
  return data
}

/** GET /api/analytics/ats-over-time */
export async function getAtsOverTime() {
  const { data } = await client.get('/api/analytics/ats-over-time')
  return data
}

/** GET /api/analytics/top-gaps */
export async function getTopGaps() {
  const { data } = await client.get('/api/analytics/top-gaps')
  return data
}

/** GET /api/analytics/top-jd-keywords */
export async function getTopJdKeywords() {
  const { data } = await client.get('/api/analytics/top-jd-keywords')
  return data
}

export default client

