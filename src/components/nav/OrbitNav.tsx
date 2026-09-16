import { AnimatePresence, motion } from 'framer-motion'
import { Compass, X } from 'lucide-react'
import { useState } from 'react'
import { RoughArrow } from '../sketch/RoughArrow'
import { RoughCircle } from '../sketch/RoughCircle'
import { AboutPanel } from './AboutPanel'
import { ChatPanel } from './ChatPanel'
import { HistoryPanel } from './HistoryPanel'
import { InvestigatePanel } from './InvestigatePanel'
import { NavPanel } from './NavPanel'

const ARROWS = [
  { direction: 'up' as const, className: 'left-1/2 -top-9 -translate-x-1/2' },
  { direction: 'down' as const, className: 'left-1/2 -bottom-9 -translate-x-1/2' },
  { direction: 'left' as const, className: 'top-1/2 -left-9 -translate-y-1/2' },
  { direction: 'right' as const, className: 'top-1/2 -right-9 -translate-y-1/2' },
]

// The whole app's navigation, mounted once in App. A single button in the
// bottom right corner: arrows orbit it to draw the eye, fade on hover once
// the button has been noticed, and a click opens all four edge docks at
// once (top = investigate, bottom = ask, left = history, right = about),
// each carrying its own purpose instead of one flat menu list.
export function OrbitNav() {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 bg-paper/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <NavPanel edge="top" open={open}>
        <InvestigatePanel onSubmit={() => setOpen(false)} />
      </NavPanel>
      <NavPanel edge="bottom" open={open}>
        <ChatPanel />
      </NavPanel>
      <NavPanel edge="left" open={open}>
        <HistoryPanel />
      </NavPanel>
      <NavPanel edge="right" open={open}>
        <AboutPanel />
      </NavPanel>

      <div
        className="fixed right-14 bottom-14 z-50"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {!open &&
          ARROWS.map(({ direction, className }) => (
            <motion.div
              key={direction}
              className={`pointer-events-none absolute ${className}`}
              // Framer Motion writes opacity as an inline style every frame, which
              // always wins over a CSS group-hover rule, so the hover fade has to
              // be expressed as an animate target here instead of in Tailwind.
              animate={hovered ? { opacity: 0 } : { opacity: [0.35, 1, 0.35] }}
              transition={hovered ? { duration: 0.2 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <RoughArrow direction={direction} size={20} />
            </motion.div>
          ))}

        <button
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer"
        >
          <RoughCircle diameter={64}>{open ? <X size={26} /> : <Compass size={26} />}</RoughCircle>
        </button>
      </div>
    </>
  )
}
