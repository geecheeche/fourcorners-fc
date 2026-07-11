import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, gameDate } = await req.json()
    if (!email || !gameDate) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Look up waiver by email
    const { data: player } = await supabaseAdmin
      .from('waivers')
      .select('id, first_name, team')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (!player) {
      return NextResponse.json({ error: 'No waiver found for this email. Please sign your waiver first.' }, { status: 404 })
    }

    // Upsert signup (idempotent — safe to call again)
    const { error } = await supabaseAdmin.from('game_signups').upsert({
      waiver_id: player.id,
      first_name: player.first_name,
      team: player.team,
      game_date: gameDate,
    }, { onConflict: 'waiver_id,game_date' })

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, firstName: player.first_name, team: player.team })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { email, gameDate } = await req.json()

    const { data: player } = await supabaseAdmin
      .from('waivers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

    await supabaseAdmin.from('game_signups')
      .delete()
      .eq('waiver_id', player.id)
      .eq('game_date', gameDate)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
