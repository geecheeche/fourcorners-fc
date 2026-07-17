import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  // Protect with admin secret
  const authHeader = req.headers.get('x-admin-secret')
  if (!process.env.ADMIN_SECRET || authHeader !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { gameDate, gameTime, venue, matchups } = await req.json()
    if (!gameDate || !gameTime || !venue) {
      return NextResponse.json({ error: 'Missing game date, time, or venue.' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured on the server.' }, { status: 500 })
    }
    const resend = new Resend(process.env.RESEND_API_KEY)

    // The RSVP buttons are built from this URL — without it the emails
    // go out with dead "undefined/attendance/..." links.
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '')
    if (!/^https?:\/\//.test(appUrl)) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL is not configured — set it to your site URL (e.g. https://play4corners.com) so the RSVP links in the emails work.' }, { status: 500 })
    }

    // Fetch all waiver signers
    const { data: players, error } = await supabaseAdmin
      .from('waivers')
      .select('id, first_name, last_name, email, team')

    if (error) throw new Error(`Database error: ${error.message.slice(0, 300)}`)
    if (!players?.length) return NextResponse.json({ message: 'No players found', sent: 0 })

    let sent = 0
    let skipped = 0
    const failures: string[] = []
    const statusRank: Record<string, number> = { attending: 2, not_attending: 1, pending: 0 }
    for (const player of players) {
      // Look up prior invite rows for this player+game (earlier bugs could
      // leave duplicates — take the one with an actual response, if any).
      const { data: existingRows } = await supabaseAdmin
        .from('attendance')
        .select('token, status')
        .eq('player_id', player.id)
        .eq('game_date', gameDate)
      const existing = (existingRows ?? [])
        .sort((a, b) => (statusRank[b.status] ?? 0) - (statusRank[a.status] ?? 0))[0]

      // Already responded — don't email them again
      if (existing && existing.status !== 'pending') {
        skipped++
        continue
      }

      let token = existing?.token
      if (!token) {
        token = uuidv4()
        const { error: insertError } = await supabaseAdmin.from('attendance').insert({
          player_id: player.id,
          player_email: player.email,
          player_name: `${player.first_name} ${player.last_name}`,
          team: player.team,
          game_date: gameDate,
          game_time: gameTime,
          venue,
          token,
          status: 'pending',
        })
        if (insertError) {
          failures.push(`${player.email}: ${insertError.message}`)
          continue
        }
      }

      const rsvpBase = `${appUrl}/attendance/${token}`

      const { error: sendError } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'Four Corners FC <noreply@play4corners.com>',
        to: player.email,
        subject: `⚽ Game Day! FCFC — ${gameDate}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
            <img src="${appUrl}/fcfc.jpg" alt="FCFC" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin-bottom:16px"/>
            <h1 style="color:#4ade80;margin:0 0 4px">Game Day!</h1>
            <h2 style="color:#fff;margin:0 0 16px;font-size:18px">${gameDate} at ${gameTime}</h2>
            <p style="color:#94a3b8">Hi ${player.first_name},</p>
            <p style="color:#94a3b8">There is a game at <strong style="color:#fff">${venue}</strong>. Please RSVP below.</p>
            ${matchups ? `<p style="color:#94a3b8;background:#1e293b;padding:12px;border-radius:8px">${matchups}</p>` : ''}
            <div style="margin:24px 0;display:flex;gap:12px">
              <a href="${rsvpBase}?status=attending" style="background:#16a34a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:bold;font-size:16px;display:inline-block">
                ✅ I'm Coming
              </a>
              <a href="${rsvpBase}?status=not_attending" style="background:#374151;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:bold;font-size:16px;display:inline-block;margin-left:12px">
                ❌ Can't Make It
              </a>
            </div>
            <p style="color:#64748b;font-size:12px;margin-top:24px">Four Corners FC · Maryland · <a href="${appUrl}" style="color:#4ade80">play4corners.com</a></p>
          </div>
        `,
      })
      if (sendError) {
        failures.push(`${player.email}: ${sendError.message}`)
        continue
      }
      sent++

      // Resend allows ~2 requests/second — pace the sends to avoid rate limiting
      if (players.length > 1) await new Promise(r => setTimeout(r, 600))
    }

    return NextResponse.json({ success: failures.length === 0, sent, skipped, failed: failures.length, failures })
  } catch (err: unknown) {
    console.error('send-invite error:', err)
    const message = err instanceof Error ? err.message : 'Unknown server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
