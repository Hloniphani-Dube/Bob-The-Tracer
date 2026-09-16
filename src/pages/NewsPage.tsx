import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { BackButton } from '../components/BackButton'
import { NewsCard } from '../components/news/NewsCard'
import { fetchNews } from '../lib/api'
import type { NewsArticle } from '../types/news'

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'done'; articles: NewsArticle[] }

// Fetches once on mount rather than polling: each newsdata.io request costs
// an API credit, so refreshing is a deliberate, manual action here.
export function NewsPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  const load = useCallback(async (ignore: () => boolean) => {
    try {
      const articles = await fetchNews()
      if (!ignore()) setState({ status: 'done', articles })
    } catch {
      if (!ignore()) setState({ status: 'error' })
    }
  }, [])

  useEffect(() => {
    let ignored = false
    // No data fetching library in this project, so this is React's own
    // documented mount time fetch pattern (cleanup flag guards a state
    // update after unmount); the lint rule assumes a library instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(() => ignored)
    return () => {
      ignored = true
    }
  }, [load])

  function handleRefresh() {
    setState({ status: 'loading' })
    load(() => false)
  }

  return (
    // Extra bottom padding (beyond the top's pt-16) keeps the last content
    // clear of the fixed OrbitNav corner button once scrolled all the way down.
    <main className="mx-auto max-w-3xl space-y-6 px-6 pt-16 pb-36">
      <div className="flex items-center justify-between">
        <BackButton />
        <button
          type="button"
          onClick={handleRefresh}
          disabled={state.status === 'loading'}
          className="inline-flex cursor-pointer items-center gap-1 text-sm text-pencil hover:text-ink disabled:opacity-50"
        >
          <RefreshCw size={16} className={state.status === 'loading' ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <h1 className="font-hand text-3xl">News</h1>

      {state.status === 'loading' && <p className="text-pencil">Loading news...</p>}
      {state.status === 'error' && (
        <p style={{ color: 'var(--verdict-contradicted)' }}>
          Could not load news right now. Make sure the backend is running and backend/.env has a valid
          NEWSDATA_API_KEY.
        </p>
      )}
      {state.status === 'done' && state.articles.length === 0 && (
        <p className="text-pencil">No articles came back right now.</p>
      )}
      {state.status === 'done' && (
        <div className="space-y-4">
          {state.articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  )
}
