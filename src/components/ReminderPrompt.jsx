import { useEffect, useState } from 'react'
import { pushSupported, pushConfigured, enableReminders } from '../lib/push'
import Icon from './Icon'

const DECIDED_KEY = 'habitracker-reminder-decided'

// Shown once, after a user first lands in the app, to offer daily reminders.
export default function ReminderPrompt({ stats, onOpenSettings }) {
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState('20:00')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!pushSupported() || !pushConfigured()) return
    if (localStorage.getItem(DECIDED_KEY)) return
    const t = setTimeout(() => setOpen(true), 800)
    return () => clearTimeout(t)
  }, [])

  if (!open) return null

  function dismiss() {
    localStorage.setItem(DECIDED_KEY, '1')
    setOpen(false)
  }

  async function enable() {
    setBusy(true)
    setMsg('')
    const [hour, minute] = time.split(':').map(Number)
    try {
      await enableReminders({ hour, minute }, stats)
      localStorage.setItem(DECIDED_KEY, '1')
      setOpen(false)
    } catch (e) {
      setMsg(
        String(e?.message) === 'PERMISSION_DENIED'
          ? 'Permission was blocked. You can enable it later in Settings.'
          : 'Something went wrong. You can try again in Settings.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-margin-mobile bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-container-lowest dark:bg-dark-surface-container rounded-[2rem] card-shadow p-xl pop-in">
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
            onClick={dismiss}
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
      </div>
    </div>
  )
}
