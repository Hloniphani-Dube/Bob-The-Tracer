import { useState } from 'react'
import { BackButton } from '../components/BackButton'
import { ClaimDrift } from '../components/investigation/ClaimDrift'
import { EvidenceMap } from '../components/investigation/EvidenceMap'
import { EvidenceQualityMeter } from '../components/investigation/EvidenceQualityMeter'
import { SourceList } from '../components/investigation/SourceList'
import { Timeline } from '../components/investigation/Timeline'
import { RoughBox } from '../components/sketch/RoughBox'
import { VerdictBadge } from '../components/verdict/VerdictBadge'
import { mockInvestigation } from '../data/mockInvestigation'

// Reads the static mock fixture directly; a later pass fetches this from the
// backend by investigation id instead.
export function InvestigationPage() {
  const investigation = mockInvestigation
  const [openSourceId, setOpenSourceId] = useState<string | null>(null)

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

      <section>
        <p className="font-hand text-sm text-pencil">Claim</p>
        <h1 className="sketch-tilt mt-1 text-2xl font-semibold sm:text-3xl">{investigation.claim}</h1>
      </section>

      <section className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <VerdictBadge verdict={investigation.verdict} size="lg" />
        <p className="max-w-md text-sm text-pencil">{investigation.verdictSummary}</p>
      </section>

      <section>
        <EvidenceQualityMeter score={investigation.evidenceQuality} />
      </section>

      <section>
        <h2 className="mb-3 font-hand text-2xl">Investigation</h2>
        <RoughBox className="p-6">
          <Timeline steps={investigation.timeline} />
        </RoughBox>
      </section>

      <section>
        <h2 className="mb-3 font-hand text-2xl">Evidence map</h2>
        <RoughBox className="p-2">
          <EvidenceMap claim={investigation.claim} sources={investigation.sources} onSelectSource={selectSource} />
        </RoughBox>
      </section>

      <section>
        <h2 className="mb-3 font-hand text-2xl">Sources</h2>
        <SourceList sources={investigation.sources} openId={openSourceId} onToggle={toggleSource} />
      </section>

      <section>
        <h2 className="mb-3 font-hand text-2xl">Claim drift</h2>
        <ClaimDrift steps={investigation.claimDrift} />
      </section>
    </main>
  )
}
