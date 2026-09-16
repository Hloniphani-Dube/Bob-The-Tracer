import rough from 'roughjs'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useElementSize } from '../../lib/useElementSize'

interface RoughBoxProps {
  children?: ReactNode
  className?: string
  id?: string
  fill?: string
  fillStyle?: 'hachure' | 'solid' | 'cross-hatch' | 'zigzag'
  stroke?: string
  strokeWidth?: number
  roughness?: number
  /** Redraw with a new random seed on hover, for a "redrawn by hand" feel. */
  redrawOnHover?: boolean
}

const INK = '#111111'

// Wraps children in a hand drawn rectangle. The rectangle is a separate SVG
// layer sized to match the wrapper via ResizeObserver, since rough.js draws
// a fixed shape rather than something CSS can stretch.
export function RoughBox({
  children,
  className = '',
  id,
  fill,
  fillStyle = 'hachure',
  stroke = INK,
  strokeWidth = 1.75,
  roughness = 1.6,
  redrawOnHover = false,
}: RoughBoxProps) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000))

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || size.width === 0 || size.height === 0) return

    svg.innerHTML = ''
    const rc = rough.svg(svg)
    const pad = strokeWidth
    const node = rc.rectangle(pad, pad, size.width - pad * 2, size.height - pad * 2, {
      fill,
      fillStyle,
      stroke,
      strokeWidth,
      roughness,
      seed,
    })
    svg.appendChild(node)
  }, [size, fill, fillStyle, stroke, strokeWidth, roughness, seed])

  return (
    <div
      ref={ref}
      id={id}
      className={`relative ${className}`}
      onMouseEnter={redrawOnHover ? () => setSeed(Math.floor(Math.random() * 1000)) : undefined}
    >
      <svg ref={svgRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      {children}
    </div>
  )
}
