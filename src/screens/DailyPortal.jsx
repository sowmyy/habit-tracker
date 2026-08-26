import { useMemo, useState } from 'react'
import { toggleHabit } from '../lib/store'
import { todayKey, prettyDate, addDays, dayDiff, fromDayKey } from '../lib/dates'
import { perfectDayStreak, streaksByHabit } from '../lib/stats'
import { habitMeta, TONE_TILE } from '../lib/habitMeta'
import Icon from '../components/Icon'
import ProgressRing from '../components/ProgressRing'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DailyPortal({ tracker, entriesByDay, onUpdateDay }) {
  const [dayKey, setDayKey] = useState(todayKey())
  const [savingId, setSavingId] = useState(null)

  const today = todayKey()
  const endKey = addDays(tracker.startDate, tracker.durationDays - 1)
  const dayNumber = dayDiff(tracker.startDate, dayKey) + 1
  const isFuture = dayKey > today
  const inRange = dayKey >= tracker.startDate && dayKey <= endKey
  const editable = inRange && !isFuture

  const completed = entriesByDay[dayKey] || {}
  const habits = tracker.habits
  const doneCount = habits.filter((h) => completed[h.id]).length
  const pct = habits.length ? (doneCount / habits.length) * 100 : 0

  // Per-habit current streak (real) + perfect-day streak for the streak card.
  const streaks = useMemo(() => {
    const elapsed = []
    for (let k = tracker.startDate; k <= today && k <= endKey; k = addDays(k, 1)) elapsed.push(k)
    const byHabit = {}
    streaksByHabit(habits, entriesByDay, elapsed).forEach((s) => (byHabit[s.habitId] = s.current))
    const perfect = perfectDayStreak(habits, entriesByDay, elapsed).current
    return { byHabit, perfect }
  }, [habits, entriesByDay, tracker.startDate, endKey, today])

  // Date scroller window: recent days up to today+2, clipped to tracker range.
  const windowDays = useMemo(() => {
    const startW = addDays(today, -7) < tracker.startDate ? tracker.startDate : addDays(today, -7)
    const endW = addDays(today, 2) > endKey ? endKey : addDays(today, 2)
    const days = []
    for (let k = startW; k <= endW; k = addDays(k, 1)) days.push(k)
    return days
  }, [today, tracker.startDate, endKey])

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
      {/* Header + date scroller */}
      <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface dark:text-dark-on-surface mb-xs">
            Today's Focus
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Day {dayNumber} of your {tracker.durationDays} day journey.
          </p>
        </div>
        <div className="flex gap-sm overflow-x-auto pb-2 scrollbar-hide">
          {windowDays.map((k) => {
            const d = fromDayKey(k)
            const active = k === dayKey
            return (
              <button
                key={k}
                onClick={() => setDayKey(k)}
                className={`flex flex-col items-center justify-center rounded-xl min-w-[60px] p-2 transition-colors ${
                  active
                    ? 'bg-primary text-on-primary shadow-md'
                    : k > today
                      ? 'bg-surface-container-lowest dark:bg-dark-surface-container text-on-surface-variant border border-surface-container-highest'
                      : 'bg-surface-container-high dark:bg-dark-surface-high text-on-surface-variant'
                }`}
              >
                <span className="font-label-sm text-label-sm">{WEEKDAYS[d.getDay()]}</span>
                <span className="font-headline-md text-headline-md">{d.getDate()}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Progress bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container rounded-2xl p-lg card-shadow md:col-span-2 flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface mb-sm">
              {dayKey === today ? 'Today' : prettyDate(dayKey)}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">
              {doneCount} of {habits.length} habits completed
            </p>
            <div className="flex gap-xs flex-wrap">
              {habits.map((h) => (
                <div
                  key={h.id}
                  className={`w-12 h-2 rounded-full ${completed[h.id] ? 'bg-primary' : 'bg-surface-container-highest'}`}
                />
              ))}
            </div>
          </div>
          <ProgressRing percent={pct} size={80}>
            <span className="font-label-md text-label-md">{Math.round(pct)}%</span>
          </ProgressRing>
        </div>

        <div className="bg-surface-container-lowest dark:bg-dark-surface-container rounded-2xl p-lg card-shadow flex flex-col justify-center items-center text-center">
          <Icon name="local_fire_department" filled className="text-4xl text-tertiary-container mb-sm" />
          <div className="font-headline-xl text-headline-xl text-on-surface dark:text-dark-on-surface">
            {streaks.perfect}
          </div>
          <div className="font-label-md text-label-md text-on-surface-variant">Day Streak</div>
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

      {/* Habits list */}
      <div className="space-y-md">
        {habits.map((h) => {
          const done = !!completed[h.id]
          const m = habitMeta(h.name)
          const streak = streaks.byHabit[h.id] || 0
          return (
            <div
              key={h.id}
              className="bg-surface-container-lowest dark:bg-dark-surface-container rounded-2xl p-md flex items-center justify-between card-shadow card-hover"
            >
              <div className="flex items-center gap-md min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-none ${TONE_TILE[m.tone]}`}>
                  <Icon name={m.icon} />
                </div>
                <div className="min-w-0">
                  <div
                    className={`font-body-lg text-body-lg text-on-surface dark:text-dark-on-surface truncate ${
                      done ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {h.name}
                  </div>
                  <div className="flex items-center gap-sm mt-1">
                    <span className="bg-surface-container-high dark:bg-dark-surface-high text-on-surface-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm">
                      {m.category}
                    </span>
                    {streak > 0 && (
                      <span className="flex items-center text-tertiary bg-tertiary-container/20 px-2 py-0.5 rounded-full font-label-sm text-label-sm">
                        <Icon name="local_fire_department" filled className="text-[13px] mr-0.5" />
                        {streak}d
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle(h.id)}
                disabled={!editable || savingId === h.id}
                aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-none checkbox-transition ${
                  done
                    ? 'bg-primary text-on-primary'
                    : 'border-2 border-outline-variant hover:border-primary'
                } ${!editable ? 'opacity-40 cursor-default' : ''}`}
              >
                {done && <Icon name="check" filled className="text-lg" />}
              </button>
            </div>
          )
        })}
      </div>

      {doneCount === habits.length && habits.length > 0 && editable && (
        <div className="mt-md bg-primary-container/20 border border-primary rounded-2xl p-md text-center font-label-md text-label-md text-on-primary-container">
          🎉 All done for {dayKey === today ? 'today' : 'this day'}! Great work.
        </div>
      )}
    </div>
  )
}
