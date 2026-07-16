import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
import AdminLogin from './AdminLogin'
import SendInviteForm from './SendInviteForm'
import FixturesEditor from './FixturesEditor'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

async function isAuthed() {
  // Fail closed: if ADMIN_SECRET is not configured, nobody is admin.
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  const jar = await cookies()
  return jar.get('fcfc_admin')?.value === secret
}

export default async function AdminPage() {
  if (!(await isAuthed())) {
    return <AdminLogin />
  }

  const [{ data: waivers }, { data: attendance }, { data: fixtures }, { data: standings }] = await Promise.all([
    supabaseAdmin.from('waivers').select('*').order('signed_at', { ascending: false }),
    supabaseAdmin.from('attendance').select('*').order('game_date', { ascending: false }),
    supabaseAdmin.from('fixtures').select('*').order('date', { ascending: true }),
    supabaseAdmin.from('standings').select('*'),
  ])

  // Earlier invite sends could create duplicate rows per player+game;
  // collapse them, letting an actual response win over a pending duplicate.
  const rank: Record<string, number> = { attending: 2, not_attending: 1, pending: 0 }
  const byPlayerGame = new Map<string, NonNullable<typeof attendance>[number]>()
  for (const row of attendance ?? []) {
    const key = `${row.game_date}|${row.player_email}`
    const prev = byPlayerGame.get(key)
    if (!prev || (rank[row.status] ?? 0) > (rank[prev.status] ?? 0)) byPlayerGame.set(key, row)
  }
  const rsvps = [...byPlayerGame.values()]
  const gameDates = [...new Set(rsvps.map(r => r.game_date as string))]

  const attending = rsvps.filter(a => a.status === 'attending')
  const pending = rsvps.filter(a => a.status === 'pending')
  const notAttending = rsvps.filter(a => a.status === 'not_attending')

  const teamGroups = attending.reduce((acc: Record<string, typeof attending>, row) => {
    const t = row.team ?? 'Unassigned'
    if (!acc[t]) acc[t] = []
    acc[t].push(row)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Four Corners FC · Internal</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-green-900/50 border border-green-700 text-green-400 text-xs px-3 py-1 rounded-full">Admin</span>
          <LogoutButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Waivers Signed', value: waivers?.length ?? 0, color: 'text-green-400' },
          { label: 'Attending', value: attending.length, color: 'text-green-400' },
          { label: 'Pending RSVP', value: pending.length, color: 'text-yellow-400' },
          { label: 'Not Attending', value: notAttending.length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 text-center">
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Send Game Day Invite</h2>
          <SendInviteForm adminSecret={process.env.ADMIN_SECRET!} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Attending — By Team</h2>
          {Object.keys(teamGroups).length === 0 ? (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 text-center text-slate-400 text-sm">No RSVPs yet</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(teamGroups).map(([team, players]) => (
                <div key={team} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                  <h3 className="font-bold text-white mb-2">{team} ({players.length})</h3>
                  <ul className="space-y-1">
                    {players.map(p => (
                      <li key={p.id} className="text-sm text-slate-300 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        {p.player_name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RSVP responses by game */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-white mb-4">RSVPs by Game</h2>
        {gameDates.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 text-center text-slate-400 text-sm">No invites sent yet</div>
        ) : (
          <div className="space-y-4">
            {gameDates.map(date => {
              const rows = rsvps.filter(r => r.game_date === date)
              const groups = [
                { label: 'Attending', color: 'text-green-400', items: rows.filter(r => r.status === 'attending') },
                { label: 'Pending', color: 'text-yellow-400', items: rows.filter(r => r.status === 'pending') },
                { label: 'Not Attending', color: 'text-red-400', items: rows.filter(r => r.status === 'not_attending') },
              ]
              return (
                <div key={date} className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
                  <h3 className="font-bold text-white mb-3">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {groups.map(g => (
                      <div key={g.label}>
                        <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${g.color}`}>{g.label} ({g.items.length})</p>
                        {g.items.length > 0 ? (
                          <ul className="space-y-1">
                            {g.items.map(r => (
                              <li key={r.id} className="text-sm text-slate-300">
                                {r.player_name}{r.team ? <span className="text-slate-500"> · {r.team}</span> : null}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-600 italic">None</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Fixtures & Standings editor */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-white mb-4">Fixtures & Standings Editor</h2>
        <FixturesEditor
          initialFixtures={fixtures ?? []}
          initialStandings={standings ?? []}
          adminSecret={process.env.ADMIN_SECRET!}
        />
      </div>

      {/* Waivers table */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-white mb-4">All Signed Waivers ({waivers?.length ?? 0})</h2>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-700 text-xs text-slate-400">
              <tr>
                <th className="text-left p-3 pl-4">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Team</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3 pr-4">Signed</th>
              </tr>
            </thead>
            <tbody>
              {waivers?.map(w => (
                <tr key={w.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30">
                  <td className="p-3 pl-4 font-medium text-white">{w.first_name} {w.last_name}</td>
                  <td className="p-3 text-slate-300">{w.email}</td>
                  <td className="p-3 text-slate-300">{w.team ?? '—'}</td>
                  <td className="p-3 text-slate-400">{w.phone ?? '—'}</td>
                  <td className="p-3 pr-4 text-slate-400">{new Date(w.signed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
