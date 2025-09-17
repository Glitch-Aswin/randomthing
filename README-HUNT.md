Hunt Gate - Password-locked Next.js App (JS)

How it works
- The first screen is a lock screen (server-gated). The password is validated via a server route at `src/app/api/unlock/route.js`.
- On success, the route sets an httpOnly cookie `hunt-unlocked=1`. The main page (`src/app/page.js`) checks this cookie on the server and either renders the lock screen or the main site.

Configure secret
Create `.env.local` at the project root with:

ACCESS_PASSWORD=innovation

Run locally
- Install deps (already done by create-next-app) and start dev server:
  npm run dev
- Open http://localhost:3000

Notes
- The password is not bundled in the client; it is read from `process.env.ACCESS_PASSWORD` on the server only.
- You can change the gradient, copy, and styles in `src/app/globals.css` and `src/app/LockScreen.js`.
