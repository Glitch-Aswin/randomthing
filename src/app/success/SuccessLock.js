"use client";

import { useEffect, useRef, useState } from 'react'

export default function SuccessLock() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const cleaned = (password || '').trim()
      const res = await fetch('/api/page-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: cleaned }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || 'Invalid password')
        return
      }
      // success: reload to allow server to see the cookie and reveal content
      window.location.reload()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lockscreen overlay">
      <div className="glass-card">
        <img src="/padlock.svg" className="padlock" alt="Locked" />
        <h1 className="title">TRESPASS CHECKING!</h1>
        <p className="subtitle">Enter the secret you figured out before, just to make you are not tresspassing over this page ^_^</p>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="success-password" className="sr-only">Password</label>
          <div className="password-wrapper">
            <input
              id="success-password"
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => { setError(''); setPassword(e.target.value) }}
              placeholder="********"
              className="password-input"
              autoFocus
            />
          </div>
          <button className="submit" disabled={loading}>
            {loading ? 'Checking…' : 'Unlock'}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </div>
      <div className="vignette" />
    </div>
  )
}
