export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import AttendanceActions from './AttendanceActions'

export default async function AttendancePage({ params, searchParams }: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { token } = await params
  const { status: initialStatus } = await searchParams

  const { data: record } = await supabaseAdmin
    .from('attendance')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (!record) return notFound()

  // Auto-update if status passed in URL (from email button click)
  if (initialStatus && ['attending', 'not_attending'].includes(initialStatus) && record.status === 'pending') {
    await supabaseAdmin
      .from('attendance')
      .update({ status: initialStatus, responded_at: new Date().toISOString() })
      .eq('token', token)
    record.status = initialStatus
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-3xl font-black text-white mb-1">Game Day RSVP</h1>
          <p className="text-slate-400">Four Corners FC</p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
          <p className="text-slate-400 text-sm mb-1">Hi, <strong className="text-white">{record.player_name}</strong></p>
          {record.team && <p className="text-slate-400 text-sm mb-3">Team: <span className="text-white font-medium">{record.team}</span></p>}
          <div className="bg-slate-900 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">📅</span>
              <span className="text-white font-semibold">{new Date(record.game_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">🕙</span>
              <span className="text-slate-300">{record.game_time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">📍</span>
              <span className="text-slate-300">{record.venue}</span>
            </div>
          </div>
        </div>

        <AttendanceActions token={token} currentStatus={record.status} playerName={record.player_name} />
      </div>
    </div>
  )
}
