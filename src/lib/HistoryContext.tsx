import { useMemo, useState, type ReactNode } from 'react'
import { HistoryContext, type HistoryContextValue, type HistoryEntry } from './historyStore'

// In memory only, on purpose: TRACE has no database in this build, so a
// session's investigation history lives here and resets on reload.
export function HistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  const value = useMemo<HistoryContextValue>(
    () => ({
      entries,
      addEntry: (claim: string) => {
        const trimmed = claim.trim()
        if (!trimmed) return
        setEntries((prev) => [{ id: crypto.randomUUID(), claim: trimmed }, ...prev].slice(0, 20))
      },
    }),
    [entries],
  )

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}
