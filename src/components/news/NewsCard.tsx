import { useState } from 'react'
import { fetchVerdict } from '../../lib/api'
import type { NewsArticle, NewsVerdict } from '../../types/news'
import { RoughBox } from '../sketch/RoughBox'
import { RoughButton } from '../sketch/RoughButton'
import { VerdictBadge } from '../verdict/VerdictBadge'

interface NewsCardProps {
  article: NewsArticle
}

type CheckState = { status: 'idle' } | { status: 'loading' } | { status: 'done'; result: NewsVerdict } | { status: 'error' }

function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString()
}

// One article plus an on demand "is this true" check: a real Gemini call
// (backend route /api/news/verdict) made only when the reader asks for it,
// since each check is a real API call, not something to run automatically
// for every article in the feed.
export function NewsCard({ article }: NewsCardProps) {
  const [check, setCheck] = useState<CheckState>({ status: 'idle' })
  const publishedLabel = formatDate(article.publishedAt)

  async function handleCheck() {
    setCheck({ status: 'loading' })
    try {
      const result = await fetchVerdict(article)
      setCheck({ status: 'done', result })
    } catch {
      setCheck({ status: 'error' })
    }
  }

  return (
    <RoughBox className="flex flex-col gap-3 p-4 sm:flex-row">
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt=""
          className="h-40 w-full shrink-0 border border-line object-cover sm:h-28 sm:w-40"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}

      <div className="min-w-0 flex-1">
        <a
          href={article.link}
          target="_blank"
          rel="noreferrer"
          className="font-hand text-lg break-words hover:underline"
        >
          {article.title}
        </a>
        <p className="mt-1 font-sans text-xs text-pencil">
          {[article.source, publishedLabel].filter(Boolean).join(' · ')}
        </p>
        {article.description && <p className="mt-2 text-sm text-pencil">{article.description}</p>}

        <div className="mt-3">
          {check.status === 'idle' && (
            <RoughButton type="button" onClick={handleCheck}>
              Is this true
            </RoughButton>
          )}
          {check.status === 'loading' && <p className="font-hand text-sm text-pencil">Investigating...</p>}
          {check.status === 'error' && (
            <p className="font-hand text-sm" style={{ color: 'var(--verdict-contradicted)' }}>
              Could not get a verdict right now.
            </p>
          )}
          {check.status === 'done' && (
            <div className="flex flex-col items-start gap-2">
              <VerdictBadge verdict={check.result.verdict} />
              <p className="text-sm text-pencil">{check.result.summary}</p>
            </div>
          )}
        </div>
      </div>
    </RoughBox>
  )
}
