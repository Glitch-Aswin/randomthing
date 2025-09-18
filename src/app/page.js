"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import LockScreen from './LockScreen';
import CrosswordPuzzle from './CrosswordPuzzle';

export default function Home() {
  const router = useRouter();
  const [pendingVerify, setPendingVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const [reveal, setReveal] = useState(false);

  const handleComplete = async (gridSnapshot) => {
    try {
      setPendingVerify(true);
      setError("");
      const res = await fetch('/api/verify-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid: gridSnapshot })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Verification failed');
      }
      router.push('/success');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setPendingVerify(false);
    }
  };

  const proceedNext = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/page-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ACCESS_KEY })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Unable to proceed');
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

        {pendingVerify && (
          <div className="mt-6 max-w-md w-full p-4 rounded-lg border shadow-sm bg-white">
            <div className="flex items-center gap-3 text-gray-800">
              <span className="inline-block h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" aria-hidden="true" />
              Verifying your solution…
            </div>
          </div>
        )}

        {!pendingVerify && error && (
          <div className="mt-4 max-w-md w-full p-3 rounded-lg border bg-white/90">
            <p className="text-red-600 text-sm" role="alert" aria-live="polite">{error}</p>
            <p className="text-xs text-gray-600 mt-1">Tip: ensure every active cell is filled with the correct letter.</p>
          </div>
        )}
      </section>
      {/* Lock overlay sits above the site until correct answer is entered; refresh brings it back */}
      <LockScreen />
    </div>
  )
}
