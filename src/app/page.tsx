export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TEAMS } from '@/lib/data'
import { supabaseAdmin } from '@/lib/supabase'
import GameSignup from '@/components/GameSignup'

async function getData() {
  const today = new Date().toISOString().split('T')[0]

  try {
    const [{ data: waivers }, { data: fixtures }] = await Promise.all([
      supabaseAdmin.from('waivers').select('first_name, team'),
      supabaseAdmin.from('fixtures').select('*').eq('status', 'upcoming').gte('date', today).order('date').limit(3),
    ])

    // Next upcoming fixture that hasn't happened yet
    const nextGame = fixtures?.[0] ?? null

    let signups: { id: string; first_name: string; team: string | null }[] = []
    if (nextGame) {
      // Double-guard: only fetch signups for dates >= today so stale rows never surface
      const [{ data: widgetSignups }, { data: rsvps }] = await Promise.all([
        supabaseAdmin
          .from('game_signups')
          .select('id, waiver_id, first_name, team')
          .eq('game_date', nextGame.date)
          .gte('game_date', today)
          .order('signed_up_at'),
        supabaseAdmin
          .from('attendance')
          .select('id, player_id, player_name, team')
          .eq('game_date', nextGame.date)
          .gte('game_date', today)
          .eq('status', 'attending'),
      ])
      signups = (widgetSignups ?? []).map(s => ({ id: s.id, first_name: s.first_name, team: s.team }))
      const seen = new Set((widgetSignups ?? []).map(s => s.waiver_id))
      for (const r of rsvps ?? []) {
        if (r.player_id && seen.has(r.player_id)) continue
        if (r.player_id) seen.add(r.player_id)
        signups.push({ id: r.id, first_name: (r.player_name ?? '').split(' ')[0], team: r.team })
      }
    }

    // Team rosters from waivers
    const rosterByTeam: Record<string, string[]> = {}
    for (const w of waivers ?? []) {
      const team = w.team ?? 'Unassigned'
      if (!rosterByTeam[team]) rosterByTeam[team] = []
      rosterByTeam[team].push(w.first_name)
    }

    return { fixtures: fixtures ?? [], nextGame, signups, rosterByTeam }
  } catch {
    return { fixtures: [], nextGame: null, signups: [], rosterByTeam: {} }
  }
}

export default async function HomePage() {
  const { fixtures, nextGame, signups, rosterByTeam } = await getData()
  const upcoming = fixtures.slice(0, 2)

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-slate-900 bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('/field.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/60 to-slate-900/80" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-green-900/50 border border-green-700 text-green-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              ⚽ MARYLAND CO-ED RECREATIONAL FOOTBALL
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-4">
              FOUR<br /><span className="text-green-400">CORNERS</span><br />FC
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-md">
              Four teams. One community. Real football in Maryland — where every player belongs on the pitch.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link href="/waiver" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors">
                Join FCFC →
              </Link>
              <Link href="/fixtures" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors border border-slate-700">
                View Fixtures
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Current Season banner */}
      <section className="bg-gradient-to-r from-green-900/60 via-slate-800 to-blue-900/40 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-600/30 border border-green-600 flex items-center justify-center text-lg flex-shrink-0">
              🌞
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Current Season</span>
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-white font-bold text-lg leading-tight">Summer Season 2026</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-sm pl-14 sm:pl-0">
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Runs until <span className="font-semibold text-white ml-1">August 1, 2026</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <span className="font-semibold text-white">Greenbriar Local Park</span>
                <span className="text-slate-400 ml-1">· 1225 Glen Rd, Potomac MD 20854</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teams strip */}
      <section className="bg-slate-800 border-y border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-6 flex-wrap text-sm font-semibold">
          {TEAMS.map(t => (
            <Link key={t.id} href={`/teams#${t.id}`} className="flex items-center gap-2 hover:text-green-400 transition-colors">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: t.color }} />
              {t.name}
              <span className="text-slate-500 font-normal">({rosterByTeam[t.name]?.length ?? 0})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-3 gap-10">
        {/* Teams with rosters */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 text-white">The Teams</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TEAMS.map(t => {
              const players = rosterByTeam[t.name] ?? []
              return (
                <Link key={t.id} href={`/teams#${t.id}`}
                  className="group bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-all hover:-translate-y-0.5">
                  <div className="h-2" style={{ backgroundColor: t.color }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-white">{t.name}</h3>
                      <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">{t.shirtColor} shirts</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{t.description}</p>

                    {/* Player count + names */}
                    <div className="border-t border-slate-700 pt-3 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Squad</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: t.color }}>
                          {players.length} {players.length === 1 ? 'player' : 'players'}
                        </span>
                      </div>
                      {players.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {players.map((name, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full text-slate-300 bg-slate-700 border border-slate-600">
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 italic">No players yet</p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next game signup */}
          {nextGame ? (
            <GameSignup gameDate={nextGame.date} initialSignups={signups} />
          ) : (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 text-center">
              <p className="text-slate-400 text-sm">No upcoming game scheduled yet.</p>
            </div>
          )}

          {/* Upcoming fixtures */}
          {upcoming.length > 0 && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h2 className="font-bold text-lg mb-4 text-white">Next Fixtures</h2>
              <div className="space-y-3">
                {upcoming.map((f: { id: string; date: string; time: string; home: string; away: string }) => (
                  <div key={f.id} className="bg-slate-900 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-2">
                      {new Date(f.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {f.time}
                    </p>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{f.home}</span>
                      <span className="text-slate-500 text-xs">vs</span>
                      <span>{f.away}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/fixtures" className="block mt-4 text-center text-sm text-green-400 hover:text-green-300 font-medium">
                Full Schedule →
              </Link>
            </div>
          )}

          {/* Waiver CTA */}
          <div className="bg-gradient-to-br from-green-900/60 to-slate-800 rounded-2xl border border-green-800 p-5">
            <h3 className="font-bold text-white mb-2">Ready to play?</h3>
            <p className="text-sm text-slate-300 mb-4">Sign your waiver online and you are in. Takes less than 2 minutes.</p>
            <Link href="/waiver" className="block text-center px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors text-sm">
              Sign Waiver Now
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="bg-slate-800 border-y border-slate-700 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Sign Your Waiver', desc: 'Complete the digital liability waiver on this site. Your signature is stored securely.', icon: '✍️' },
              { step: '02', title: 'Sign Up for Games', desc: 'Enter your email on the homepage to sign up for next weekend\'s game. No login needed.', icon: '📋' },
              { step: '03', title: 'Show Up & Play', desc: 'You\'ll also get email invites before each game day. Just show up ready to play.', icon: '⚽' },
            ].map(s => (
              <div key={s.step} className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="text-xs font-bold text-green-400 mb-1">STEP {s.step}</div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
