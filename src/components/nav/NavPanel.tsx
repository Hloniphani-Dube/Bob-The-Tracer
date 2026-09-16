import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Edge = 'top' | 'bottom' | 'left' | 'right'

interface NavPanelProps {
  edge: Edge
  open: boolean
  children: ReactNode
}

// Capped with vh/vw so two opposite docks (top+bottom, left+right) never
// together exceed the viewport and overlap on a small phone; min() falls
// back to the plain 13rem/18rem size once there is room for it.
//
// left/right are inset from top/bottom by that same h-[min(13rem,45vh)], so
// all four tile like a plus sign with no overlap. Without that inset,
// left/right (which span edge to edge vertically) would cover the same
// bottom corners as the full width bottom dock, and whichever sits later in
// the DOM would silently swallow clicks meant for the other (e.g. the chat
// panel's send button, hidden under the about dock on a narrow phone).
// These strings must stay fully literal (not built from a shared variable)
// so Tailwind's static scanner can see and generate each class.
const EDGE_STYLE: Record<Edge, string> = {
  top: 'top-0 left-0 right-0 h-[min(13rem,45vh)] border-b',
  bottom: 'bottom-0 left-0 right-0 h-[min(13rem,45vh)] border-t',
  left: 'left-0 top-[min(13rem,45vh)] bottom-[min(13rem,45vh)] w-[min(18rem,45vw)] border-r',
  right: 'right-0 top-[min(13rem,45vh)] bottom-[min(13rem,45vh)] w-[min(18rem,45vw)] border-l',
}

const EDGE_TRANSFORM: Record<Edge, { hidden: Record<string, string>; shown: Record<string, string> }> = {
  top: { hidden: { y: '-100%' }, shown: { y: '0%' } },
  bottom: { hidden: { y: '100%' }, shown: { y: '0%' } },
  left: { hidden: { x: '-100%' }, shown: { x: '0%' } },
  right: { hidden: { x: '100%' }, shown: { x: '0%' } },
}

// One sliding dock per screen edge. All four mount together when the orbit
// nav opens; each carries a different purpose (see OrbitNav for the map).
export function NavPanel({ edge, open, children }: NavPanelProps) {
  const { hidden, shown } = EDGE_TRANSFORM[edge]
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed z-40 overflow-y-auto border-ink bg-paper p-4 sm:p-6 ${EDGE_STYLE[edge]}`}
          initial={hidden}
          animate={shown}
          exit={hidden}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
