'use client'
import { useState } from 'react'

type Signup = { id: string; first_name: string; team: string | null }

export default function GameSignup({ gameDate, initialSignups }: {
  gameDate: string
  initialSignups: Signup[]
}) {
  const [signups, setSignups] = useState<Signup[]>(initialSignups)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [myEmail, setMyEmail] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMsg('')
    try {
      const res = await fetch('/api/game-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), gameDate }),
      })
      const data = await res.json()
      if (!res.ok) { setStatus('error'); setMsg(data.error); return }

      setMyEmail(email.trim())
      setStatus('success')
      setMsg(`You're in, ${data.firstName}!`)
      // Add to list if not already there
      setSignups(prev => {
        const already = prev.find(s => s.first_name === data.firstName && s.team === data.team)
        if (already) return prev
        return [...prev, { id: Date.now().toString(), first_name: data.firstName, team: data.team }]
      })
    } catch {
      setStatus('error')
      setMsg('Something went wrong. Please try again.')
    }
  }

  async function handleWithdraw() {
    await fetch('/api/game-signup', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: myEmail, gameDate }),
    })
    setStatus('idle')
    setMsg('')
    setEmail('')
  }

  const formattedDate = new Date(gameDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/50 to-slate-800 px-5 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-0.5">Next Game</p>
            <h3 className="font-bold text-white text-lg">{formattedDate}</h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{signups.length}</span>
            <p className="text-xs text-slate-400">signed up</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Signup form */}
        {status === 'success' ? (
          <div className="bg-green-900/30 border border-green-700 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-white font-semibold text-sm">{msg}</p>
                <p className="text-slate-400 text-xs">You&apos;re on the list for {formattedDate}</p>
              </div>
            </div>
            <button onClick={handleWithdraw} className="text-xs text-slate-400 hover:text-red-400 underline flex-shrink-0">
              Remove me
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email to sign up"
              className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-green-500 min-w-0"
            />
            <button type="submit" disabled={status === 'loading'}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex-shrink-0 transition-colors">
              {status === 'loading' ? '...' : "I'm In"}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-400 text-xs -mt-2">{msg}</p>
        )}

        {signups.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-2">No sign-ups yet — be the first!</p>
        )}
      </div>
    </div>
  )
}
