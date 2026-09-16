import rough from 'roughjs'
import { useEffect, useRef } from 'react'
import { useElementSize } from '../../lib/useElementSize'

interface RoughMeterProps {
  value: number // 0..100
  height?: number
}

// A hand drawn horizontal gauge: an outline track plus a cross hatched fill
// sized to the value, redrawn together so the fill can never overshoot the
// track when the layout reflows. Shared by the evidence quality meter and
// the per source score rows.
export function RoughMeter({ value, height = 14 }: RoughMeterProps) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || size.width === 0) return
    svg.innerHTML = ''
    const rc = rough.svg(svg)
    const pad = 2
    svg.setAttribute('height', String(height))

    svg.appendChild(
      rc.rectangle(pad, pad, size.width - pad * 2, height - pad * 2, {
        stroke: '#111111',
        strokeWidth: 1.5,
        roughness: 1.4,
      }),
    )

    const fillWidth = Math.max(0, (size.width - pad * 2) * (value / 100))
    if (fillWidth > 2) {
      svg.appendChild(
        rc.rectangle(pad, pad, fillWidth, height - pad * 2, {
          fill: '#111111',
          fillStyle: 'cross-hatch',
          fillWeight: 1.25,
          stroke: 'none',
          roughness: 1.6,
        }),
      )
    }
  }, [size, value, height])

  return (
    <div ref={ref} className="relative w-full">
      <svg ref={svgRef} className="block w-full" />
    </div>
  )
}
