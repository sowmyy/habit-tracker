import { useState } from 'react'
import { toggleHabit } from '../lib/store'
import { todayKey, prettyDate, addDays, dayDiff } from '../lib/dates'

// Daily check-in. Defaults to today; can navigate to earlier days to edit them.
// Future days and days before the tracker start are not editable.
export default function DailyPortal({ tracker, entriesByDay, onUpdateDay }) {
  const [dayKey, setDayKey] = useState(todayKey())
  const [savingId, setSavingId] = useState(null)

  const today = todayKey()
  const endKey = addDays(tracker.startDate, tracker.durationDays - 1)
  const dayNumber = dayDiff(tracker.startDate, dayKey) + 1

  const inRange = dayKey >= tracker.startDate && dayKey <= endKey
  const isFuture = dayKey > today
  const editable = inRange && !isFuture

  const completed = entriesByDay[dayKey] || {}
  const doneCount = tracker.habits.filter((h) => completed[h.id]).length

  const canPrev = dayKey > tracker.startDate
  const canNext = dayKey < today && dayKey < endKey

  async function handleToggle(habitId) {
    if (!editable) return
    const nextDone = !completed[habitId]
    setSavingId(habitId)
    // optimistic update
    const optimistic = { ...completed }
    if (nextDone) optimistic[habitId] = true
    else delete optimistic[habitId]
    onUpdateDay(dayKey, optimistic)
    try {
      await toggleHabit(dayKey, habitId, nextDone)
    } catch (e) {
      console.error(e)
      onUpdateDay(dayKey, completed) // revert
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="page">
      <div className="date-nav">
        <button className="ghost" disabled={!canPrev} onClick={() => setDayKey(addDays(dayKey, -1))}>
          ←
        </button>
        <div style={{ textAlign: 'center' }}>
          <div className="pill">{dayKey === today ? 'Today' : prettyDate(dayKey)}</div>
          <div className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
            Day {dayNumber} of {tracker.durationDays}
          </div>
        </div>
        <button className="ghost" disabled={!canNext} onClick={() => setDayKey(addDays(dayKey, 1))}>
          →
        </button>
      </div>

      {!editable && (
        <div className="card muted">
          {isFuture
            ? "This day hasn't arrived yet — come back on the day to check off habits."
            : 'This day is outside your tracking period.'}
        </div>
      )}

      <div className="row spread" style={{ marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Your habits</h2>
        <span className="muted">{doneCount}/{tracker.habits.length} done</span>
      </div>

      {tracker.habits.map((h) => {
        const done = !!completed[h.id]
        return (
          <div
            key={h.id}
            className={`habit ${done ? 'done' : ''}`}
            onClick={() => handleToggle(h.id)}
            style={{ opacity: editable ? (savingId === h.id ? 0.6 : 1) : 0.5, cursor: editable ? 'pointer' : 'default' }}
            role="checkbox"
            aria-checked={done}
          >
            <span className="check">{done ? '✓' : ''}</span>
            <span className="name">{h.name}</span>
          </div>
        )
      })}

      {doneCount === tracker.habits.length && tracker.habits.length > 0 && editable && (
        <div className="card" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
          🎉 All done for {dayKey === today ? 'today' : 'this day'}! Great work.
        </div>
      )}
    </div>
  )
}
