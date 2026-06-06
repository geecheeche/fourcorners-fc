import { FIXTURES, STANDINGS, TEAMS } from '@/lib/data'

function getTeamColor(name: string) {
  return TEAMS.find(t => t.name === name)?.color ?? '#6b7280'
}

export default function FixturesPage() {
  const upcoming = FIXTURES.filter(f => f.status === 'upcoming')
  const completed = FIXTURES.filter(f => f.status === 'completed')

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2">Fixtures & League Log</h1>
        <p className="text-slate-400">All scheduled matches and current standings for the season.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: fixtures */}
        <div className="lg:col-span-2 space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Upcoming Fixtures
              </h2>
              <div className="space-y-3">
                {upcoming.map(f => (
                  <FixtureCard key={f.id} fixture={f} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Completed</h2>
              <div className="space-y-3">
                {completed.map(f => (
                  <FixtureCard key={f.id} fixture={f} />
                ))}
              </div>
            </section>
          )}

          {upcoming.length === 0 && completed.length === 0 && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-10 text-center">
              <div className="text-5xl mb-4">📅</div>
              <p className="text-slate-300 font-semibold">Season schedule coming soon</p>
              <p className="text-slate-500 text-sm mt-1">Fixtures will be posted here once confirmed</p>
            </div>
          )}
        </div>

        {/* Right: standings */}
        <div id="log">
          <h2 className="text-xl font-bold text-white mb-4">League Table</h2>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr className="text-slate-400 text-xs">
                  <th className="text-left p-3 pl-4">#</th>
                  <th className="text-left p-3">Team</th>
                  <th className="text-center p-3">P</th>
                  <th className="text-center p-3">W</th>
                  <th className="text-center p-3">D</th>
                  <th className="text-center p-3">L</th>
                  <th className="text-center p-3">GD</th>
                  <th className="text-center p-3 pr-4">Pts</th>
                </tr>
              </thead>
              <tbody>
                {STANDINGS.map((s, i) => (
                  <tr key={s.team} className={`border-b border-slate-700/50 last:border-0 ${i === 0 ? 'bg-green-900/10' : ''}`}>
                    <td className="p-3 pl-4 text-slate-500">{i + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getTeamColor(s.team) }} />
                        <span className={`font-semibold ${i === 0 ? 'text-white' : 'text-slate-200'}`}>{s.team}</span>
                      </div>
                    </td>
                    <td className="text-center p-3 text-slate-400">{s.played}</td>
                    <td className="text-center p-3 text-slate-400">{s.won}</td>
                    <td className="text-center p-3 text-slate-400">{s.drawn}</td>
                    <td className="text-center p-3 text-slate-400">{s.lost}</td>
                    <td className="text-center p-3 text-slate-400">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                    <td className="text-center p-3 pr-4 font-bold text-white">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key */}
          <div className="mt-4 space-y-1">
            {TEAMS.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name} — {t.shirtColor} shirts
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-slate-500 bg-slate-800 rounded-xl p-3 border border-slate-700">
            <p className="font-semibold text-slate-400 mb-1">Points System</p>
            <p>Win = 3 pts &bull; Draw = 1 pt &bull; Loss = 0 pts</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FixtureCard({ fixture }: { fixture: typeof FIXTURES[0] }) {
  const isCompleted = fixture.status === 'completed'
  const date = new Date(fixture.date)

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {fixture.time}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCompleted ? 'bg-slate-700 text-slate-300' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
          {isCompleted ? 'FT' : 'Upcoming'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getTeamColor(fixture.home) }} />
          <span className="font-bold text-white truncate">{fixture.home}</span>
        </div>
        <div className="px-4 text-center flex-shrink-0">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-xl font-black">
              <span className="text-white">{fixture.homeScore}</span>
              <span className="text-slate-600">-</span>
              <span className="text-white">{fixture.awayScore}</span>
            </div>
          ) : (
            <span className="text-slate-500 text-sm font-bold">vs</span>
          )}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <span className="font-bold text-white truncate">{fixture.away}</span>
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getTeamColor(fixture.away) }} />
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {fixture.venue}
      </p>
    </div>
  )
}
