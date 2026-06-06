'use client'
import { useState } from 'react'

export default function AttendanceActions({ token, currentStatus, playerName }: {
  token: string
  currentStatus: string
  playerName: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function rsvp(newStatus: 'attending' | 'not_attending') {
    setLoading(true)
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, status: newStatus }),
    })
    setStatus(newStatus)
    setLoading(false)
  }

  if (status === 'attending') {
    return (
      <div className="bg-green-900/30 border border-green-700 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h2 className="text-xl font-bold text-white mb-1">You&apos;re in!</h2>
        <p className="text-slate-300 text-sm">See you on the pitch, {playerName.split(' ')[0]}!</p>
        <button onClick={() => rsvp('not_attending')} disabled={loading}
          className="mt-4 text-xs text-slate-500 hover:text-slate-300 underline">
          Changed your mind? Click to cancel
        </button>
      </div>
    )
  }

  if (status === 'not_attending') {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">😔</div>
        <h2 className="text-xl font-bold text-white mb-1">No worries!</h2>
        <p className="text-slate-300 text-sm">We&apos;ll miss you this time. See you at the next one!</p>
        <button onClick={() => rsvp('attending')} disabled={loading}
          className="mt-4 text-xs text-green-400 hover:text-green-300 underline">
          Changed your mind? Click to confirm attending
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button onClick={() => rsvp('attending')} disabled={loading}
        className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold text-lg rounded-2xl transition-colors flex items-center justify-center gap-2">
        ✅ Yes, I&apos;m Coming!
      </button>
      <button onClick={() => rsvp('not_attending')} disabled={loading}
        className="w-full py-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold text-lg rounded-2xl transition-colors flex items-center justify-center gap-2">
        ❌ Can&apos;t Make It
      </button>
      {loading && <p className="text-center text-slate-400 text-sm">Saving...</p>}
    </div>
  )
}
