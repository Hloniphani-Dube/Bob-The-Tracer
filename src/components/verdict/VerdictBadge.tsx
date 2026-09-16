import { CircleAlert, CircleCheck, CircleHelp, CircleX, TriangleAlert } from 'lucide-react'
import type { Verdict } from '../../types/investigation'
import { RoughBox } from '../sketch/RoughBox'

const VERDICT_META: Record<Verdict, { label: string; color: string; icon: typeof CircleCheck }> = {
  supported: { label: 'Supported', color: 'var(--verdict-supported)', icon: CircleCheck },
  partial: { label: 'Partially supported', color: 'var(--verdict-partial)', icon: CircleAlert },
  misleading: { label: 'Misleading', color: 'var(--verdict-misleading)', icon: TriangleAlert },
  contradicted: { label: 'Contradicted', color: 'var(--verdict-contradicted)', icon: CircleX },
  insufficient: { label: 'Insufficient evidence', color: 'var(--verdict-insufficient)', icon: CircleHelp },
}

interface VerdictBadgeProps {
  verdict: Verdict
  size?: 'md' | 'lg'
}

// The five state verdict is the one place color is allowed to carry meaning
// on its own; everywhere else in the UI stays black, white, and gray.
export function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
  const meta = VERDICT_META[verdict]
  const Icon = meta.icon
  const iconSize = size === 'lg' ? 28 : 18
  const textClass = size === 'lg' ? 'text-2xl' : 'text-base'

  return (
    <RoughBox stroke={meta.color} strokeWidth={2} className="inline-flex items-center gap-2 px-4 py-2">
      <Icon size={iconSize} color={meta.color} strokeWidth={2.25} />
      <span className={`font-hand ${textClass}`} style={{ color: meta.color }}>
        {meta.label}
      </span>
    </RoughBox>
  )
}
