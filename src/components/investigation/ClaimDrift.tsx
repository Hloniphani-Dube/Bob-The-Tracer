import { TriangleAlert } from 'lucide-react'
import type { ClaimDriftStep } from '../../types/investigation'
import { RoughArrow } from '../sketch/RoughArrow'
import { RoughBox } from '../sketch/RoughBox'

interface ClaimDriftProps {
  steps: ClaimDriftStep[]
}

// Lays the claim's stages side by side with rough arrows between them, and
// underlines the phrase that shifted meaning at each step, so drift from
// "association" to "proved" is visible at a glance.
export function ClaimDrift({ steps }: ClaimDriftProps) {
  const anyDrift = steps.some((s) => s.changedPhrase)

  return (
    <div>
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
            <RoughBox className="min-w-0 flex-1 px-4 py-3">
              <p className="font-hand text-sm text-pencil">{step.label}</p>
              <p className="mt-1 text-sm break-words">
                {step.changedPhrase
                  ? step.text.split(step.changedPhrase).map((part, j, arr) => (
                      <span key={j}>
                        {part}
                        {j < arr.length - 1 && (
                          <span className="bg-verdict-partial/25 font-semibold underline decoration-2">
                            {step.changedPhrase}
                          </span>
                        )}
                      </span>
                    ))
                  : step.text}
              </p>
            </RoughBox>
            {i < steps.length - 1 && (
              <div className="flex justify-center lg:block">
                <RoughArrow direction="right" size={28} className="hidden lg:block" />
                <RoughArrow direction="down" size={28} className="lg:hidden" />
              </div>
            )}
          </div>
        ))}
      </div>
      {anyDrift && (
        <p className="mt-4 flex items-center gap-2 font-hand text-lg">
          <TriangleAlert size={20} color="var(--verdict-partial)" strokeWidth={2.25} />
          Meaning changed as the claim spread.
        </p>
      )}
    </div>
  )
}
