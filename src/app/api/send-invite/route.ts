import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import { v4 as uuidv4 } from 'uuid'

function getResend() { return new Resend(process.env.RESEND_API_KEY ?? '') }

export async function POST(req: NextRequest) {
  // Protect with admin secret
  const authHeader = req.headers.get('x-admin-secret')
  if (!process.env.ADMIN_SECRET || authHeader !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { gameDate, gameTime, venue, matchups } = await req.json()

    // Fetch all waiver signers
    const { data: players, error } = await supabaseAdmin
      .from('waivers')
      .select('id, first_name, last_name, email, team')

    if (error) throw new Error(error.message)
    if (!players?.length) return NextResponse.json({ message: 'No players found', sent: 0 })

    let sent = 0
    for (const player of players) {
      const token = uuidv4()

      // Create attendance record
      await supabaseAdmin.from('attendance').insert({
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

      const rsvpBase = `${process.env.NEXT_PUBLIC_APP_URL}/attendance/${token}`

      await getResend().emails.send({
        from: 'Four Corners FC <noreply@fourcornersfc.com>',
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
            <p style="color:#64748b;font-size:12px;margin-top:24px">Four Corners FC · Maryland · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#4ade80">fourcornersfc.com</a></p>
          </div>
        `,
      })
      sent++
    }

    return NextResponse.json({ success: true, sent })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
