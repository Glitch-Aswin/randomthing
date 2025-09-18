"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function SuccessPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scrambled = "YOFAL"; // scrambled letters of FAYOL

  const submit = async (e) => {
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
      window.location.href = 'https://youtu.be/dQw4w9WgXcQ?si=IQH6cBlxZYnxdLG7';
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md mx-auto text-center space-y-5">
        <div className="rounded-2xl overflow-hidden border border-orange-500/30 shadow-lg mx-auto">
          <Image
            src="/image.png"
            alt="Success"
            width={1200}
            height={800}
            priority
            className="w-full h-auto object-contain"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-orange-400">Final Gate</h1>
        <p className="text-sm text-white/80">Unscramble the letters and enter the business-related name:</p>
        <div className="text-2xl tracking-widest font-bold text-orange-300">{scrambled}</div>

        <form onSubmit={submit} className="flex gap-2 items-stretch justify-center">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the password"
            className="flex-1 min-w-0 max-w-[220px] border rounded px-3 py-2 text-white"
            aria-label="Password"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-orange-600 text-black font-semibold disabled:opacity-60"
          >
            {loading ? 'Checking…' : 'Unlock'}
          </button>
        </form>
        {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
      </div>
    </main>
  );
}
