import { MessageCircle, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { RoughBox } from '../sketch/RoughBox'

interface Message {
  from: 'user' | 'trace'
  text: string
}

const INITIAL: Message[] = [
  { from: 'trace', text: 'Ask about the current investigation once it is connected to a backend.' },
]

// Bottom dock: a chat stub. It echoes locally for now, standing in for the
// real backend conversation a later pass wires to Gemini.
export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(INITIAL)
  const [draft, setDraft] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    setMessages((m) => [
      ...m,
      { from: 'user', text: draft },
      { from: 'trace', text: 'Chat is not connected to a backend yet in this build.' },
    ])
    setDraft('')
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <div className="mb-2 flex items-center gap-2">
        <p className="flex items-center gap-2 font-hand text-xl">
          <MessageCircle size={20} />
          Ask
        </p>
        {/* The mascot lives in its own header slot rather than floating over
            the messages or input, so it stays visible without ever sitting
            on top of anything the reader is trying to read or click. */}
        <img
          src="/img_mask.png"
          alt=""
          aria-hidden="true"
          className="ml-auto h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
        />
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto text-sm">
        {messages.map((m, i) => (
          <p key={i} className={m.from === 'user' ? 'text-ink' : 'text-pencil'}>
            {m.from === 'user' ? 'You: ' : 'TRACE: '}
            {m.text}
          </p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
        <RoughBox className="flex-1 px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-pencil"
          />
        </RoughBox>
        <button type="submit" aria-label="Send" className="cursor-pointer text-ink hover:text-pencil">
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
