import { History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useHistory } from '../../lib/useHistory'

// Left dock: claims investigated so far this session. Nothing is persisted
// across a reload since there is no database in this build.
export function HistoryPanel() {
  const { entries } = useHistory()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <p className="mb-3 flex items-center gap-2 font-hand text-xl">
        <History size={20} />
        History
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-pencil">Investigations from this session will appear here.</p>
      ) : (
        <ul className="space-y-3 overflow-y-auto text-sm">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() =>
                  navigate('/investigate', entry.claim.startsWith('Screenshot: ') ? undefined : { state: { claim: entry.claim } })
                }
                className="cursor-pointer text-left hover:underline"
              >
                {entry.claim}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
