import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Goes back to wherever the visitor came from inside the app (history.state.idx
// is set by react router's own history stack); falls back to the landing page
// when there is nothing to go back to, e.g. a direct link straight to this page.
export function BackButton() {
  const navigate = useNavigate()

  function handleBack() {
    const idx = (window.history.state as { idx?: number } | null)?.idx
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex cursor-pointer items-center gap-1 text-sm text-pencil hover:text-ink"
    >
      <ArrowLeft size={18} />
      Back
    </button>
  )
}
