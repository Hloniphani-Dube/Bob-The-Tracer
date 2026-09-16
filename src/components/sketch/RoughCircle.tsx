import rough from 'roughjs'
import { useEffect, useRef, type ReactNode } from 'react'

interface RoughCircleProps {
  diameter: number
  children?: ReactNode
  fill?: string
  stroke?: string
  className?: string
}

// A fixed size hand drawn circle, used for the orbit nav button. Unlike
// RoughBox it does not track resize, since the button is always drawn at
// one fixed diameter.
export function RoughCircle({ diameter, children, fill = '#ffffff', stroke = '#111111', className = '' }: RoughCircleProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.innerHTML = ''
    const rc = rough.svg(svg)
    const node = rc.circle(diameter / 2, diameter / 2, diameter - 4, {
      fill,
      fillStyle: 'solid',
      stroke,
      strokeWidth: 2,
      roughness: 1.6,
    })
    svg.appendChild(node)
  }, [diameter, fill, stroke])

  return (
    <div className={`relative ${className}`} style={{ width: diameter, height: diameter }}>
      <svg ref={svgRef} width={diameter} height={diameter} className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
