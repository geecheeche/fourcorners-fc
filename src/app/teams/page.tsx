import Image from 'next/image'
import { TEAMS } from '@/lib/data'

const CAPTAINS: Record<string, { name: string; position: string; bio: string }> = {
  'gang-green': { name: 'TBD', position: 'Captain', bio: 'Captain to be announced.' },
  'white-noise': { name: 'TBD', position: 'Captain', bio: 'Captain to be announced.' },
  'crunch': { name: 'TBD', position: 'Captain', bio: 'Captain to be announced.' },
  'big-blue': { name: 'TBD', position: 'Captain', bio: 'Captain to be announced.' },
}

function ShirtIcon({ color, border }: { color: string; border?: string }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill={color} stroke={border ?? color} strokeWidth={border ? '3' : '0'}>
      <path d="M30 10 L10 30 L20 35 L20 90 L80 90 L80 35 L90 30 L70 10 C70 10 65 20 50 20 C35 20 30 10 30 10Z" />
      <path d="M30 10 C30 10 35 20 50 20 C65 20 70 10 70 10" fill="none" stroke={border ?? color} strokeWidth="2"/>
    </svg>
  )
}

export default function TeamsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-3">The Teams</h1>
        <p className="text-slate-400 max-w-xl mx-auto">Three squads. Every player is assigned to a team for the season. Matches are played in a round-robin format.</p>
      </div>

      <div className="space-y-12">
        {TEAMS.map(team => {
          const captain = CAPTAINS[team.id]
          return (
            <div key={team.id} id={team.id} className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 scroll-mt-20">
              {/* Team header */}
              <div className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6" style={{ background: `linear-gradient(135deg, ${team.color}22, transparent)` }}>
                <div className="w-24 h-24 flex-shrink-0">
                  <ShirtIcon color={team.color} border={team.id === 'white-noise' ? '#9ca3af' : undefined} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h2 className="text-3xl font-black text-white">{team.name}</h2>
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: team.color }}>
                      {team.shirtColor} Shirts
                    </span>
                  </div>
                  <p className="text-slate-300 text-lg mb-4">{team.description}</p>
                </div>
              </div>

              {/* Captain */}
              <div className="border-t border-slate-700 p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Team Captain</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: team.color }}>
                    {captain.name !== 'TBD' ? captain.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <p className="font-bold text-white">{captain.name}</p>
                    <p className="text-sm text-slate-400">{captain.position}</p>
                    <p className="text-sm text-slate-400 mt-1">{captain.bio}</p>
                  </div>
                </div>
              </div>

              {/* Lineup image */}
              <div className="border-t border-slate-700 p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Squad Lineup</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                  {team.lineupImage ? (
                    <div className="relative aspect-[4/3] w-full">
                      <Image src={team.lineupImage} alt={`${team.name} squad lineup`} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="text-4xl mb-3">📸</div>
                      <p className="text-slate-400 text-sm font-medium">Team lineup photo coming soon</p>
                      <p className="text-slate-600 text-xs mt-1">Images will be updated before the season kicks off</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Roster */}
              <div className="border-t border-slate-700 p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Registered Players</h3>
                {team.players.length === 0 ? (
                  <p className="text-slate-500 text-sm">Player registrations open — sign your waiver to be added to the roster.</p>
                ) : (
                  <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {team.players.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
