"use client";

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

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
        <Image src="/padlock.svg" width={56} height={56} className="padlock" alt="Locked" />
  <h1 className="title">TRESPASS CHECKING!</h1>
  <p className="subtitle">This page unlocks only after solving the crossword. Return to the puzzle and complete it to proceed.</p>

        <form onSubmit={handleSubmit} className="form">
          <a href="/" className="submit">Go to Puzzle</a>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </div>
      <div className="vignette" />
    </div>
  )
}
