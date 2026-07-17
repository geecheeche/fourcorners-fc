export const TEAMS = [
  {
    id: 'gang-green',
    name: 'Gang Green',
    color: '#16a34a',
    textColor: '#ffffff',
    shirtColor: 'Green',
    emoji: '🟢',
    captain: 'TBD',
    description: 'The green machine. Known for their relentless pressing and team chemistry.',
    lineupImage: '/team_images/ganggreen.jpeg',
    players: [] as string[],
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    color: '#6b7280',
    textColor: '#ffffff',
    shirtColor: 'White',
    emoji: '⚪',
    captain: 'TBD',
    description: 'Cool under pressure. White Noise play a disciplined, structured game.',
    lineupImage: '/team_images/whitenoise.jpeg',
    players: [] as string[],
  },
  {
    id: 'big-blue',
    name: 'Big Blue',
    color: '#2563eb',
    textColor: '#ffffff',
    shirtColor: 'Blue',
    emoji: '🔵',
    captain: 'TBD',
    description: 'Big Blue brings creativity and flair to every fixture.',
    lineupImage: '/team_images/big blue.jpeg',
    players: [] as string[],
  },
]

export const FIXTURES = [
  {
    id: 0,
    date: '2026-07-11',
    time: '2:30 PM',
    home: 'Gang Green',
    away: 'Big Blue',
    homeScore: null as number | null,
    awayScore: null as number | null,
    venue: 'Greenbriar Local Park, 1225 Glen Rd, Potomac MD 20854',
    status: 'upcoming' as 'upcoming' | 'completed' | 'postponed',
  },
  {
    id: 1,
    date: '2026-06-14',
    time: '10:00 AM',
    home: 'Gang Green',
    away: 'White Noise',
    homeScore: null as number | null,
    awayScore: null as number | null,
    venue: 'Four Corners Field, Maryland',
    status: 'upcoming' as 'upcoming' | 'completed' | 'postponed',
  },
  {
    id: 4,
    date: '2026-06-21',
    time: '11:30 AM',
    home: 'White Noise',
    away: 'Big Blue',
    homeScore: null as number | null,
    awayScore: null as number | null,
    venue: 'Four Corners Field, Maryland',
    status: 'upcoming' as 'upcoming' | 'completed' | 'postponed',
  },
  {
    id: 5,
    date: '2026-06-28',
    time: '10:00 AM',
    home: 'Gang Green',
    away: 'Big Blue',
    homeScore: null as number | null,
    awayScore: null as number | null,
    venue: 'Four Corners Field, Maryland',
    status: 'upcoming' as 'upcoming' | 'completed' | 'postponed',
  },
]

export const STANDINGS = [
  { team: 'Gang Green', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { team: 'White Noise', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 },
  { team: 'Big Blue', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 },
]

export function getTeamColor(teamName: string) {
  return TEAMS.find(t => t.name === teamName)?.color ?? '#6b7280'
}
