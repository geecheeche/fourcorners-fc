import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function isAdmin(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET
  return !!secret && req.headers.get('x-admin-secret') === secret
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('fixtures')
    .select('*')
    .order('date', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Integer columns reject '' — treat empty/missing as null
function toScore(v: unknown): number | null {
  return v === '' || v === null || v === undefined ? null : Number(v)
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.date || !body.time || !body.home || !body.away) {
    return NextResponse.json({ error: 'Missing date, time, or teams.' }, { status: 400 })
  }
  const row = {
    date: body.date,
    time: body.time,
    home: body.home,
    away: body.away,
    home_score: toScore(body.home_score),
    away_score: toScore(body.away_score),
    venue: body.venue || undefined,
    status: body.status || undefined,
  }
  const { data, error } = await supabaseAdmin.from('fixtures').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...updates } = await req.json()
  if ('home_score' in updates) updates.home_score = toScore(updates.home_score)
  if ('away_score' in updates) updates.away_score = toScore(updates.away_score)
  const { data, error } = await supabaseAdmin.from('fixtures').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('fixtures').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
