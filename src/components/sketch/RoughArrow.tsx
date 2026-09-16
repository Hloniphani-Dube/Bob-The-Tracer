import rough from 'roughjs'
import { useEffect, useRef } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'

interface RoughArrowProps {
  direction: Direction
  size?: number
  stroke?: string
  className?: string
}

// Endpoints for a shaft plus two head strokes, one per direction, all
// within a size x size box so the arrow can be laid out like a normal icon.
function pointsFor(direction: Direction, size: number) {
  const mid = size / 2
  const near = size * 0.2
  const far = size * 0.8
  const head = size * 0.22

  switch (direction) {
    case 'up':
      return { tail: [mid, far], head: [mid, near], wingA: [mid - head, near + head], wingB: [mid + head, near + head] }
    case 'down':
      return { tail: [mid, near], head: [mid, far], wingA: [mid - head, far - head], wingB: [mid + head, far - head] }
    case 'left':
      return { tail: [far, mid], head: [near, mid], wingA: [near + head, mid - head], wingB: [near + head, mid + head] }
    case 'right':
      return { tail: [near, mid], head: [far, mid], wingA: [far - head, mid - head], wingB: [far - head, mid + head] }
  }
}

// A small hand drawn arrow, used around the orbit nav button and for the
// edge affordance on each nav panel.
export function RoughArrow({ direction, size = 24, stroke = '#111111', className = '' }: RoughArrowProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.innerHTML = ''
    const rc = rough.svg(svg)
    const { tail, head, wingA, wingB } = pointsFor(direction, size)
    const options = { stroke, strokeWidth: 2, roughness: 1.4 }
    svg.appendChild(rc.line(tail[0], tail[1], head[0], head[1], options))
    svg.appendChild(rc.line(head[0], head[1], wingA[0], wingA[1], options))
    svg.appendChild(rc.line(head[0], head[1], wingB[0], wingB[1], options))
  }, [direction, size, stroke])

  return <svg ref={svgRef} width={size} height={size} className={className} />
}
