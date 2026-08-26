import { useState } from 'react'
import { newHabit } from '../lib/store'
import { habitMeta, TONE_TILE } from '../lib/habitMeta'
import Icon from '../components/Icon'

const SUGGESTED = [
  { name: 'Morning Yoga', freq: '15 mins • Daily' },
  { name: 'Drink Water', freq: '8 glasses • Daily' },
  { name: 'Read a Book', freq: '30 mins • Daily' },
  { name: 'Quick Run', freq: '2 miles • 3x/Week' },
  { name: 'Meditate', freq: '10 mins • Daily' },
  { name: 'Sleep 8 Hours', freq: 'Daily' },
]

export default function AddHabit({ tracker, onAddHabit, onGoToTracker }) {
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const habits = tracker.habits
  const exists = (name) => habits.some((h) => h.name.toLowerCase() === name.trim().toLowerCase())

  async function add(name) {
    const clean = name.trim()
    if (!clean || exists(clean) || busy) return
    setBusy(true)
    setError('')
    try {
      await onAddHabit(newHabit(clean))
    } catch (e) {
      console.error(e)
      setError('Could not add the habit. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function addCustom() {
    const name = custom.trim()
    if (!name) return
    if (exists(name)) {
      setError('That habit is already in your routine.')
      return
    }
    await add(name)
    setCustom('')
  }

  return (
    <div>
      <div className="mb-xl">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface dark:text-dark-on-surface mb-xs">
          Build Your Routine
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">You're building a better you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md items-start">
        {/* Left: create + suggestions */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Create custom habit */}
          <div className="rounded-2xl p-lg card-shadow bg-surface-container-lowest dark:bg-dark-surface-container">
            <label className="block font-label-md text-label-md text-on-surface dark:text-dark-on-surface mb-sm">
              Create Custom Habit
            </label>
            <div className="flex items-center gap-md">
              <div className="flex-1 flex items-center gap-sm rounded-xl bg-surface-container-low dark:bg-dark-surface-high border border-surface-container-highest px-3">
                <Icon name="edit_note" className="text-on-surface-variant" />
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                  placeholder="e.g., Read for 30 mins"
                  className="flex-1 bg-transparent py-3 outline-none font-body-md text-body-md text-on-surface dark:text-dark-on-surface placeholder:text-on-surface-variant"
                />
              </div>
              <button
                onClick={addCustom}
                disabled={busy || !custom.trim()}
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {error && <p className="mt-sm font-label-sm text-label-sm text-error">{error}</p>}
          </div>

          {/* Suggested habits */}
          <div>
            <h2 className="flex items-center gap-sm font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface mb-lg">
              <Icon name="lightbulb" filled className="text-tertiary" />
              Suggested Habits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              {SUGGESTED.map((s) => {
                const m = habitMeta(s.name)
                const added = exists(s.name)
                return (
                  <div
                    key={s.name}
                    className="relative overflow-hidden rounded-2xl p-md card-shadow bg-surface-container-lowest dark:bg-dark-surface-container"
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-md ${TONE_TILE[m.tone]}`}>
                      <Icon name={m.icon} filled />
                    </div>
                    <div className="font-body-lg text-body-lg text-on-surface dark:text-dark-on-surface">
                      {s.name}
                    </div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">{s.freq}</div>
                    <button
                      onClick={() => add(s.name)}
                      disabled={added || busy}
                      aria-label={added ? 'Already added' : `Add ${s.name}`}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        added
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high dark:bg-dark-surface-high text-on-surface-variant hover:bg-primary hover:text-on-primary'
                      }`}
                    >
                      <Icon name={added ? 'check' : 'add'} filled={added} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: your routine */}
        <div className="rounded-2xl p-lg bg-surface-container-low dark:bg-dark-surface border border-surface-container-high">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface">
              Your Routine
            </h2>
            <span className="bg-primary-container/40 text-on-primary-container font-label-sm text-label-sm px-3 py-1 rounded-full">
              {habits.length} Added
            </span>
          </div>

          <div className="space-y-sm mb-lg">
            {habits.map((h) => {
              const m = habitMeta(h.name)
              const barColor =
                m.tone === 'primary' ? 'bg-primary' : m.tone === 'secondary' ? 'bg-secondary' : 'bg-tertiary'
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-md rounded-xl bg-surface-container-lowest dark:bg-dark-surface-container p-md"
                >
                  <span className={`w-1.5 h-9 rounded-full flex-none ${barColor}`} />
                  <div className="min-w-0">
                    <div className="font-body-md text-body-md text-on-surface dark:text-dark-on-surface truncate">
                      {h.name}
                    </div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">Daily</div>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={onGoToTracker}
            className="w-full bg-primary text-on-primary font-label-md text-label-md rounded-xl py-4 flex items-center justify-center gap-sm hover:opacity-90 transition-opacity"
          >
            Go to Tracker <Icon name="arrow_forward" className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  )
}
