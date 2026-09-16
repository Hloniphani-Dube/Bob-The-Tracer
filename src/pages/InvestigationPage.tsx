import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BackButton } from '../components/BackButton'
import { ClaimDrift } from '../components/investigation/ClaimDrift'
import { EvidenceMap } from '../components/investigation/EvidenceMap'
import { EvidenceQualityMeter } from '../components/investigation/EvidenceQualityMeter'
import { SourceList } from '../components/investigation/SourceList'
import { Timeline } from '../components/investigation/Timeline'
import { RoughBox } from '../components/sketch/RoughBox'
import { RoughButton } from '../components/sketch/RoughButton'
import { VerdictBadge } from '../components/verdict/VerdictBadge'
import { mockInvestigation } from '../data/mockInvestigation'
import { fetchInvestigation } from '../lib/api'
import type { Investigation } from '../types/investigation'

type PageState =
  | { status: 'demo'; investigation: Investigation }
  | { status: 'loading'; claim: string }
  | { status: 'error'; claim: string; message: string }
  | { status: 'ready'; investigation: Investigation }

// A claim arrives via navigation state (from the investigate form or a
// history entry) and gets a real, on demand Gemini investigation. Landing
// on this page with no claim at all, e.g. a direct link, shows the static
// demo fixture instead of an error, since there is nothing to investigate.
export function InvestigationPage() {
  const location = useLocation()
  const claim = (location.state as { claim?: string } | null)?.claim

  const [state, setState] = useState<PageState>(() =>
    claim ? { status: 'loading', claim } : { status: 'demo', investigation: mockInvestigation },
  )
  const [openSourceId, setOpenSourceId] = useState<string | null>(null)

  const load = useCallback(async (targetClaim: string, ignored: () => boolean) => {
    try {
      const investigation = await fetchInvestigation(targetClaim)
      if (!ignored()) setState({ status: 'ready', investigation })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not investigate that claim right now.'
      if (!ignored()) setState({ status: 'error', claim: targetClaim, message })
    }
  }, [])

  useEffect(() => {
    if (!claim) return
    let ignored = false
    // No data fetching library in this project, so this is React's own
    // documented mount time fetch pattern (cleanup flag guards a state
    // update after unmount); the lint rule assumes a library instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(claim, () => ignored)
    return () => {
      ignored = true
    }
  }, [claim, load])

  function selectSource(id: string) {
    setOpenSourceId(id)
    document.getElementById(`source-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function toggleSource(id: string) {
    setOpenSourceId((current) => (current === id ? null : id))
  }

  return (
    // Extra bottom padding (beyond the top's pt-16) keeps the last content
    // clear of the fixed OrbitNav corner button once scrolled all the way down.
    <main className="mx-auto max-w-4xl space-y-10 px-6 pt-16 pb-36">
      <BackButton />

      {state.status === 'loading' && (
        <section>
          <p className="font-hand text-sm text-pencil">Claim</p>
          <h1 className="sketch-tilt mt-1 text-2xl font-semibold sm:text-3xl">{state.claim}</h1>
          <p className="mt-6 font-hand text-xl">Investigating the evidence...</p>
          <p className="mt-2 max-w-md text-sm text-pencil">
            TRACE is searching real sources and weighing what they say. This can take up to a minute.
          </p>
        </section>
      )}

      {state.status === 'error' && (
        <section>
          <p className="font-hand text-sm text-pencil">Claim</p>
          <h1 className="sketch-tilt mt-1 text-2xl font-semibold sm:text-3xl">{state.claim}</h1>
          <p className="mt-6" style={{ color: 'var(--verdict-contradicted)' }}>
            {state.message}
          </p>
          <div className="mt-4">
            <RoughButton
              type="button"
              onClick={() => {
                const targetClaim = state.claim
                setState({ status: 'loading', claim: targetClaim })
                load(targetClaim, () => false)
              }}
            >
              Try again
            </RoughButton>
          </div>
        </section>
      )}

      {(state.status === 'demo' || state.status === 'ready') && (
        <>
          <section>
            <p className="font-hand text-sm text-pencil">Claim</p>
            <h1 className="sketch-tilt mt-1 text-2xl font-semibold sm:text-3xl">{state.investigation.claim}</h1>
            {state.status === 'demo' && (
              <p className="mt-2 text-xs text-pencil">Demo investigation, shown because no claim was submitted directly.</p>
            )}
          </section>

          <section className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <VerdictBadge verdict={state.investigation.verdict} size="lg" />
            <p className="max-w-md text-sm text-pencil">{state.investigation.verdictSummary}</p>
          </section>

          <section>
            <EvidenceQualityMeter score={state.investigation.evidenceQuality} />
          </section>

          <section>
            <h2 className="mb-3 font-hand text-2xl">Investigation</h2>
            <RoughBox className="p-6">
              <Timeline steps={state.investigation.timeline} />
            </RoughBox>
          </section>

          <section>
            <h2 className="mb-3 font-hand text-2xl">Evidence map</h2>
            <RoughBox className="p-2">
              <EvidenceMap
                claim={state.investigation.claim}
                sources={state.investigation.sources}
                onSelectSource={selectSource}
              />
            </RoughBox>
          </section>

          <section>
            <h2 className="mb-3 font-hand text-2xl">Sources</h2>
            <SourceList sources={state.investigation.sources} openId={openSourceId} onToggle={toggleSource} />
          </section>

          <section>
            <h2 className="mb-3 font-hand text-2xl">Claim drift</h2>
            <ClaimDrift steps={state.investigation.claimDrift} />
          </section>
        </>
      )}
    </main>
  )
}
