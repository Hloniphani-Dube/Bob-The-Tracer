import { ChevronDown, CircleCheck, CircleX, Minus } from 'lucide-react'
import type { Source } from '../../types/investigation'
import { RoughBox } from '../sketch/RoughBox'
import { RoughMeter } from '../sketch/RoughMeter'

const RELATIONSHIP_META = {
  supports: { label: 'Supports', icon: CircleCheck, color: 'var(--verdict-supported)' },
  contradicts: { label: 'Contradicts', icon: CircleX, color: 'var(--verdict-contradicted)' },
  neutral: { label: 'Neutral', icon: Minus, color: 'var(--pencil)' },
} as const

const SCORE_ROWS: { key: keyof Source['score']; label: string }[] = [
  { key: 'authority', label: 'Authority' },
  { key: 'recency', label: 'Recency' },
  { key: 'primaryEvidence', label: 'Primary evidence' },
  { key: 'corroboration', label: 'Corroboration' },
  { key: 'relevance', label: 'Relevance' },
]

interface SourceCardProps {
  source: Source
  /** Controlled from the evidence map so clicking a node opens its card. */
  open: boolean
  onToggle: () => void
}

// Each card states its verdict on the source up front (does it actually
// support the claim), then lets the reader expand into the excerpt and the
// five factors behind that call, instead of just linking out and hoping.
export function SourceCard({ source, open, onToggle }: SourceCardProps) {
  const relationship = RELATIONSHIP_META[source.relationship]
  const Icon = relationship.icon

  return (
    <RoughBox id={`source-${source.id}`} className="scroll-mt-24 p-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="font-hand text-lg leading-snug break-words">{source.title}</p>
          <p className="mt-1 font-sans text-xs text-pencil">
            {source.type} &middot; {source.publishedYear} &middot; {source.strength} strength
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Icon size={18} color={relationship.color} strokeWidth={2.25} />
          <span className="font-hand text-sm" style={{ color: relationship.color }}>
            {relationship.label}
          </span>
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-line pt-4">
          <p className="text-sm text-pencil">{source.excerpt}</p>
          <div className="space-y-2">
            {SCORE_ROWS.map((row) => (
              <div key={row.key} className="flex items-center gap-3">
                <span className="w-36 shrink-0 font-hand text-sm">{row.label}</span>
                <RoughMeter value={source.score[row.key]} />
                <span className="w-8 shrink-0 text-right font-sans text-xs text-pencil">
                  {source.score[row.key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </RoughBox>
  )
}
