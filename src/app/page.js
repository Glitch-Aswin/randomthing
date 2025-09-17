"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import LockScreen from './LockScreen';
import CrosswordPuzzle from './CrosswordPuzzle';

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleComplete = () => {
    setShowPassword(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/page-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Invalid password');
      }
      router.push('/success');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-site">
      <header className="hero">
        <h1>Welcome, Seeker</h1>
        <p>You solved the first clue. The hunt continues…</p>
      </header>
      <section className="content">
        <p>
          Complete the crossword puzzle below to unlock the next stage of the hunt.
        </p>

        <CrosswordPuzzle onComplete={handleComplete} />

        {showPassword && (
          <div className="mt-6 max-w-md p-4 rounded-lg border shadow-sm bg-white">
            <h3 className="font-semibold text-lg mb-2">Enter the password to proceed</h3>
            <form onSubmit={submitPassword} className="flex gap-2 items-start">
              <input
                ref={inputRef}
                type="password"
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded bg-orange-600 text-black font-medium disabled:opacity-60"
              >
                {loading ? 'Checking…' : 'Submit'}
              </button>
            </form>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">Your answer is verified on the server.</p>
          </div>
        )}
      </section>
      {/* Lock overlay sits above the site until correct answer is entered; refresh brings it back */}
      <LockScreen />
    </div>
  )
}
