import type { Source } from '../../types/investigation'
import { SourceCard } from './SourceCard'

interface SourceListProps {
  sources: Source[]
  openId: string | null
  onToggle: (id: string) => void
}

export function SourceList({ sources, openId, onToggle }: SourceListProps) {
  return (
    <div className="space-y-4">
      {sources.map((source) => (
        <SourceCard
          key={source.id}
          source={source}
          open={source.id === openId}
          onToggle={() => onToggle(source.id)}
        />
      ))}
    </div>
  )
}
