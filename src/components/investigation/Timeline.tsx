import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { TimelineStep } from '../../types/investigation'

interface TimelineProps {
  steps: TimelineStep[]
}

// Renders the investigation as a checklist that reveals one line at a time,
// so the AI reads as an investigator working through a process rather than
// a chatbot returning an instant answer.
export function Timeline({ steps }: TimelineProps) {
  return (
    <ul className="space-y-2">
      {steps.map((step, i) => (
        <motion.li
          key={step.label}
          className="flex items-center gap-2 font-hand text-lg"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.3 }}
        >
          <Check size={18} className="shrink-0 text-ink" strokeWidth={2.5} />
          <span>{step.label}</span>
        </motion.li>
      ))}
    </ul>
  )
}
