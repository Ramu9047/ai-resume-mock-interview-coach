/**
 * AnimatedGradientMesh — low-opacity, slow-drifting gradient orbs
 * rendered as an absolutely-positioned overlay behind the hero section.
 * Uses the meshDrift keyframes defined in index.css.
 * Usage: render as a sibling before hero content inside a relative container.
 */
export default function AnimatedGradientMesh() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Orb 1 — large indigo blob top-left */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '65%',
          height: '65%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.13) 0%, transparent 70%)',
          animation: 'meshDrift1 22s ease-in-out infinite',
          filter: 'blur(48px)',
        }}
      />
      {/* Orb 2 — emerald blob bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-15%',
          width: '55%',
          height: '55%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 70%)',
          animation: 'meshDrift2 28s ease-in-out infinite',
          filter: 'blur(56px)',
        }}
      />
      {/* Orb 3 — subtle purple mid-center */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '40%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.07) 0%, transparent 70%)',
          animation: 'meshDrift3 18s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />
    </div>
  )
}
