import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { BackButton } from '../components/BackButton'
import { NewsCard } from '../components/news/NewsCard'
import { fetchNews } from '../lib/api'
import { NEWS_REGIONS, type NewsRegion } from '../lib/newsRegions'
import type { NewsArticle } from '../types/news'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; articles: NewsArticle[] }

// Fetches once on mount, and again whenever the region changes, rather than
// polling: each newsdata.io request costs an API credit, so refreshing (by
// button or by region) is always a deliberate, manual action here.
export function NewsPage() {
  const [region, setRegion] = useState<NewsRegion>('all')
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  const load = useCallback(async (targetRegion: NewsRegion, ignore: () => boolean) => {
    try {
      const articles = await fetchNews(targetRegion)
      if (!ignore()) setState({ status: 'done', articles })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load news right now.'
      if (!ignore()) setState({ status: 'error', message })
    }
  }, [])

  useEffect(() => {
    let ignored = false
    // No data fetching library in this project, so this is React's own
    // documented mount time fetch pattern (cleanup flag guards a state
    // update after unmount); the lint rule assumes a library instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(region, () => ignored)
    return () => {
      ignored = true
    }
    // Only the initial mount should run this; region changes are handled by
    // handleRegionChange below so switching regions reads as one deliberate
    // refresh rather than an effect silently refetching behind the scenes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleRefresh() {
    setState({ status: 'loading' })
    load(region, () => false)
  }

  function handleRegionChange(next: NewsRegion) {
    setRegion(next)
    setState({ status: 'loading' })
    load(next, () => false)
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-hand text-3xl">News</h1>
        <label className="flex items-center gap-2 text-sm text-pencil">
          Region
          <select
            value={region}
            disabled={state.status === 'loading'}
            onChange={(e) => handleRegionChange(e.target.value as NewsRegion)}
            className="cursor-pointer border border-line bg-paper px-2 py-1 text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {NEWS_REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.status === 'loading' && <p className="text-pencil">Loading news...</p>}
      {state.status === 'error' && <p style={{ color: 'var(--verdict-contradicted)' }}>{state.message}</p>}
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
