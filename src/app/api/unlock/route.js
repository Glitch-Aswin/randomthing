import { NextResponse } from 'next/server'

// Server-side password check. Do NOT expose the password in the client.
// Configure the secret in .env.local as ACCESS_PASSWORD=innovation (or any value you want)

export async function POST(request) {
  try {
    const body = await request.json()
    const submitted = (body?.password || '').toString().trim()
  const expected = process.env.ACCESS_PASSWORD || 'innovation'

    const ok = submitted.toLowerCase() === expected.toLowerCase()
    if (!ok) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 })
    }

    // No persistence: return success without setting cookies.
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }
}
