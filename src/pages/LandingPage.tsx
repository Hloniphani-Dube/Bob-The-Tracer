import { Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { InvestigateForm } from '../components/InvestigateForm'
import { GithubIcon } from '../components/icons/GithubIcon'
import { GITHUB_URL } from '../lib/constants'

export function LandingPage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      {/* p-2 with a matching negative inset keeps the icon in the same visual
          spot while growing the tap target closer to the ~40px touch minimum. */}
      <Link
        to="/news"
        aria-label="Browse the news feed"
        className="absolute top-4 left-4 p-2 text-ink hover:text-pencil"
      >
        <Newspaper size={24} />
      </Link>

      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="View source on GitHub"
        className="absolute top-4 right-4 p-2 text-ink hover:text-pencil"
      >
        <GithubIcon size={24} />
      </a>

      <h1 className="font-hand text-4xl leading-tight sm:text-5xl">Don't ask AI what is true.</h1>
      <h1 className="sketch-tilt-alt mt-1 font-hand text-4xl leading-tight sm:text-5xl">
        Make AI investigate the evidence.
      </h1>

      <p className="mt-6 max-w-xl text-pencil">
        TRACE traces a claim back through real sources, maps what supports it and what contradicts it, and
        shows exactly how the evidence adds up to a verdict.
      </p>

      <div className="mt-10 w-full max-w-xl">
        <InvestigateForm />
      </div>
    </main>
  )
}
