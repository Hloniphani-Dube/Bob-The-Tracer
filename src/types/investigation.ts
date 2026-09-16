// Shared shape for a TRACE investigation. Pass 1 only ever populates this from
// the static mock fixture; a later pass fills it from the FastAPI backend
// instead, so the shape is written to match what that response will look like.

export type Verdict =
  | 'supported'
  | 'partial'
  | 'misleading'
  | 'contradicted'
  | 'insufficient'

export type Relationship = 'supports' | 'contradicts' | 'neutral'

export type SourceType =
  | 'scientific study'
  | 'research review'
  | 'scientific article'
  | 'news article'
  | 'government source'
  | 'primary document'

export interface SourceScore {
  authority: number // 0..100, how credible the source is for this subject
  recency: number // 0..100, how recent the information is
  primaryEvidence: number // 0..100, is this the original research or data
  corroboration: number // 0..100, do independent sources agree
  relevance: number // 0..100, does the source actually address the claim
}

export interface Source {
  id: string
  title: string
  type: SourceType
  publishedYear: number
  url: string
  relationship: Relationship
  strength: 'low' | 'medium' | 'high'
  excerpt: string
  score: SourceScore
}

export interface ClaimDriftStep {
  label: string // e.g. "Original source", "News article", "Social post"
  text: string
  changedPhrase?: string // the phrase that shifted meaning from the previous step
}

export interface TimelineStep {
  label: string
  done: boolean
}

export interface Investigation {
  claim: string
  verdict: Verdict
  verdictSummary: string
  evidenceQuality: number // 0..100, a TRACE assessment, not an objective measure
  timeline: TimelineStep[]
  sources: Source[]
  claimDrift: ClaimDriftStep[]
}
