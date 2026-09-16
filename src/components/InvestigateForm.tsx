import { Paperclip, X } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHistory } from '../lib/useHistory'
import { RoughBox } from './sketch/RoughBox'
import { RoughButton } from './sketch/RoughButton'

interface InvestigateFormProps {
  compact?: boolean
  onSubmit?: () => void
}

// Pass 1 has no backend: whatever is submitted here routes straight to the
// mock investigation, and an attached screenshot is only ever used for its
// file name (no OCR yet). A later pass posts the claim text or image to
// FastAPI instead and keeps this same form.
export function InvestigateForm({ compact = false, onSubmit }: InvestigateFormProps) {
  const [value, setValue] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const { addEntry } = useHistory()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    addEntry(screenshot ? `Screenshot: ${screenshot.name}` : value)
    navigate('/investigate')
    onSubmit?.()
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
      <RoughBox className="flex items-center gap-3 px-4 py-3">
        {screenshot ? (
          <span className="flex w-full items-center gap-2 text-sm">
            <Paperclip size={compact ? 16 : 18} className="shrink-0 text-pencil" />
            <span className="truncate">{screenshot.name}</span>
            <button
              type="button"
              aria-label="Remove attached screenshot"
              onClick={() => setScreenshot(null)}
              className="-m-2 ml-auto shrink-0 cursor-pointer p-2 text-pencil hover:text-ink"
            >
              <X size={16} />
            </button>
          </span>
        ) : (
          <>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Paste a claim, URL, or upload a screenshot..."
              className={`w-full bg-transparent font-body outline-none placeholder:text-pencil ${compact ? 'text-sm' : 'text-lg'}`}
            />
            <button
              type="button"
              aria-label="Attach a screenshot"
              onClick={() => fileInputRef.current?.click()}
              className="-m-2 shrink-0 cursor-pointer p-2 text-pencil hover:text-ink"
            >
              <Paperclip size={compact ? 16 : 20} />
            </button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
        />
      </RoughBox>
      <RoughButton type="submit" className="w-full">
        Investigate
      </RoughButton>
    </form>
  )
}
