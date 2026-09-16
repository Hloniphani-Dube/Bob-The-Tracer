import type { NewsArticle, NewsVerdict } from '../types/news'

// Local dev defaults to the backend's own dev port, since it runs as a
// separate process there. A production build defaults to a relative path
// instead, since Vercel serves the frontend and the backend service from
// the same domain (see vercel.json's /api rewrite). VITE_API_BASE_URL
// overrides either default if the backend ever runs somewhere else.
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? (import.meta.env.DEV ? 'http://localhost:8000' : '')

export async function fetchNews(): Promise<NewsArticle[]> {
  const res = await fetch(`${API_BASE_URL}/api/news`)
  if (!res.ok) throw new Error('Could not load news right now.')
  const data = await res.json()
  return data.articles
}

export async function fetchVerdict(article: Pick<NewsArticle, 'title' | 'description' | 'link'>): Promise<NewsVerdict> {
  const res = await fetch(`${API_BASE_URL}/api/news/verdict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  })
  if (!res.ok) throw new Error('Could not get a verdict right now.')
  return res.json()
}
