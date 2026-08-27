// Google Identity Services (GIS) auth + authenticated fetch helpers.
// No Firebase. We obtain an OAuth access token in the browser and call the
// Google Drive + Sheets REST APIs directly.

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file', // per-file: only files this app creates
].join(' ')

let tokenClient = null
let accessToken = null
let tokenExpiry = 0 // epoch ms

if (!CLIENT_ID) {
  console.warn(
    '[google] Missing VITE_GOOGLE_CLIENT_ID. Copy .env.local.example to .env.local and set it.'
  )
}

// Wait for the GIS script (loaded in index.html) to be ready.
function waitForGis() {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const tick = () => {
      if (window.google?.accounts?.oauth2) return resolve()
      if (Date.now() - start > 10000) return reject(new Error('Google script failed to load'))
      setTimeout(tick, 50)
    }
    tick()
  })
}

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const AUTHED_KEY = 'habitracker-authed'

// Per-request handlers, wired once into the token client.
let onToken = null
let onTokenError = null

export async function initAuth() {
  await waitForGis()
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => onToken && onToken(resp),
    error_callback: (err) => onTokenError && onTokenError(err),
  })
}

// True if this browser has completed a Google sign-in before (so we can try to
// restore the session silently on load without showing any prompt).
export function wasAuthed() {
  try {
    return localStorage.getItem(AUTHED_KEY) === '1'
  } catch {
    return false
  }
}
function markAuthed() {
  try {
    localStorage.setItem(AUTHED_KEY, '1')
  } catch {}
}

// Request an access token. prompt '' = silent (uses a hidden iframe when the
// user already has a Google session + granted consent); 'consent' shows UI.
// timeoutMs guards only the *silent* path (a hung hidden-iframe request).
// Interactive sign-in passes 0 — the user needs unbounded time to click
// through the account chooser and consent screen.
async function requestToken(prompt, timeoutMs = 0) {
  if (!tokenClient) await initAuth() // recover if init hasn't run/failed yet
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('Auth not initialized'))
    let done = false
    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
            if (done) return
            done = true
            reject(new Error('token request timed out'))
          }, timeoutMs)
        : null
    const clear = () => timer && clearTimeout(timer)
    onToken = (resp) => {
      if (done) return
      done = true
      clear()
      if (resp.error) return reject(resp)
      accessToken = resp.access_token
      tokenExpiry = Date.now() + (resp.expires_in - 60) * 1000
      resolve(resp)
    }
    onTokenError = (err) => {
      if (done) return
      done = true
      clear()
      reject(err || new Error('token request failed'))
    }
    tokenClient.requestAccessToken({ prompt })
  })
}

// Interactive sign-in. Force the consent dialog so the granular Drive
// permission is shown and can be granted, then verify it actually was.
export async function signIn() {
  const resp = await requestToken('consent')
  const granted = (resp.scope || '').split(' ')
  if (!granted.includes(DRIVE_SCOPE)) {
    signOut()
    throw new Error(
      'DRIVE_SCOPE_NOT_GRANTED: Please allow the Google Drive permission ' +
        '("see, edit, create, and delete only the specific Drive files you use with this app") when signing in.'
    )
  }
  const profile = await fetchUserInfo()
  markAuthed()
  return profile
}

// Attempt to restore a session silently on page load (no UI).
export async function trySilentSignIn() {
  try {
    await requestToken('', 8000)
    const profile = await fetchUserInfo()
    markAuthed()
    return profile
  } catch {
    return null
  }
}

export function signOut() {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {})
  }
  accessToken = null
  tokenExpiry = 0
  try {
    localStorage.removeItem(AUTHED_KEY)
  } catch {}
}

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken
  await requestToken('', 8000) // silent refresh
  return accessToken
}

async function fetchUserInfo() {
  const token = await getAccessToken()
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch user info')
  const u = await res.json()
  return { uid: u.sub, displayName: u.name, email: u.email, photoURL: u.picture }
}

// Authenticated JSON fetch against Google APIs. Retries once on 401 (expired token).
export async function apiFetch(url, { method = 'GET', body, _retried } = {}) {
  const token = await getAccessToken()
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401 && !_retried) {
    accessToken = null // force refresh
    return apiFetch(url, { method, body, _retried: true })
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google API ${res.status}: ${text}`)
  }
  return res.status === 204 ? null : res.json()
}
