import type { Verdict } from './investigation'

export interface NewsArticle {
  id: string
  title: string
  description: string | null
  link: string
  imageUrl: string | null
  source: string | null
  publishedAt: string | null
}

export interface NewsVerdict {
  verdict: Verdict
  summary: string
}
