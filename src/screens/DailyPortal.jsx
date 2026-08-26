import { useMemo, useState } from 'react'
import { toggleHabit } from '../lib/store'
import { todayKey, prettyDate, addDays, dayDiff, fromDayKey } from '../lib/dates'
import { perfectDayStreak } from '../lib/stats'
import { habitMeta } from '../lib/habitMeta'
import { cardColor, CARD_DONE } from '../lib/cardColors'
import Icon from '../components/Icon'
import ProgressRing from '../components/ProgressRing'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Monday of the week containing `key`.
function mondayOf(key) {
  const dow = fromDayKey(key).getDay() // 0=Sun
  return addDays(key, -((dow + 6) % 7))
}

export default function DailyPortal({ tracker, entriesByDay, onUpdateDay }) {
  const today = todayKey()
  const [dayKey, setDayKey] = useState(today)
  const [weekStart, setWeekStart] = useState(() => mondayOf(today))
  const [savingId, setSavingId] = useState(null)

  const endKey = addDays(tracker.startDate, tracker.durationDays - 1)
  const dayNumber = dayDiff(tracker.startDate, dayKey) + 1
  const isFuture = dayKey > today
  const inRange = dayKey >= tracker.startDate && dayKey <= endKey
  const editable = inRange && !isFuture

  const habits = tracker.habits
  const completed = entriesByDay[dayKey] || {}
  const doneCount = habits.filter((h) => completed[h.id]).length
  const pct = habits.length ? (doneCount / habits.length) * 100 : 0

  const isDayComplete = (k) => {
    if (!habits.length) return false
    const c = entriesByDay[k] || {}
    return habits.every((h) => c[h.id])
  }

  const perfectStreak = useMemo(() => {
    const elapsed = []
    for (let k = tracker.startDate; k <= today && k <= endKey; k = addDays(k, 1)) elapsed.push(k)
    return perfectDayStreak(habits, entriesByDay, elapsed).current
  }, [habits, entriesByDay, tracker.startDate, endKey, today])

  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) days.push(addDays(weekStart, i))
    return days
  }, [weekStart])

  async function handleToggle(habitId) {
    if (!editable) return
    const nextDone = !completed[habitId]
    setSavingId(habitId)
    const optimistic = { ...completed }
    if (nextDone) optimistic[habitId] = true
    else delete optimistic[habitId]
    onUpdateDay(dayKey, optimistic)
    try {
      await toggleHabit(dayKey, habitId, nextDone)
    } catch (e) {
      console.error(e)
      onUpdateDay(dayKey, completed)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-lg">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface dark:text-dark-on-surface">
          Today's Focus
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Day {dayNumber} of your {tracker.durationDays} day journey.
        </p>
      </div>

      {/* Week strip */}
      <div className="flex items-center gap-sm mb-xl">
        <button
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          aria-label="Previous week"
          className="w-9 h-9 flex-none rounded-full flex items-center justify-center text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-high transition-colors"
        >
          <Icon name="chevron_left" className="text-2xl" />
        </button>

        <div className="flex-1 grid grid-cols-7 gap-1.5 sm:gap-sm">
          {weekDays.map((k) => {
            const d = fromDayKey(k)
            const selected = k === dayKey
            const complete = isDayComplete(k) && k <= today
            const future = k > today
            const outOfRange = k < tracker.startDate || k > endKey
            let cls
            if (selected) cls = 'bg-on-surface text-surface-container-lowest'
            else if (complete) cls = 'bg-[#A3E048] text-[#1A2E05]'
            else if (future || outOfRange)
              cls = 'bg-surface-container-low dark:bg-dark-surface-high text-on-surface-variant'
            else cls = 'bg-surface-container-high dark:bg-dark-surface-high text-on-surface dark:text-dark-on-surface'
            return (
              <button
                key={k}
                onClick={() => setDayKey(k)}
                className={`flex flex-col items-center justify-center rounded-2xl py-2 transition-colors ${cls}`}
              >
                <span className="font-headline-md text-headline-md leading-none">{d.getDate()}</span>
                <span className="font-label-sm text-label-sm mt-1">{WEEKDAYS[d.getDay()]}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          aria-label="Next week"
          className="w-9 h-9 flex-none rounded-full flex items-center justify-center text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-high transition-colors"
        >
          <Icon name="chevron_right" className="text-2xl" />
        </button>
      </div>

      {/* Progress summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-xl">
        <div className="sm:col-span-2 bg-surface-container-lowest dark:bg-dark-surface-container rounded-3xl p-lg card-shadow flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface mb-xs">
              {dayKey === today ? 'Today' : prettyDate(dayKey)}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {doneCount} of {habits.length} habits completed
            </p>
          </div>
          <ProgressRing percent={pct} size={72}>
            <span className="font-label-md text-label-md">{Math.round(pct)}%</span>
          </ProgressRing>
        </div>
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container rounded-3xl p-lg card-shadow flex flex-col justify-center items-center text-center">
          <Icon name="local_fire_department" filled className="text-3xl text-tertiary-container mb-xs" />
          <div className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface">
            {perfectStreak}
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant">Day Streak</div>
        </div>
      </div>

      {!editable && (
        <div className="bg-surface-container-low dark:bg-dark-surface-container rounded-2xl p-md mb-md font-label-md text-label-md text-on-surface-variant flex items-center gap-sm">
          <Icon name={isFuture ? 'lock_clock' : 'info'} className="text-xl" />
          {isFuture
            ? "This day hasn't arrived yet — come back to check off habits."
            : 'This day is outside your tracking period.'}
        </div>
      )}

      {/* Task cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
        {habits.map((h) => {
          const done = !!completed[h.id]
          const m = habitMeta(h.name)
          const c = done ? CARD_DONE : cardColor(h.id)
          return (
            <button
              key={h.id}
              onClick={() => handleToggle(h.id)}
              disabled={!editable || savingId === h.id}
              style={{ backgroundColor: c.bg, color: c.ink }}
              className={`relative text-left rounded-3xl p-5 min-h-[150px] flex flex-col justify-between transition-transform ${
                editable ? 'active:scale-[0.98] cursor-pointer' : 'cursor-default'
              } ${!editable ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between">
                <span
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: done ? '#DFE3E8' : 'rgba(255,255,255,0.35)' }}
                >
                  <Icon name={m.icon} filled className="text-2xl" />
                </span>
                {done ? (
                  <span className="w-7 h-7 rounded-full bg-on-surface text-surface-container-lowest flex items-center justify-center">
                    <Icon name="check" filled className="text-base" />
                  </span>
                ) : (
                  <span
                    className="w-7 h-7 rounded-full border-2"
                    style={{ borderColor: c.ink + '55' }}
                  />
                )}
              </div>
              <div>
                <div className={`font-body-lg text-body-lg font-semibold leading-tight ${done ? 'line-through' : ''}`}>
                  {h.name}
                </div>
                <div className="font-label-sm text-label-sm opacity-70 mt-0.5">{m.category}</div>
              </div>
            </button>
          )
        })}
      </div>

      {doneCount === habits.length && habits.length > 0 && editable && (
        <div className="mt-lg bg-primary-container/40 rounded-2xl p-md text-center font-label-md text-label-md text-on-primary-container">
          🎉 All done for {dayKey === today ? 'today' : 'this day'}! Great work.
        </div>
      )}
    </div>
  )
}
