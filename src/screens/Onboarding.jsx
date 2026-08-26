import { useState } from 'react'
import { confirmTracker, newHabit } from '../lib/store'
import { habitMeta, TONE_TILE } from '../lib/habitMeta'
import Icon from '../components/Icon'

const SUGGESTED = ['Drink Water', 'Meditate', 'Read 10 Pages', 'Morning Walk', 'Sleep 8 Hours']

function ProgressBar({ filled }) {
  return (
    <div className="flex gap-sm mb-xl">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < filled ? 'bg-primary' : 'bg-surface-container-highest'}`}
        />
      ))}
    </div>
  )
}

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(1)
  const [durationDays, setDurationDays] = useState(100)
  const [selected, setSelected] = useState([]) // [{id, name}]
  const [custom, setCustom] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isSelected = (name) => selected.some((h) => h.name.toLowerCase() === name.toLowerCase())
  function toggleSuggested(name) {
    setSelected((s) =>
      isSelected(name) ? s.filter((h) => h.name.toLowerCase() !== name.toLowerCase()) : [...s, newHabit(name)]
    )
  }
  function addCustom() {
    const name = custom.trim()
    if (!name || isSelected(name)) {
      setCustom('')
      return
    }
    setSelected((s) => [...s, newHabit(name)])
    setCustom('')
  }

  async function handleConfirm() {
    setSaving(true)
    setError('')
    try {
      const tracker = await confirmTracker({ durationDays: Number(durationDays), habits: selected })
      onDone(tracker)
    } catch (e) {
      console.error(e)
      setError('Could not save. Check your connection and try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full flex items-start sm:items-center justify-center bg-background p-margin-mobile sm:py-10">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-[2rem] card-shadow p-xl sm:p-10">
        {/* Step 1 — Goal */}
        {step === 1 && (
          <>
            <ProgressBar filled={2} />
            <h1 className="font-headline-lg text-headline-lg text-on-surface text-center mb-md">
              How long is your journey?
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mb-xl max-w-md mx-auto">
              Setting a specific timeframe helps build consistency. Whether it's 30 days to form a
              habit or 100 for a lifestyle shift, commitment is key.
            </p>

            <div className="mx-auto w-56 rounded-2xl border border-surface-container-highest bg-surface-container-low px-lg py-lg flex items-baseline justify-center gap-sm mb-md">
              <input
                type="number"
                min="1"
                max="1000"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-32 bg-transparent text-center font-headline-xl text-[56px] leading-none font-bold text-on-surface outline-none"
              />
              <span className="font-body-md text-body-md text-on-surface-variant">days</span>
            </div>

            <div className="flex justify-center gap-sm mb-xl">
              {[30, 60, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => setDurationDays(n)}
                  className={`px-4 py-2 rounded-full font-label-md text-label-md transition-colors ${
                    Number(durationDays) === n
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  {n} Days
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!(Number(durationDays) >= 1 && Number(durationDays) <= 1000)}
              className="w-full bg-primary text-on-primary font-label-md text-label-md rounded-xl py-4 flex items-center justify-center gap-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Continue <Icon name="arrow_forward" className="text-xl" />
            </button>
          </>
        )}

        {/* Step 2 — Habits */}
        {step === 2 && (
          <>
            <ProgressBar filled={3} />
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-md">
              Choose your first habits
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
              Select a few common goals to get started, or create your own. We'll keep it simple at
              first.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-md mb-xl">
              {SUGGESTED.map((name) => {
                const m = habitMeta(name)
                const on = isSelected(name)
                return (
                  <button
                    key={name}
                    onClick={() => toggleSuggested(name)}
                    className={`relative text-left rounded-2xl p-md border-2 transition-all ${
                      on
                        ? 'bg-primary-container/20 border-primary'
                        : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                    }`}
                  >
                    {on && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center">
                        <Icon name="check" filled className="text-sm" />
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-md ${on ? 'bg-primary text-on-primary' : TONE_TILE[m.tone]}`}>
                      <Icon name={m.icon} filled={on} className="text-xl" />
                    </div>
                    <div className={`font-label-md text-label-md ${on ? 'text-on-primary-container' : 'text-on-surface'}`}>
                      {name}
                    </div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">Daily</div>
                  </button>
                )
              })}
            </div>

            <label className="block font-label-md text-label-md text-on-surface mb-sm">
              Create a custom habit
            </label>
            <div className="flex items-center gap-sm rounded-xl bg-surface-container-low border border-surface-container-highest p-1.5 mb-xl">
              <input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                placeholder="e.g. Practice Spanish"
                className="flex-1 bg-transparent px-3 py-2 outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant"
              />
              <button
                onClick={addCustom}
                className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:opacity-90"
              >
                <Icon name="add" className="text-xl" />
              </button>
            </div>

            {/* Custom habits chips */}
            {selected.filter((h) => !SUGGESTED.some((s) => s.toLowerCase() === h.name.toLowerCase()))
              .length > 0 && (
              <div className="flex flex-wrap gap-sm mb-lg">
                {selected
                  .filter((h) => !SUGGESTED.some((s) => s.toLowerCase() === h.name.toLowerCase()))
                  .map((h) => (
                    <span
                      key={h.id}
                      className="inline-flex items-center gap-1 bg-primary-container/20 text-on-primary-container rounded-full pl-3 pr-1.5 py-1 font-label-sm text-label-sm"
                    >
                      {h.name}
                      <button
                        onClick={() => setSelected((s) => s.filter((x) => x.id !== h.id))}
                        className="w-5 h-5 rounded-full hover:bg-primary/20 flex items-center justify-center"
                      >
                        <Icon name="close" className="text-sm" />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            <div className="border-t border-surface-container-high pt-lg flex items-center justify-between mb-xl">
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                  Your selection
                </div>
                <div className="font-headline-md text-headline-md text-on-surface">
                  {selected.length} {selected.length === 1 ? 'Habit' : 'Habits'}
                </div>
              </div>
              <div className="flex -space-x-2">
                {selected.slice(0, 4).map((h) => {
                  const m = habitMeta(h.name)
                  return (
                    <span
                      key={h.id}
                      className={`w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-surface-container-lowest ${TONE_TILE[m.tone]}`}
                    >
                      <Icon name={m.icon} filled className="text-base" />
                    </span>
                  )
                })}
              </div>
            </div>

            {error && (
              <p className="mb-md text-error font-label-md text-label-md bg-error-container rounded-xl p-md">
                {error}
              </p>
            )}

            <div className="flex items-center gap-md">
              <button
                onClick={() => setStep(1)}
                disabled={saving}
                className="px-5 py-4 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving || selected.length === 0}
                className="flex-1 bg-primary text-on-primary font-label-md text-label-md rounded-full py-4 flex items-center justify-center gap-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Starting…' : 'Start My Journey'} <Icon name="arrow_forward" className="text-xl" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
