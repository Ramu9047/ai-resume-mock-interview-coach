import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'
import UploadPage from './pages/UploadPage'
import FeedbackPage from './pages/FeedbackPage'
import InterviewPage from './pages/InterviewPage'
import SummaryPage from './pages/SummaryPage'
import BuilderPage from './pages/BuilderPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter basename="/tools/resume-coach">
      <Navbar />
      <PageTransition>
        <Routes>
          <Route path="/"                          element={<UploadPage />} />
          <Route path="/feedback/:sessionId"       element={<FeedbackPage />} />
          <Route path="/interview/:sessionId"      element={<InterviewPage />} />
          <Route path="/summary/:sessionId"        element={<SummaryPage />} />
          {/* Resume Builder — linked from Upload page feature pills */}
          <Route path="/builder"                   element={<BuilderPage />} />
          {/* Admin Dashboard — unlisted, not in nav */}
          <Route path="/admin"                     element={<AdminPage />} />
          {/* Catch-all: redirect home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </BrowserRouter>
  )
}
