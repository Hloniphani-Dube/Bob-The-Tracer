import { Search } from 'lucide-react'
import { InvestigateForm } from '../InvestigateForm'

interface InvestigatePanelProps {
  onSubmit: () => void
}

// Top dock: start a new investigation from anywhere in the app.
export function InvestigatePanel({ onSubmit }: InvestigatePanelProps) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col justify-center">
      <p className="mb-3 flex items-center gap-2 font-hand text-xl">
        <Search size={20} />
        Investigate
      </p>
      <InvestigateForm compact onSubmit={onSubmit} />
    </div>
  )
}
