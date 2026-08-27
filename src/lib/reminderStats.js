import { addDays, dayDiff, todayKey } from './dates'
import { perfectDayStreak } from './stats'

// The compact stats the reminder server uses to build a nudge message.
export function computeReminderStats(tracker, entriesByDay) {
  if (!tracker) return {}
  const today = todayKey()
  const endKey = addDays(tracker.startDate, tracker.durationDays - 1)
  const habits = tracker.habits || []
  const completed = entriesByDay?.[today] || {}

  const elapsed = []
  for (let k = tracker.startDate; k <= today && k <= endKey; k = addDays(k, 1)) elapsed.push(k)

  return {
    streak: perfectDayStreak(habits, entriesByDay || {}, elapsed).current,
    doneToday: habits.filter((h) => completed[h.id]).length,
    totalToday: habits.length,
    dayNumber: Math.min(Math.max(dayDiff(tracker.startDate, today) + 1, 1), tracker.durationDays),
    totalDays: tracker.durationDays,
  }
}
