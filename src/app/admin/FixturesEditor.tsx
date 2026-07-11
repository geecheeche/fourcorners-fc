'use client'
import { useState } from 'react'

const TEAMS_LIST = ['Gang Green', 'White Noise', 'Crunch', 'Big Blue']
const BLANK_FIXTURE = { date: '', time: '10:00 AM', home: 'Gang Green', away: 'White Noise', home_score: '', away_score: '', venue: 'Four Corners Field, Maryland', status: 'upcoming' }

type Fixture = {
  id: string; date: string; time: string; home: string; away: string;
  home_score: number | null; away_score: number | null; venue: string; status: string;
}

type Standing = {
  id: string; team: string; played: number; won: number; drawn: number; lost: number; gf: number; ga: number;
}

export default function FixturesEditor({ initialFixtures, initialStandings, adminSecret }: {
  initialFixtures: Fixture[]
  initialStandings: Standing[]
  adminSecret: string
}) {
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures)
  const [standings, setStandings] = useState<Standing[]>(initialStandings)
  const [newFixture, setNewFixture] = useState({ ...BLANK_FIXTURE })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Fixture>>({})
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'fixtures' | 'standings'>('fixtures')

  const headers = { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  async function addFixture() {
    const res = await fetch('/api/fixtures', { method: 'POST', headers, body: JSON.stringify(newFixture) })
    if (!res.ok) { flash('❌ Failed to add'); return }
    const added = await res.json()
    setFixtures(prev => [...prev, added].sort((a, b) => a.date.localeCompare(b.date)))
    setNewFixture({ ...BLANK_FIXTURE })
    flash('✅ Fixture added')
  }

  async function saveEdit(id: string) {
    const res = await fetch('/api/fixtures', { method: 'PATCH', headers, body: JSON.stringify({ id, ...editData }) })
    if (!res.ok) { flash('❌ Failed to save'); return }
    const updated = await res.json()
    setFixtures(prev => prev.map(f => f.id === id ? updated : f))
    setEditingId(null)
    flash('✅ Saved')
  }

  async function deleteFixture(id: string) {
    if (!confirm('Delete this fixture?')) return
    await fetch('/api/fixtures', { method: 'DELETE', headers, body: JSON.stringify({ id }) })
    setFixtures(prev => prev.filter(f => f.id !== id))
    flash('✅ Deleted')
  }

  async function saveStanding(s: Standing) {
    const res = await fetch('/api/standings', { method: 'PATCH', headers, body: JSON.stringify(s) })
    if (!res.ok) { flash('❌ Failed to save standing'); return }
    const updated = await res.json()
    setStandings(prev => prev.map(x => x.id === updated.id ? updated : x))
    flash('✅ Standing updated')
  }

  function startEdit(f: Fixture) {
    setEditingId(f.id)
    setEditData({ date: f.date, time: f.time, home: f.home, away: f.away, home_score: f.home_score, away_score: f.away_score, venue: f.venue, status: f.status })
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {(['fixtures', 'standings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {t === 'fixtures' ? '📅 Fixtures' : '🏆 Standings'}
          </button>
        ))}
      </div>

      {msg && <div className="bg-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200">{msg}</div>}

      {tab === 'fixtures' && (
        <div className="space-y-6">
          {/* Add fixture */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
            <h3 className="font-bold text-white mb-4">Add Fixture</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Date</label>
                <input type="date" value={newFixture.date} onChange={e => setNewFixture(p => ({ ...p, date: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Time</label>
                <input value={newFixture.time} onChange={e => setNewFixture(p => ({ ...p, time: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Home Team</label>
                <select value={newFixture.home} onChange={e => setNewFixture(p => ({ ...p, home: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500">
                  {TEAMS_LIST.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Away Team</label>
                <select value={newFixture.away} onChange={e => setNewFixture(p => ({ ...p, away: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500">
                  {TEAMS_LIST.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Status</label>
                <select value={newFixture.status} onChange={e => setNewFixture(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500">
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="postponed">Postponed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Venue</label>
                <input value={newFixture.venue} onChange={e => setNewFixture(p => ({ ...p, venue: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
              </div>
              {newFixture.status === 'completed' && (
                <>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Home Score</label>
                    <input type="number" min={0} value={newFixture.home_score} onChange={e => setNewFixture(p => ({ ...p, home_score: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Away Score</label>
                    <input type="number" min={0} value={newFixture.away_score} onChange={e => setNewFixture(p => ({ ...p, away_score: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                  </div>
                </>
              )}
            </div>
            <button onClick={addFixture}
              className="mt-4 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-colors">
              + Add Fixture
            </button>
          </div>

          {/* Existing fixtures */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">All Fixtures ({fixtures.length})</h3>
            {fixtures.length === 0 && <p className="text-slate-500 text-sm">No fixtures yet.</p>}
            {fixtures.map(f => (
              <div key={f.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                {editingId === f.id ? (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Date</label>
                        <input type="date" value={editData.date ?? ''} onChange={e => setEditData(p => ({ ...p, date: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Time</label>
                        <input value={editData.time ?? ''} onChange={e => setEditData(p => ({ ...p, time: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Home</label>
                        <select value={editData.home ?? ''} onChange={e => setEditData(p => ({ ...p, home: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500">
                          {TEAMS_LIST.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Away</label>
                        <select value={editData.away ?? ''} onChange={e => setEditData(p => ({ ...p, away: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500">
                          {TEAMS_LIST.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Status</label>
                        <select value={editData.status ?? 'upcoming'} onChange={e => setEditData(p => ({ ...p, status: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500">
                          <option value="upcoming">Upcoming</option>
                          <option value="completed">Completed</option>
                          <option value="postponed">Postponed</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Venue</label>
                        <input value={editData.venue ?? ''} onChange={e => setEditData(p => ({ ...p, venue: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Home Score</label>
                        <input type="number" min={0} value={editData.home_score ?? ''} onChange={e => setEditData(p => ({ ...p, home_score: e.target.value === '' ? null : Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Away Score</label>
                        <input type="number" min={0} value={editData.away_score ?? ''} onChange={e => setEditData(p => ({ ...p, away_score: e.target.value === '' ? null : Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(f.id)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">{new Date(f.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {f.time}</p>
                      <p className="font-bold text-white text-sm">
                        {f.home} {f.status === 'completed' ? `${f.home_score} – ${f.away_score}` : 'vs'} {f.away}
                      </p>
                      <span className={`text-xs ${f.status === 'completed' ? 'text-slate-400' : f.status === 'postponed' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {f.status === 'completed' ? 'Full Time' : f.status === 'postponed' ? 'Postponed' : 'Upcoming'}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => startEdit(f)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium">Edit</button>
                      <button onClick={() => deleteFixture(f.id)} className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-red-400 rounded-lg text-xs font-medium">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'standings' && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">Edit each team's record directly. Points are calculated automatically (W×3 + D).</p>
          {standings.map(s => (
            <StandingRow key={s.id} standing={s} onSave={saveStanding} />
          ))}
        </div>
      )}
    </div>
  )
}

function StandingRow({ standing, onSave }: { standing: Standing; onSave: (s: Standing) => void }) {
  const [data, setData] = useState(standing)
  const [dirty, setDirty] = useState(false)

  function update(field: keyof Standing, val: number) {
    setData(p => ({ ...p, [field]: val }))
    setDirty(true)
  }

  const pts = data.won * 3 + data.drawn

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-white">{data.team}</h4>
        <span className="text-sm font-black text-green-400">{pts} pts</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {([['played', 'P'], ['won', 'W'], ['drawn', 'D'], ['lost', 'L'], ['gf', 'GF'], ['ga', 'GA']] as const).map(([field, label]) => (
          <div key={field}>
            <label className="text-xs text-slate-500 block mb-1 text-center">{label}</label>
            <input type="number" min={0} value={data[field]} onChange={e => update(field, Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-green-500" />
          </div>
        ))}
      </div>
      {dirty && (
        <button onClick={() => { onSave(data); setDirty(false) }}
          className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-colors">
          Save {data.team}
        </button>
      )}
    </div>
  )
}
