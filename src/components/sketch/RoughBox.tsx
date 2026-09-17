import rough from 'roughjs'
import { useEffect, useRef, useState, type MouseEventHandler, type ReactNode } from 'react'
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
  onClick?: MouseEventHandler<HTMLDivElement>
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
  onClick,
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
      onClick={onClick}
    >
      {/* A plain CSS backing layer behind the rough fill, at an even more
          negative z-index: rough.js needs a ResizeObserver tick before it
          draws anything, so a solid fill would otherwise flash empty for a
          couple hundred milliseconds on first mount (worst right after a
          cold page load, competing with everything else for paint time),
          showing whatever sits behind the box through unstyled text. */}
      {fill && fillStyle === 'solid' && (
        <div className="absolute inset-0 -z-20" style={{ backgroundColor: fill }} />
      )}
      {/* Negative z-index, not just DOM order, keeps this behind the static
          in-flow children below: a positioned element (even with no z-index
          set) paints above non-positioned siblings regardless of DOM order,
          which otherwise hides content behind an opaque fill. */}
      <svg ref={svgRef} className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      {children}
    </div>
  )
}
