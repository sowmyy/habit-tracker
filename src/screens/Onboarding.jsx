import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { confirmTracker, newHabit } from '../lib/store'

// Three-step onboarding: duration -> habits -> confirm (locks the tracker).
export default function Onboarding({ onDone }) {
  const { logout } = useAuth()
  const [step, setStep] = useState(1)
  const [durationDays, setDurationDays] = useState(100)
  const [habits, setHabits] = useState([newHabit('')])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const validHabits = habits.filter((h) => h.name.trim().length > 0)

  function updateHabit(id, name) {
    setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, name } : h)))
  }
  function addHabit() {
    setHabits((hs) => [...hs, newHabit('')])
  }
  function removeHabit(id) {
    setHabits((hs) => (hs.length > 1 ? hs.filter((h) => h.id !== id) : hs))
  }

  async function handleConfirm() {
    setSaving(true)
    setError('')
    try {
      const tracker = await confirmTracker({
        durationDays: Number(durationDays),
        habits: validHabits,
      })
      onDone(tracker)
    } catch (e) {
      console.error(e)
      setError('Could not save. Check your connection and try again.')
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="row spread">
        <h1>Set up your tracker</h1>
        <button className="ghost" onClick={logout}>Sign out</button>
      </div>
      <p className="muted">Step {step} of 3</p>

      {step === 1 && (
        <div className="card stack">
          <h2>How many days do you want to track?</h2>
          <p className="muted">Pick a challenge length. 100 days is a great goal.</p>
          <input
            type="number"
            min="1"
            max="1000"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
          />
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {[21, 30, 66, 100].map((n) => (
              <button key={n} className="ghost" onClick={() => setDurationDays(n)}>
                {n} days
              </button>
            ))}
          </div>
          <div className="row spread">
            <span />
            <button
              onClick={() => setStep(2)}
              disabled={!(Number(durationDays) >= 1 && Number(durationDays) <= 1000)}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card stack">
          <h2>Which habits do you want to track?</h2>
          <p className="muted">Add one habit per line.</p>
          {habits.map((h, i) => (
            <div className="row" key={h.id}>
              <input
                type="text"
                placeholder={`Habit ${i + 1} (e.g. Drink water)`}
                value={h.name}
                onChange={(e) => updateHabit(h.id, e.target.value)}
              />
              <button
                className="ghost"
                onClick={() => removeHabit(h.id)}
                disabled={habits.length === 1}
                aria-label="Remove habit"
              >
                ✕
              </button>
            </div>
          ))}
          <button className="ghost" onClick={addHabit}>+ Add habit</button>
          <div className="row spread">
            <button className="ghost" onClick={() => setStep(1)}>← Back</button>
            <button onClick={() => setStep(3)} disabled={validHabits.length === 0}>
              Review →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card stack">
          <h2>Confirm your plan</h2>
          <p className="muted">
            Once you confirm, your habit list is locked for the {durationDays}-day period.
          </p>
          <div className="card" style={{ background: 'var(--bg)' }}>
            <p><strong>Duration:</strong> {durationDays} days</p>
            <p><strong>Habits ({validHabits.length}):</strong></p>
            <ul>
              {validHabits.map((h) => (
                <li key={h.id}>{h.name}</li>
              ))}
            </ul>
          </div>
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <div className="row spread">
            <button className="ghost" onClick={() => setStep(2)} disabled={saving}>
              ← Back
            </button>
            <button onClick={handleConfirm} disabled={saving}>
              {saving ? 'Saving…' : '✅ Confirm & Start'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
