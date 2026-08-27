import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isDark, setDark } from '../lib/theme'
import {
  pushSupported,
  pushConfigured,
  getReminderPrefs,
  enableReminders,
  disableReminders,
  updateReminderTime,
  sendTestNotification,
} from '../lib/push'
import Icon from '../components/Icon'

function fmtTime(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function Settings({ onResetGoal, onLogout, stats }) {
  const { user } = useAuth()
  const [dark, setDarkState] = useState(isDark())
  const [showReset, setShowReset] = useState(false)

  function toggleDark() {
    const next = !dark
    setDark(next)
    setDarkState(next)
  }

  return (
    <div>
      <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface dark:text-dark-on-surface mb-xl">
        Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md items-start">
        {/* Profile */}
        <div className="rounded-2xl p-lg card-shadow bg-surface-container-lowest dark:bg-dark-surface-container">
          <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface pb-md mb-lg border-b border-surface-container-high">
            Profile
          </h2>
          <div className="flex items-center gap-lg mb-lg">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <span className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md">
                {(user?.displayName || 'U').charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <div className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface">
                {user?.displayName || 'Your name'}
              </div>
              <div className="font-body-md text-body-md text-on-surface-variant">Mindful Explorer</div>
            </div>
          </div>

          <Field label="Full Name" value={user?.displayName || ''} />
          <Field label="Email Address" value={user?.email || ''} />
          <p className="mt-sm font-label-sm text-label-sm text-on-surface-variant">
            Your name and email come from your Google account.
          </p>
        </div>

        {/* App Preferences */}
        <div className="rounded-2xl p-lg card-shadow bg-surface-container-lowest dark:bg-dark-surface-container">
          <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface pb-md mb-lg border-b border-surface-container-high">
            App Preferences
          </h2>

          <div className="flex items-center justify-between py-md">
            <div className="flex items-center gap-md">
              <Icon name="dark_mode" className="text-on-surface-variant text-2xl" />
              <div>
                <div className="font-body-md text-body-md text-on-surface dark:text-dark-on-surface">
                  Dark Mode
                </div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">
                  Toggle dark appearance
                </div>
              </div>
            </div>
            <button
              onClick={toggleDark}
              role="switch"
              aria-checked={dark}
              className={`w-14 h-8 rounded-full p-1 transition-colors flex ${
                dark ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center">
                {dark && <Icon name="check" filled className="text-primary text-sm" />}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between py-md">
            <div className="flex items-center gap-md">
              <Icon name="language" className="text-on-surface-variant text-2xl" />
              <div className="font-body-md text-body-md text-on-surface dark:text-dark-on-surface">
                Language
              </div>
            </div>
            <span className="bg-surface-container-low dark:bg-dark-surface-high text-on-surface dark:text-dark-on-surface font-label-md text-label-md px-4 py-2 rounded-lg">
              English
            </span>
          </div>
        </div>

        {/* Reminders */}
        <div className="rounded-2xl p-lg card-shadow bg-surface-container-lowest dark:bg-dark-surface-container">
          <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface pb-md mb-lg border-b border-surface-container-high">
            Reminders
          </h2>
          <ReminderControls stats={stats} />
        </div>

        {/* Account */}
        <div className="rounded-2xl p-lg card-shadow bg-surface-container-lowest dark:bg-dark-surface-container">
          <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface pb-md mb-lg border-b border-surface-container-high">
            Account
          </h2>

          <button
            onClick={() => setShowReset(true)}
            className="w-full flex items-center justify-between rounded-xl bg-error-container/40 p-md mb-md hover:bg-error-container/60 transition-colors"
          >
            <span className="flex items-center gap-md">
              <Icon name="restart_alt" filled className="text-error text-2xl" />
              <span className="font-body-md text-body-md text-on-surface dark:text-dark-on-surface">
                Reset your Goal
              </span>
            </span>
            <Icon name="chevron_right" className="text-on-surface-variant" />
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-md rounded-xl border border-surface-container-high p-md hover:bg-surface-container-high dark:hover:bg-dark-surface-high transition-colors"
          >
            <Icon name="logout" className="text-on-surface-variant text-2xl" />
            <span className="font-body-md text-body-md text-on-surface dark:text-dark-on-surface">
              Sign Out
            </span>
          </button>
        </div>
      </div>

      {showReset && (
        <ResetModal onCancel={() => setShowReset(false)} onConfirm={onResetGoal} />
      )}
    </div>
  )
}

function ResetModal({ onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-margin-mobile bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface-container-lowest dark:bg-dark-surface-container rounded-[2rem] card-shadow p-xl"
      >
        <div className="w-14 h-14 rounded-2xl bg-error-container flex items-center justify-center mb-lg">
          <Icon name="restart_alt" filled className="text-error text-3xl" />
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface mb-sm">
          Reset your goal?
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
          This starts a brand-new journey. It will permanently:
        </p>
        <ul className="space-y-sm mb-lg">
          {[
            'Erase your current habit list',
            'Delete all your daily check-ins and streaks',
            'Reset the day count and start date',
          ].map((t) => (
            <li key={t} className="flex items-start gap-sm font-body-md text-body-md text-on-surface dark:text-dark-on-surface">
              <Icon name="cancel" filled className="text-error text-xl mt-0.5 flex-none" />
              {t}
            </li>
          ))}
        </ul>
        <p className="font-label-md text-label-md text-on-surface-variant mb-xl">
          This can't be undone. Your habit sheet in Google Drive will be overwritten.
        </p>
        <div className="flex gap-md">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-label-md text-label-md border border-surface-container-high text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-label-md text-label-md bg-error text-on-error hover:opacity-90 transition-opacity"
          >
            Reset Goal
          </button>
        </div>
      </div>
    </div>
  )
}

function ReminderControls({ stats }) {
  const [prefs, setPrefs] = useState(getReminderPrefs())
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!pushSupported()) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant">
        Notifications aren't supported on this browser. On iPhone, add the app to your Home Screen
        first (Share → Add to Home Screen), then enable reminders there.
      </p>
    )
  }
  if (!pushConfigured()) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant">
        Daily reminders will be available once the notification server is connected.
      </p>
    )
  }

  async function toggle() {
    setBusy(true)
    setMsg('')
    try {
      if (prefs.enabled) {
        setPrefs(await disableReminders())
      } else {
        setPrefs(await enableReminders({ hour: prefs.hour, minute: prefs.minute }, stats))
        setMsg("You're all set — we'll nudge you daily.")
      }
    } catch (e) {
      setMsg(
        String(e?.message) === 'PERMISSION_DENIED'
          ? 'Notification permission was blocked. Enable it in your browser settings.'
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function onTimeChange(e) {
    const [h, m] = e.target.value.split(':').map(Number)
    setBusy(true)
    try {
      setPrefs(await updateReminderTime({ hour: h, minute: m }))
    } finally {
      setBusy(false)
    }
  }

  async function test() {
    setMsg('')
    try {
      await sendTestNotification()
      setMsg('Test notification sent!')
    } catch {
      setMsg('Could not send a test. Make sure reminders are on.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between py-md">
        <div className="flex items-center gap-md">
          <Icon name="notifications_active" filled className="text-tertiary text-2xl" />
          <div>
            <div className="font-body-md text-body-md text-on-surface dark:text-dark-on-surface">
              Daily reminder
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">
              A nudge to keep your streak alive
            </div>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={busy}
          role="switch"
          aria-checked={prefs.enabled}
          className={`w-14 h-8 rounded-full p-1 transition-colors flex disabled:opacity-60 ${
            prefs.enabled ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center">
            {prefs.enabled && <Icon name="check" filled className="text-primary text-sm" />}
          </span>
        </button>
      </div>

      {prefs.enabled && (
        <div className="flex items-center justify-between py-md border-t border-surface-container-high">
          <div className="flex items-center gap-md">
            <Icon name="schedule" className="text-on-surface-variant text-2xl" />
            <span className="font-body-md text-body-md text-on-surface dark:text-dark-on-surface">
              Reminder time
            </span>
          </div>
          <input
            type="time"
            value={fmtTime(prefs.hour, prefs.minute)}
            onChange={onTimeChange}
            disabled={busy}
            className="rounded-lg bg-surface-container-low dark:bg-dark-surface-high border border-surface-container-highest px-3 py-2 font-label-md text-label-md text-on-surface dark:text-dark-on-surface"
          />
        </div>
      )}

      {prefs.enabled && (
        <button
          onClick={test}
          className="mt-sm font-label-md text-label-md text-primary hover:underline"
        >
          Send a test notification
        </button>
      )}

      {msg && <p className="mt-md font-label-sm text-label-sm text-on-surface-variant">{msg}</p>}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="mb-md">
      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">{label}</label>
      <input
        value={value}
        readOnly
        className="w-full rounded-xl bg-surface-container-low dark:bg-dark-surface-high border border-surface-container-highest px-4 py-3 font-body-md text-body-md text-on-surface dark:text-dark-on-surface outline-none"
      />
    </div>
  )
}
