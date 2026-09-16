import { useContext } from 'react'
import { HistoryContext } from './historyStore'

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider')
  return ctx
}
