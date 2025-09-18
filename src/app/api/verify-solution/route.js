import { NextResponse } from 'next/server'

// Server-side canonical crossword definition (10x12)
const MATRIX_ROWS = 10
const MATRIX_COLS = 12

const ENTRIES = [
  { id: 1, answer: 'LEVERAGE', start: [5, 0], end: [5, 7] },
  { id: 2, answer: 'STRATEGY', start: [0, 3], end: [7, 3] },
  { id: 3, answer: 'BUFFETT', start: [8, 4], end: [8, 10] },
  { id: 4, answer: 'STARTUP', start: [3, 5], end: [10, 5] },
  { id: 5, answer: 'STOCKX', start: [2, 6], end: [2, 11] },
  { id: 6, answer: 'META', start: [0, 7], end: [3, 7] },
  { id: 7, answer: 'JOBS', start: [6, 8], end: [6, 11] },
  { id: 8, answer: 'MICROSOFT', start: [0, 9], end: [8, 9] },
]

function deriveDirection([r1, c1], [r2, c2]) {
  if (r1 === r2) return { dr: 0, dc: c2 >= c1 ? 1 : -1 }
  if (c1 === c2) return { dr: r2 >= r1 ? 1 : -1, dc: 0 }
  return { dr: 0, dc: 1 }
}

function expandEntries(entries) {
  const out = []
  for (const e of entries) {
    const { id, answer, start, end } = e
    const [sr, sc] = start
    const { dr, dc } = deriveDirection(start, end)
    const cells = []
    for (let i = 0; i < answer.length; i++) {
      const r = sr + dr * i
      const c = sc + dc * i
      if (r < 0 || r >= MATRIX_ROWS || c < 0 || c >= MATRIX_COLS) break
      cells.push([r, c])
    }
    out.push({ id, answer, cells, start: [sr, sc] })
  }
  return out
}

export async function POST(request) {
  try {
    const body = await request.json()
    const grid = body?.grid || {}
    if (typeof grid !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
    }

    const expanded = expandEntries(ENTRIES)
    // Build expected solution map and active set
    const expected = {}
    const active = new Set()
    for (const e of expanded) {
      for (let i = 0; i < e.cells.length; i++) {
        const [r, c] = e.cells[i]
        const key = `${r}-${c}`
        expected[key] = e.answer[i]
        active.add(key)
      }
    }

    // Validate all active cells are present and match
    for (const key of active) {
      const v = (grid[key] || '').toString().toUpperCase()
      if (!v || v.length !== 1) {
        return NextResponse.json({ ok: false, error: 'Puzzle not fully filled' }, { status: 400 })
      }
      if (v !== expected[key]) {
        return NextResponse.json({ ok: false, error: 'Incorrect solution' }, { status: 400 })
      }
    }

    // All good: set unlock cookie
    const res = NextResponse.json({ ok: true })
    res.cookies.set('page-unlocked', '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
    return res
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }
}
