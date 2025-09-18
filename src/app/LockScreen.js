"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LockScreen() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unlocked, setUnlocked] = useState(false)

  // Restore unlocked state from localStorage so a refresh doesn't relock immediately.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hunt_unlocked')
      if (saved === '1') setUnlocked(true)
    } catch {}
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const cleaned = (password || '').trim()
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: cleaned }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || 'Invalid password')
        return
      }
  // On success, dismiss the overlay and persist for this session in localStorage
  setUnlocked(true)
  try { localStorage.setItem('hunt_unlocked', '1') } catch {}
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (unlocked) return null

  return (
    <div className="lockscreen overlay">
      <div className="glass-card">
  <Image src="/padlock.svg" width={56} height={56} className="padlock" alt="Locked" />
        <h1 className="title">THE HUNT BEGINS</h1>
        <p className="subtitle">Solve to discover what awaits you at the end</p>

        <div className="challenge">
          <span className="hint-label">Your first challenge:</span>
          <div className="hint-text">
            In PIE what does the letter &quot;I&quot; stand for?
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="password" className="sr-only">Password</label>
          <div className="password-wrapper">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setError(''); setPassword(e.target.value) }}
              placeholder="********"
              className="password-input"
              autoFocus
            />
          </div>
          <button className="submit" disabled={loading}>
            {loading ? 'Checking…' : 'Submit your answer'}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </div>
      <div className="vignette" />
    </div>
  )
}
