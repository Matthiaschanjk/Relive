# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server (default port 5173, auto-increments if busy)
npm run build      # production build
npm run preview    # serve production build locally
npm run lint       # ESLint

npx playwright test                        # run all Playwright tests
npx playwright test tests/login.spec.js   # run a single test file
npx playwright test --headed              # run with browser visible (default is headless:false already)
```

**Note:** If port 5173 is already in use, Vite picks the next free port (e.g. 5174). The Playwright config `baseURL` may need to match — check `playwright.config.js`.

## Required environment variables

Create `.env.local` in the project root with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_CLIENT_ID=...
```

Edge function `generate-summary` also requires `GEMINI_API_KEY` set as a Supabase secret (not in `.env.local`).

## Architecture

### Provider hierarchy

```
GoogleOAuthProvider (VITE_GOOGLE_CLIENT_ID)
  └─ AuthProvider          ← maps Supabase session → { user, loading, signOut }
       └─ BrowserRouter
            └─ App         ← declares all routes
```

### Auth flows

Two flows only. The client never writes the `users` table — a `SECURITY DEFINER` trigger on `auth.users` (migration `0005_user_sync_trigger.sql`) upserts `public.users` on user creation/metadata change.

**Google OAuth** (`login.jsx`)
- On mount, a SHA-256 nonce pair (raw + hashed) is generated via `crypto.subtle`
- `GoogleLogin` iframe is only rendered once `nonce.hashed` is ready (grey skeleton shows before)
- On credential response: `supabase.auth.signInWithIdToken({ provider:'google', token, nonce: nonce.raw })`

**Email OTP** (`login.jsx`) — same flow for new and returning users
1. `emailLogin()` calls `supabase.auth.signInWithOtp({ email, options: { data: { name } } })` → 6-digit code emailed
2. OTP entry screen shown (60 s resend cooldown)
3. `verifyCode()` calls `supabase.auth.verifyOtp({ email, token, type: 'email' })`
4. `SIGNED_IN` fires in `AuthContext` → `login.jsx` redirects to `/home`

**Do not reintroduce a "silent sign-in" / `generateLink` flow.** The old `email-auth` edge function handed a valid sign-in `tokenHash` to any unauthenticated caller who knew a user's email — an account-takeover hole. It was removed deliberately.

Email delivery uses custom SMTP (Resend) configured in the Supabase dashboard — the built-in email service is capped (~2/hour) and gets suspended on bounces.

### School verification

The email-domain → school mapping exists in two deliberately synced places:
- `src/schoolVerify.js` — `getSchoolVerification(email)`, used client-side for display (`AuthContext.buildUser`)
- `public.school_for_email()` in `supabase/migrations/0005_user_sync_trigger.sql` — the source of truth that writes `verified`/`school` to `public.users`

When adding a domain, update both.

### Route protection

`ProtectedRoute` wraps all routes except `/login` and `/register`. It returns `null` while `loading` (prevents flash-redirect on cold load), then redirects to `/login` if no user.

The `/register` route renders the same `Login` component (registration happens inline via OTP for new emails).

### Edge functions (`supabase/functions/`)

- **`generate-summary`** — calls Gemini 2.0 Flash (`GEMINI_API_KEY` secret), requires a valid JWT in the `Authorization` header, generates 2–4 sentence course advice from the 10 most recent reviews

### Playwright testing

The `dismissIntro` helper in `tests/login.spec.js` uses `page.keyboard.press('Space')` — the intro overlay only dismisses on `keydown`/`wheel`/`touchmove`, not on click/tap.

OTP-flow tests mock the `/auth/v1/otp` + `/auth/v1/verify` endpoints via `page.route` (see `mockOtpFlow` and `fakeSession` in `tests/login.spec.js`). **Never let tests trigger real OTP sends to fake addresses** — the sends hard-bounce, and accumulated bounces get the project's email service suspended (every send then returns 500 "Error sending confirmation email", which takes down email login entirely). `schoolVerify` is unit-tested by importing the real module into the Node-side test file.
