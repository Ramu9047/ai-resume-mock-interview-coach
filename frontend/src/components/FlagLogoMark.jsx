/**
 * FlagLogoMark — Reusable 3D Isometric Stacked Layer Logo Mark component matching hero.png in Ignite Orange theme.
 */
export default function FlagLogoMark({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded ${className}`}
    >
      <rect width="512" height="512" rx="96" fill="#0A0A0B"/>
      <rect x="2" y="2" width="508" height="508" rx="94" fill="none" stroke="#26262B" strokeWidth="4"/>
      
      {/* Dashed Guidelines */}
      <line x1="112" y1="160" x2="112" y2="330" stroke="#52525A" strokeWidth="4" strokeDasharray="8 8"/>
      <line x1="400" y1="160" x2="400" y2="330" stroke="#52525A" strokeWidth="4" strokeDasharray="8 8"/>

      {/* Bottom Ignite Orange Slab (3D Extruded) */}
      <polygon points="112,330 256,400 256,444 112,374" fill="#C4430F"/>
      <polygon points="256,400 400,330 400,374 256,444" fill="#DE4D18"/>
      <polygon points="256,260 400,330 256,400 112,330" fill="#FF5A1F"/>

      {/* Top Floating Cream Slab */}
      <polygon points="112,160 256,230 256,252 112,182" fill="#C8C4BB"/>
      <polygon points="256,230 400,160 400,182 256,252" fill="#E2DDD4"/>
      <polygon points="256,90 400,160 256,230 112,160" fill="#F5F2EB" stroke="#131316" strokeWidth="2"/>
    </svg>
  )
}
