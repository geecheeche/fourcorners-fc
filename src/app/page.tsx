import Image from 'next/image'
import Link from 'next/link'
import { TEAMS, FIXTURES, STANDINGS } from '@/lib/data'

export default function HomePage() {
  const upcoming = FIXTURES.filter(f => f.status === 'upcoming').slice(0, 2)

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-slate-900 pitch-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-slate-900/80 to-slate-900" />
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
          <div className="flex-shrink-0">
            <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-slate-800 border-4 border-green-600 overflow-hidden shadow-2xl shadow-green-900/50">
              <Image src="/fcfc.jpg" alt="Four Corners FC" width={288} height={288} className="object-cover w-full h-full" priority />
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
            </Link>
          ))}
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 text-white">The Teams</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TEAMS.map(t => (
              <Link key={t.id} href={`/teams#${t.id}`}
                className="group bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-all hover:-translate-y-0.5">
                <div className="h-2" style={{ backgroundColor: t.color }} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-white">{t.name}</h3>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">{t.shirtColor} shirts</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{t.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Captain: {t.captain}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
            <h2 className="font-bold text-lg mb-4 text-white">Next Fixtures</h2>
            {upcoming.length === 0 ? (
              <p className="text-slate-400 text-sm">No upcoming fixtures.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(f => (
                  <div key={f.id} className="bg-slate-900 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-2">{new Date(f.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {f.time}</p>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{f.home}</span>
                      <span className="text-slate-500 text-xs">vs</span>
                      <span>{f.away}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/fixtures" className="block mt-4 text-center text-sm text-green-400 hover:text-green-300 font-medium">
              Full Schedule →
            </Link>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
            <h2 className="font-bold text-lg mb-4 text-white">League Table</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left pb-2">Team</th>
                  <th className="text-center pb-2">P</th>
                  <th className="text-center pb-2">Pts</th>
                </tr>
              </thead>
              <tbody>
                {STANDINGS.map((s, i) => (
                  <tr key={s.team} className="border-b border-slate-700/50 last:border-0">
                    <td className="py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{i + 1}</span>
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: TEAMS.find(t => t.name === s.team)?.color }} />
                        <span className="font-medium text-slate-200">{s.team}</span>
                      </div>
                    </td>
                    <td className="text-center text-slate-400">{s.played}</td>
                    <td className="text-center font-bold text-white">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href="/fixtures#log" className="block mt-4 text-center text-sm text-green-400 hover:text-green-300 font-medium">
              Full Standings →
            </Link>
          </div>

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
              { step: '02', title: 'Get the Email', desc: 'When a game day is scheduled, you will receive an email invite with an RSVP link.', icon: '📧' },
              { step: '03', title: 'Show Up & Play', desc: 'Click your link, confirm attendance, and show up ready to play for your team.', icon: '⚽' },
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
