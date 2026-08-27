// Client-side Web Push: permission, subscription, and talking to the Worker.
const API = import.meta.env.VITE_PUSH_API || ''
const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
const PREFS_KEY = 'habitracker-reminder'

export function pushConfigured() {
  return !!API && !!VAPID_PUBLIC
}
export function pushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function getReminderPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || { enabled: false, hour: 20, minute: 0 }
  } catch {
    return { enabled: false, hour: 20, minute: 0 }
  }
}
function savePrefs(p) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(p))
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

async function getRegistration() {
  return navigator.serviceWorker.ready
}
async function getSubscription() {
  const reg = await getRegistration()
  return reg.pushManager.getSubscription()
}

const tz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

// Ask permission, subscribe, and register with the server. Returns the new prefs.
export async function enableReminders({ hour, minute }, stats) {
  if (!pushConfigured()) throw new Error('Push is not configured yet.')
  if (!pushSupported()) throw new Error('Notifications are not supported on this device/browser.')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('PERMISSION_DENIED')

  const reg = await getRegistration()
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    })
  }

  const res = await fetch(`${API}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub, tz: tz(), hour, minute, stats: stats || {} }),
  })
  if (!res.ok) throw new Error('Failed to register with the reminder server.')

  const prefs = { enabled: true, hour, minute }
  savePrefs(prefs)
  return prefs
}

export async function disableReminders() {
  const prefs = getReminderPrefs()
  try {
    const sub = await getSubscription()
    if (sub) {
      await fetch(`${API}/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      await sub.unsubscribe()
    }
  } catch (e) {
    console.error(e)
  }
  const next = { ...prefs, enabled: false }
  savePrefs(next)
  return next
}

// Change the reminder time (re-uses the existing subscription).
export async function updateReminderTime({ hour, minute }) {
  const prefs = getReminderPrefs()
  const sub = await getSubscription()
  if (sub && pushConfigured()) {
    await fetch(`${API}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint, hour, minute, tz: tz() }),
    })
  }
  const next = { ...prefs, hour, minute }
  savePrefs(next)
  return next
}

// Push the latest stats to the server so the nudge stays fresh. No-op if off.
export async function pushStats(stats) {
  if (!pushConfigured()) return
  const prefs = getReminderPrefs()
  if (!prefs.enabled) return
  try {
    const sub = await getSubscription()
    if (!sub) return
    await fetch(`${API}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint, stats, tz: tz() }),
    })
  } catch (e) {
    console.error('pushStats failed', e)
  }
}

// Ask the server to send a notification right now (to verify setup).
export async function sendTestNotification() {
  const sub = await getSubscription()
  if (!sub) throw new Error('Not subscribed yet.')
  const res = await fetch(`${API}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  })
  if (!res.ok) throw new Error('Test failed.')
}
