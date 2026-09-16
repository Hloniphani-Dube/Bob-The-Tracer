import { GithubIcon } from '../icons/GithubIcon'
import { GITHUB_URL } from '../../lib/constants'

// Right dock: what TRACE is, and a link to run it locally instead of
// sharing a public API key.
export function AboutPanel() {
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="mb-3 font-hand text-xl">About TRACE</p>
      <p className="text-sm text-pencil">
        TRACE investigates a claim across real sources instead of answering true or false. Run it locally
        with your own Gemini key, no account required.
      </p>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-sm hover:underline"
      >
        <GithubIcon size={18} />
        View on GitHub
      </a>
    </div>
  )
}
