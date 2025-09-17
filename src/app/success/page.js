import { cookies } from 'next/headers'
import Image from 'next/image'
import SuccessLock from './SuccessLock'

export default async function SuccessPage() {
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('page-unlocked')?.value === '1'

  return (
    <main className="min-h-screen flex items-center justify-center relative bg-black text-white px-4">
      {!unlocked ? (
        <div className="absolute inset-0 z-20">
          <SuccessLock />
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto text-center z-10 space-y-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-400">u made it</h1>
          <p className="text-sm sm:text-base text-white/80">Congrats! You cracked the password.</p>
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
        </div>
      )}
    </main>
  );
}
