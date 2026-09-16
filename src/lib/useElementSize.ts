import { useEffect, useRef, useState } from 'react'

// Tracks an element's rendered box so rough.js shapes (which are drawn once
// at a fixed pixel size, not resizable like CSS borders) can be redrawn
// whenever the layout around them changes.
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Read the border box (offsetWidth/Height) rather than the observer
    // entry's contentBoxSize: the rough shape fills the element's full
    // padded box (it sits behind the padded content, via inset-0), and
    // contentBoxSize excludes padding, which drew every shape short.
    const observer = new ResizeObserver(() => {
      setSize({ width: el.offsetWidth, height: el.offsetHeight })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, size }
}
