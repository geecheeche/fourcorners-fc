import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, team, emergencyName, emergencyPhone, signatureDataUrl } = body

    if (!firstName || !lastName || !email || !signatureDataUrl || !emergencyName || !emergencyPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already signed
    const { data: existing } = await supabaseAdmin
      .from('waivers')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'A waiver has already been submitted for this email address.' }, { status: 409 })
    }

    // Store in DB
    const { error: dbError } = await supabaseAdmin.from('waivers').insert({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      phone: phone ?? null,
      team: team ?? null,
      emergency_name: emergencyName,
      emergency_phone: emergencyPhone,
      signature_data: signatureDataUrl,
      signed_at: new Date().toISOString(),
    })

    if (dbError) throw new Error(dbError.message)

    // Send confirmation email — best-effort. The waiver is already saved,
    // so a missing Resend key or a send failure must not fail the request.
    if (process.env.RESEND_API_KEY) {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '')
      try {
        await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: process.env.EMAIL_FROM ?? 'Four Corners FC <noreply@play4corners.com>',
          to: email,
          subject: 'Waiver Received — Welcome to Four Corners FC!',
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
              ${appUrl ? `<img src="${appUrl}/fcfc.jpg" alt="FCFC" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin-bottom:16px"/>` : ''}
              <h1 style="color:#4ade80;margin:0 0 8px">Welcome to FCFC, ${firstName}!</h1>
              <p style="color:#94a3b8">Your waiver has been received and you are now registered with Four Corners FC.</p>
              ${team ? `<p style="color:#94a3b8">Team: <strong style="color:#fff">${team}</strong></p>` : ''}
              <p style="color:#94a3b8">You will receive an email with an RSVP link before each game day. Just click the link to confirm your attendance.</p>
              <p style="color:#64748b;font-size:12px;margin-top:24px">Four Corners FC · Maryland</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('Waiver confirmation email failed:', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
