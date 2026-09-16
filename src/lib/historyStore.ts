import { createContext } from 'react'

export interface HistoryEntry {
  id: string
  claim: string
}

export interface HistoryContextValue {
  entries: HistoryEntry[]
  addEntry: (claim: string) => void
}

export const HistoryContext = createContext<HistoryContextValue | null>(null)
