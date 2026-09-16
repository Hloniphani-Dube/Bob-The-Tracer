import { RoughMeter } from '../sketch/RoughMeter'

interface EvidenceQualityMeterProps {
  score: number // 0..100
}

export function EvidenceQualityMeter({ score }: EvidenceQualityMeterProps) {
  return (
    <div>
      <RoughMeter value={score} height={28} />
      <p className="mt-2 font-hand text-lg">
        Evidence quality: {score} / 100
        <span className="ml-2 font-sans text-xs text-pencil">(a TRACE assessment, not an objective measure)</span>
      </p>
    </div>
  )
}
