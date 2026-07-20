import { TEAMS, FIXTURES as STATIC_FIXTURES } from '@/lib/data'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function getTeamColor(name: string) {
  return TEAMS.find(t => t.name === name)?.color ?? '#6b7280'
}

type FixtureRow = {
  id: string; date: string; time: string; home: string; away: string;
  home_score: number | null; away_score: number | null; venue: string; status: string;
}

type StandingRow = {
  id: string; team: string; played: number; won: number; drawn: number; lost: number; gf: number; ga: number;
}

async function getData() {
  try {
    const [{ data: fixtures }, { data: standings }] = await Promise.all([
      supabaseAdmin.from('fixtures').select('*').order('date', { ascending: true }),
      supabaseAdmin.from('standings').select('*'),
    ])

    const sortedStandings = standings ? [...standings].sort((a, b) => {
      const ptsDiff = (b.won * 3 + b.drawn) - (a.won * 3 + a.drawn)
      if (ptsDiff !== 0) return ptsDiff
      return (b.gf - b.ga) - (a.gf - a.ga)
    }) : null

    return { fixtures: fixtures ?? [], standings: sortedStandings }
  } catch {
    const today = new Date().toISOString().split('T')[0]
    return { fixtures: STATIC_FIXTURES.map(f => ({
      id: String(f.id), date: f.date, time: f.time, home: f.home, away: f.away,
      home_score: f.homeScore, away_score: f.awayScore, venue: f.venue,
      // Auto-mark past fixtures as completed if no score set yet
      status: f.status === 'upcoming' && f.date < today ? 'completed' : f.status,
    })), standings: null }
  }
}

export default async function FixturesPage() {
  const { fixtures, standings } = await getData()

  const upcoming = fixtures.filter((f: FixtureRow) => f.status === 'upcoming')
  const completed = fixtures.filter((f: FixtureRow) => f.status === 'completed')
    .sort((a: FixtureRow, b: FixtureRow) => b.date.localeCompare(a.date))

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2">Fixtures & Results</h1>
        <p className="text-slate-400">All scheduled matches, results, and current standings.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: fixtures + results */}
        <div className="lg:col-span-2 space-y-10">

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Upcoming Fixtures
              </h2>
              <div className="space-y-3">
                {upcoming.map((f: FixtureRow) => <FixtureCard key={f.id} fixture={f} />)}
              </div>
            </section>
          )}

          {/* Results */}
          {completed.length > 0 && (
            <section id="results">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🏁 Results
              </h2>
              <div className="space-y-3">
                {completed.map((f: FixtureRow) => <ResultCard key={f.id} fixture={f} />)}
              </div>
            </section>
          )}

          {fixtures.length === 0 && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-10 text-center">
              <div className="text-5xl mb-4">📅</div>
              <p className="text-slate-300 font-semibold">Season schedule coming soon</p>
              <p className="text-slate-500 text-sm mt-1">Fixtures will be posted here once confirmed</p>
            </div>
          )}
        </div>

        {/* Right: standings */}
        <div id="log" className="space-y-6">
          <div>
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
                  {(standings ?? TEAMS.map(t => ({ id: t.id, team: t.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 }))).map((s: StandingRow, i: number) => {
                    const gd = s.gf - s.ga
                    const pts = s.won * 3 + s.drawn
                    return (
                      <tr key={s.id} className={`border-b border-slate-700/50 last:border-0 ${i === 0 && pts > 0 ? 'bg-green-900/10' : ''}`}>
                        <td className="p-3 pl-4 text-slate-500">{i + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getTeamColor(s.team) }} />
                            <span className="font-semibold text-slate-200">{s.team}</span>
                          </div>
                        </td>
                        <td className="text-center p-3 text-slate-400">{s.played}</td>
                        <td className="text-center p-3 text-slate-400">{s.won}</td>
                        <td className="text-center p-3 text-slate-400">{s.drawn}</td>
                        <td className="text-center p-3 text-slate-400">{s.lost}</td>
                        <td className="text-center p-3 text-slate-400">{gd > 0 ? `+${gd}` : gd}</td>
                        <td className="text-center p-3 pr-4 font-bold text-white">{pts}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team key */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
            {TEAMS.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                <span className="font-medium" style={{ color: t.color }}>{t.name}</span>
                <span>— {t.shirtColor} shirts</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500 bg-slate-800 rounded-xl p-3 border border-slate-700">
            <p className="font-semibold text-slate-400 mb-1">Points System</p>
            <p>Win = 3 pts · Draw = 1 pt · Loss = 0 pts</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FixtureCard({ fixture: f }: { fixture: FixtureRow }) {
  const date = new Date(f.date + 'T00:00:00')
  const isToday = f.date === new Date().toISOString().split('T')[0]
  return (
    <div className={`bg-slate-800 rounded-2xl border p-4 ${isToday ? 'border-green-600 shadow-lg shadow-green-900/30' : 'border-slate-700'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {f.time}
        </div>
        <div className="flex items-center gap-2">
          {isToday && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">TODAY</span>}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.status === 'postponed' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
            {f.status === 'postponed' ? 'Postponed' : 'Upcoming'}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getTeamColor(f.home) }} />
          <span className="font-bold text-white">{f.home}</span>
        </div>
        <span className="text-slate-500 text-sm font-bold px-4">vs</span>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-bold text-white">{f.away}</span>
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getTeamColor(f.away) }} />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {f.venue}
      </p>
    </div>
  )
}

function ResultCard({ fixture: f }: { fixture: FixtureRow }) {
  const date = new Date(f.date + 'T00:00:00')
  const homeWon = (f.home_score ?? 0) > (f.away_score ?? 0)
  const awayWon = (f.away_score ?? 0) > (f.home_score ?? 0)
  const draw = f.home_score === f.away_score

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
      <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        {draw && <span className="ml-auto bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">Draw</span>}
      </p>

      <div className="flex items-center justify-between gap-4">
        {/* Home */}
        <div className={`flex-1 text-center ${homeWon ? 'opacity-100' : 'opacity-50'}`}>
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center border-2"
            style={{ backgroundColor: getTeamColor(f.home) + '33', borderColor: getTeamColor(f.home) }}>
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: getTeamColor(f.home) }} />
          </div>
          <p className={`font-bold text-sm ${homeWon ? 'text-white' : 'text-slate-400'}`}>{f.home}</p>
          {homeWon && <span className="text-xs text-green-400 font-semibold">Winner</span>}
        </div>

        {/* Score */}
        <div className="text-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-black ${homeWon ? 'text-white' : 'text-slate-500'}`}>{f.home_score}</span>
            <span className="text-slate-600 text-2xl font-bold">–</span>
            <span className={`text-4xl font-black ${awayWon ? 'text-white' : 'text-slate-500'}`}>{f.away_score}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Full Time</span>
        </div>

        {/* Away */}
        <div className={`flex-1 text-center ${awayWon ? 'opacity-100' : 'opacity-50'}`}>
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center border-2"
            style={{ backgroundColor: getTeamColor(f.away) + '33', borderColor: getTeamColor(f.away) }}>
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: getTeamColor(f.away) }} />
          </div>
          <p className={`font-bold text-sm ${awayWon ? 'text-white' : 'text-slate-400'}`}>{f.away}</p>
          {awayWon && <span className="text-xs text-green-400 font-semibold">Winner</span>}
        </div>
      </div>

      <p className="text-xs text-slate-600 mt-4 text-center flex items-center justify-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {f.venue}
      </p>
    </div>
  )
}
