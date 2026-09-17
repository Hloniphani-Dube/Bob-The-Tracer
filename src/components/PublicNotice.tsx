import { TriangleAlert } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { GITHUB_URL } from '../lib/constants'
import { RoughBox } from './sketch/RoughBox'
import { RoughButton } from './sketch/RoughButton'

const DISMISSED_KEY = 'trace-public-notice-dismissed'

function alreadyDismissed() {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

// Shown once per browser tab (sessionStorage, not localStorage) so it
// reappears on a fresh visit but does not nag while navigating around.
// This is a shared public deployment running on one owner's API keys, so
// visitors need to know upfront that credits are limited and shared, not
// discover it only once a request fails.
export function PublicNotice() {
  const [open, setOpen] = useState(() => !alreadyDismissed())

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // sessionStorage can throw in a locked down browsing context; the
      // notice just reappears next time, which is a fine fallback.
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-paper/60 p-6" onClick={dismiss}>
      <RoughBox
        fill="#ffffff"
        fillStyle="solid"
        className="max-w-md p-6"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <p className="flex items-center gap-2 font-hand text-xl">
          <TriangleAlert size={22} color="var(--verdict-partial)" strokeWidth={2.25} />
          This is a public demo
        </p>
        <p className="mt-3 text-sm text-pencil">
          Investigate and News run on one Gemini and newsdata.io key shared across everyone who visits, so
          credits are limited. If a request stops working because credits ran out for the day, that is why.
        </p>
        <p className="mt-3 text-sm text-pencil">
          You can run TRACE yourself with your own keys instead. The setup guide is in the{' '}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="underline hover:text-ink">
            README on GitHub
          </a>
          .
        </p>
        <div className="mt-5">
          <RoughButton type="button" onClick={dismiss}>
            Got it
          </RoughButton>
        </div>
      </RoughBox>
    </div>
  )
}
