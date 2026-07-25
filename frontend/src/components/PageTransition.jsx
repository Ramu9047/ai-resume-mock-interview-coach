import { useLocation } from 'react-router-dom'

/**
 * Lightweight, fail-safe CSS page fade wrapper.
 * Fades smoothly on route changes without JS opacity traps or layout shifts.
 */
export default function PageTransition({ children }) {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-enter" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}
