import { useEffect, useState } from 'react'
import { pushSupported, pushConfigured, getReminderPrefs, enableReminders } from '../lib/push'
import Icon from './Icon'

const DECIDED_KEY = 'habitracker-reminder-decided'
const BLOCKED_DISMISS = 'habitracker-blocked-dismissed' // per session

// After login, nudge the user about reminders based on the current permission:
//  - 'default' / 'granted' but off  -> opt-in modal (pick a time, enable)
//  - 'denied' (blocked)             -> instructions to unblock (browser won't re-prompt)
export default function ReminderPrompt({ stats }) {
  const [mode, setMode] = useState(null) // 'optin' | 'blocked' | null
  const [time, setTime] = useState('20:00')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!pushSupported() || !pushConfigured()) return
    const perm = Notification.permission
    const prefs = getReminderPrefs()
    if (prefs.enabled && perm === 'granted') return

    let t
    if (perm === 'denied') {
      if (sessionStorage.getItem(BLOCKED_DISMISS)) return
      t = setTimeout(() => setMode('blocked'), 800)
    } else {
      if (localStorage.getItem(DECIDED_KEY)) return
      t = setTimeout(() => setMode('optin'), 800)
    }
    return () => clearTimeout(t)
  }, [])

  if (!mode) return null

  function closeOptin() {
    localStorage.setItem(DECIDED_KEY, '1')
    setMode(null)
  }
  function closeBlocked() {
    sessionStorage.setItem(BLOCKED_DISMISS, '1')
    setMode(null)
  }

  async function enable() {
    setBusy(true)
    setMsg('')
    const [hour, minute] = time.split(':').map(Number)
    try {
      await enableReminders({ hour, minute }, stats)
      localStorage.setItem(DECIDED_KEY, '1')
      setMode(null)
    } catch (e) {
      if (String(e?.message) === 'PERMISSION_DENIED') {
        setMode('blocked') // they blocked it in the popup — show how to fix
      } else {
        setMsg('Something went wrong. You can try again in Settings.')
      }
    } finally {
      setBusy(false)
    }
  }

  const Shell = ({ children }) => (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-margin-mobile bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-container-lowest dark:bg-dark-surface-container rounded-[2rem] card-shadow p-xl pop-in">
        {children}
      </div>
    </div>
  )

  if (mode === 'blocked') {
    return (
      <Shell>
        <div className="w-14 h-14 rounded-2xl bg-error-container flex items-center justify-center mb-lg">
          <Icon name="notifications_off" filled className="text-error text-3xl" />
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface mb-sm">
          Notifications are blocked
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
          Your browser is blocking notifications for this site, so we can't turn on reminders. Here's
          how to allow them:
        </p>
        <ol className="space-y-sm mb-xl">
          {[
            'Click the icon just left of the web address (a lock or sliders icon).',
            'Open Site settings, find Notifications, and switch it to Allow.',
            'Reload the page, then turn on reminders in Settings.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-sm font-body-md text-body-md text-on-surface dark:text-dark-on-surface">
              <span className="flex-none w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
        <button
          onClick={closeBlocked}
          className="tap w-full py-3 rounded-xl font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 transition-opacity"
        >
          Got it
        </button>
      </Shell>
    )
  }

  // optin
  return (
    <Shell>
      <div className="w-14 h-14 rounded-2xl bg-tertiary-container flex items-center justify-center mb-lg">
        <Icon name="notifications_active" filled className="text-on-tertiary-container text-3xl" />
      </div>
      <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface mb-sm">
        Stay on track 🔔
      </h2>
      <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
        Want a daily nudge so you never miss your streak? Pick a time that works for you.
      </p>

      <label className="flex items-center justify-between rounded-xl bg-surface-container-low dark:bg-dark-surface-high border border-surface-container-highest px-4 py-3 mb-lg">
        <span className="font-body-md text-body-md text-on-surface dark:text-dark-on-surface">
          Reminder time
        </span>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-transparent font-label-md text-label-md text-on-surface dark:text-dark-on-surface outline-none"
        />
      </label>

      {msg && <p className="mb-md font-label-sm text-label-sm text-error">{msg}</p>}

      <div className="flex gap-md">
        <button
          onClick={closeOptin}
          disabled={busy}
          className="tap flex-1 py-3 rounded-xl font-label-md text-label-md border border-surface-container-high text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-high transition-colors"
        >
          Not now
        </button>
        <button
          onClick={enable}
          disabled={busy}
          className="tap flex-1 py-3 rounded-xl font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {busy ? 'Enabling…' : 'Enable reminders'}
        </button>
      </div>
    </Shell>
  )
}
