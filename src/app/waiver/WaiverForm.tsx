'use client'
import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

const TEAMS_LIST = ['Gang Green', 'White Noise', 'Crunch', 'Big Blue']

export default function WaiverForm() {
  const sigRef = useRef<SignatureCanvas>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', team: '', emergencyName: '', emergencyPhone: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function clearSig() { sigRef.current?.clear() }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (sigRef.current?.isEmpty()) {
      setError('Please draw your signature before submitting.')
      return
    }

    const signatureDataUrl = sigRef.current?.getTrimmedCanvas().toDataURL('image/png')

    setLoading(true)
    try {
      const res = await fetch('/api/sign-waiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, signatureDataUrl }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Submission failed')
      }
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-900/30 border border-green-700 rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-2">Waiver Signed!</h2>
        <p className="text-slate-300 mb-1">Welcome to Four Corners FC, <strong>{form.firstName}</strong>!</p>
        <p className="text-slate-400 text-sm">A confirmation has been sent to <strong>{form.email}</strong>. You will receive game day invites by email — just click the link to RSVP.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal info */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <h2 className="font-bold text-white mb-4">Personal Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">First Name *</label>
            <input required name="firstName" value={form.firstName} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Last Name *</label>
            <input required name="lastName" value={form.lastName} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Email Address *</label>
            <input required type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Team Assignment</label>
            <select name="team" value={form.team} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm">
              <option value="">Select your team (if known)</option>
              {TEAMS_LIST.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Emergency contact */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <h2 className="font-bold text-white mb-4">Emergency Contact</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Contact Name *</label>
            <input required name="emergencyName" value={form.emergencyName} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Contact Phone *</label>
            <input required name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm" />
          </div>
        </div>
      </div>

      {/* Agreement text */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <h2 className="font-bold text-white mb-3">Agreement</h2>
        <div className="bg-slate-900 rounded-xl p-4 text-xs text-slate-400 leading-relaxed max-h-40 overflow-y-auto border border-slate-700 mb-4">
          By signing below, I acknowledge that I have read, understand, and agree to the Four Corners FC Liability Waiver
          (the full version of which is displayed above). I understand that participation in recreational football involves
          inherent risks of injury, and I voluntarily assume these risks. I release Four Corners FC, its organizers,
          officers, volunteers, and agents from any liability for injuries or damages arising from my participation.
          I confirm that I am medically fit to participate and that all information provided is accurate.
          I agree to abide by the rules and code of conduct of Four Corners FC.
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" required className="mt-0.5 accent-green-500" />
          <span className="text-sm text-slate-300">I have read and agree to the above terms and the full waiver document.</span>
        </label>
      </div>

      {/* Signature */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white">Your Signature *</h2>
          <button type="button" onClick={clearSig} className="text-xs text-slate-400 hover:text-white underline">Clear</button>
        </div>
        <div className="bg-white rounded-xl overflow-hidden border-2 border-slate-600 focus-within:border-green-500">
          <SignatureCanvas
            ref={sigRef}
            penColor="black"
            canvasProps={{ className: 'w-full', height: 160, style: { width: '100%' } }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">Draw your signature above using your mouse or finger</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <button type="submit" disabled={loading}
        className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-colors">
        {loading ? 'Submitting...' : 'Submit Signed Waiver'}
      </button>
    </form>
  )
}
