# Habit Tracker (PWA)

A personalized habit tracker: sign in with Google, pick a challenge length, lock in a
habit list, tick habits off daily, and watch your progress on a dashboard
(streaks, completion %, calendar heatmap, motivation). Installable as a PWA.

**Lightweight by design — no database, no backend.** Each user's data lives in a
Google Sheet the app creates in *their own* Google Drive.

**Stack:** React + Vite · Google Identity Services (OAuth) · Google Sheets + Drive
REST APIs · `vite-plugin-pwa`

---

## How storage works

On first sign-in the app creates a spreadsheet called **"Habit Tracker Data"** in your
Drive and uses it as your database:

- **Config** tab — duration, start date, confirmed flag
- **Habits** tab — your locked habit list (id, name)
- **Log** tab — one row per day, one column per habit, a `1` for each completed habit

Streaks and percentages are **computed on the fly** from the Log — they aren't stored.
You can open the sheet in Google Sheets anytime, or export it to Excel.

The app uses the **`drive.file`** scope, which is *non-sensitive*: it can only see the
files it creates, and it never touches the rest of your Drive.

---

## 1. One-time Google Cloud setup (you do this once)

You need an OAuth client ID and two APIs enabled.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → create a
   project (e.g. `habit-tracker`).
2. **Enable APIs:** APIs & Services → **Library** → enable **Google Sheets API** and
   **Google Drive API**.
3. **OAuth consent screen:** APIs & Services → **OAuth consent screen**
   - User type: **External** → Create
   - Fill app name, your support email, developer email → Save
   - **Scopes:** add `.../auth/drive.file`, `openid`, `email`, `profile`
     (all non-sensitive — no verification review needed)
   - **Publishing status:** click **Publish app** → **Production**. With only
     non-sensitive scopes, anyone can sign in and there's **no "unverified app"
     warning**. (While in *Testing* you'd be limited to accounts added under
     "Test users".)
4. **Create the client ID:** APIs & Services → **Credentials** → **Create credentials**
   → **OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins:** add every origin you'll run from, e.g.
     - `http://localhost:5173` (local dev)
     - your deployed URL, e.g. `https://your-app.netlify.app`
   - Create → copy the **Client ID** (looks like `xxxx.apps.googleusercontent.com`)
5. Put it in `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   ```

   > The client ID is **not a secret** — it's meant to be embedded in the web app.

## 2. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173, click **Continue with Google**, grant access. On first use
the app creates your sheet and walks you through onboarding.

## 3. Tests

```bash
npm test
```

Unit tests cover the pure analysis functions in `src/lib/stats.js`.

## 4. Deploy to free hosting

This is a static site (`npm run build` → `dist/`). Any static host works — Netlify,
Vercel, GitHub Pages, Cloudflare Pages, Firebase Hosting.

1. `npm run build`
2. Deploy the `dist/` folder to your host.
3. Add the deployed URL to **Authorized JavaScript origins** in the OAuth client
   (step 1.4) — the app won't sign in from an origin that isn't listed.
4. Make sure the host serves `index.html` for unknown routes (SPA fallback). Most
   hosts do this automatically; on Netlify add a `public/_redirects` with
   `/*  /index.html  200` if needed.

---

## Project layout

```
src/
  context/AuthContext.jsx  auth state (Google Identity Services)
  App.jsx                  auth gate + onboarding gate + data loading
  screens/                 LoginScreen, Onboarding, DailyPortal, Dashboard
  components/              AppShell, StatBar, Heatmap
  lib/
    googleApi.js           GIS token flow + authenticated fetch
    store.js               Google Sheets storage (find/create sheet, load, toggle)
    dates.js               date-key helpers
    stats.js               streaks, completion %, heatmap (pure, tested)
    motivation.js          contextual message selection (pure)
```

## Notes / v1 scope

- Habits are **locked** once you confirm the tracker (by design).
- Habits are simple done/not-done checkboxes.
- "Today" uses the device's local date.
- Because the browser OAuth token is short-lived and only granted on a click, you
  sign in each time you open the app (the token lasts ~1 hour per session).
- Not yet included: numeric-count habits, editing habits mid-period, push reminders.
