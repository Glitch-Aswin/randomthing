import { NextResponse } from 'next/server'

// Server-side password for the crossword page. Configure with PAGE_ACCESS_PASSWORD,
// defaulting to 'fayol' as requested. Kept separate from /api/unlock.
export async function POST(request) {
  try {
    const body = await request.json()
    const submitted = (body?.password || '').toString().trim()
    const expected = process.env.PAGE_ACCESS_PASSWORD || 'fayol'

    const ok = submitted.toLowerCase() === expected.toLowerCase()
    if (!ok) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set('page-unlocked', '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      // 1 day expiry
      maxAge: 60 * 60 * 24,
    })
    return res
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }
}
