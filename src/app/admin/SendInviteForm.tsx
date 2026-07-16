'use client'
import { useState } from 'react'

export default function SendInviteForm({ adminSecret }: { adminSecret: string }) {
  const [form, setForm] = useState({ gameDate: '', gameTime: '', venue: 'Four Corners Field, Maryland', matchups: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) {
        setResult(`❌ ${d.error}`)
      } else if (d.sent === 0 && !d.failed) {
        setResult('⚠️ No players to invite yet — invites go to everyone who has signed the waiver.')
      } else if (d.failed > 0) {
        setResult(`⚠️ Sent to ${d.sent} players, ${d.failed} failed: ${d.failures?.[0] ?? ''}`)
      } else {
        setResult(`✅ Sent to ${d.sent} players`)
      }
    } catch {
      setResult('❌ Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
      <div>
        <label className="block text-xs text-slate-400 mb-1">Game Date *</label>
        <input required type="date" value={form.gameDate} onChange={e => setForm(p => ({ ...p, gameDate: e.target.value }))}
          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Game Time *</label>
        <input required value={form.gameTime} onChange={e => setForm(p => ({ ...p, gameTime: e.target.value }))}
          placeholder="e.g. 10:00 AM"
          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Venue</label>
        <input value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))}
          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Matchups (optional)</label>
        <input value={form.matchups} onChange={e => setForm(p => ({ ...p, matchups: e.target.value }))}
          placeholder="e.g. Gang Green vs White Noise"
          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
        {loading ? 'Sending...' : 'Send Invites to All Players'}
      </button>
      {result && <p className="text-sm text-center text-slate-300">{result}</p>}
    </form>
  )
}
