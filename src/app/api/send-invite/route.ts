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

    // Fetch all waiver signers
    const { data: players, error } = await supabaseAdmin
      .from('waivers')
      .select('id, first_name, last_name, email, team')

    if (error) throw new Error(`Database error: ${error.message}`)
    if (!players?.length) return NextResponse.json({ message: 'No players found', sent: 0 })

    let sent = 0
    const failures: string[] = []
    for (const player of players) {
      // Reuse an existing attendance record for this player+game so a
      // re-send (e.g. after an email failure) doesn't create duplicates.
      const { data: existing } = await supabaseAdmin
        .from('attendance')
        .select('token')
        .eq('player_id', player.id)
        .eq('game_date', gameDate)
        .maybeSingle()

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

      const rsvpBase = `${process.env.NEXT_PUBLIC_APP_URL}/attendance/${token}`

      const { error: sendError } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'Four Corners FC <noreply@play4corners.com>',
        to: player.email,
        subject: `⚽ Game Day! FCFC — ${gameDate}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/fcfc.jpg" alt="FCFC" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin-bottom:16px"/>
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
            <p style="color:#64748b;font-size:12px;margin-top:24px">Four Corners FC · Maryland · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#4ade80">play4corners.com</a></p>
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

    return NextResponse.json({ success: failures.length === 0, sent, failed: failures.length, failures })
  } catch (err: unknown) {
    console.error('send-invite error:', err)
    const message = err instanceof Error ? err.message : 'Unknown server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
