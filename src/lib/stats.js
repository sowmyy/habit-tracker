// Pure analysis functions. No Firebase / React here — easy to unit test.
//
// Inputs:
//   habits: [{ id, name }]
//   entriesByDay: { [dayKey]: { [habitId]: true } }   // completed map per day
//   elapsed: [dayKey, ...] in chronological order (past + today only)

// Was a given habit completed on a given day?
function isDone(entriesByDay, dayKey, habitId) {
  const e = entriesByDay[dayKey]
  return !!(e && e[habitId])
}

// Per-habit completion count and rate over the elapsed days.
export function completionByHabit(habits, entriesByDay, elapsed) {
  const days = elapsed.length
  return habits.map((h) => {
    const done = elapsed.filter((k) => isDone(entriesByDay, k, h.id)).length
    return {
      habitId: h.id,
      name: h.name,
      done,
      days,
      rate: days ? done / days : 0,
    }
  })
}

// Overall completion rate across all habits x elapsed days.
export function overallCompletion(habits, entriesByDay, elapsed) {
  const total = habits.length * elapsed.length
  if (!total) return { done: 0, total: 0, rate: 0 }
  let done = 0
  for (const k of elapsed)
    for (const h of habits) if (isDone(entriesByDay, k, h.id)) done++
  return { done, total, rate: done / total }
}

// Current streak = consecutive done days ending at the most recent elapsed day.
// Longest streak = longest run of consecutive done days anywhere in elapsed.
function streakForPredicate(elapsed, doneOnDay) {
  let longest = 0
  let run = 0
  let current = 0
  for (let i = 0; i < elapsed.length; i++) {
    if (doneOnDay(elapsed[i])) {
      run++
      if (run > longest) longest = run
    } else {
      run = 0
    }
  }
  // current: count back from the end
  for (let i = elapsed.length - 1; i >= 0; i--) {
    if (doneOnDay(elapsed[i])) current++
    else break
  }
  return { current, longest }
}

export function streaksByHabit(habits, entriesByDay, elapsed) {
  return habits.map((h) => ({
    habitId: h.id,
    name: h.name,
    ...streakForPredicate(elapsed, (k) => isDone(entriesByDay, k, h.id)),
  }))
}

// Streak of "perfect" days where every habit was completed.
export function perfectDayStreak(habits, entriesByDay, elapsed) {
  const allDone = (k) => habits.length > 0 && habits.every((h) => isDone(entriesByDay, k, h.id))
  return streakForPredicate(elapsed, allDone)
}

// Heatmap: fraction of habits done for every day of the full tracker range.
// dayKeys should be the FULL range (past + future); future days get null.
export function heatmapData(habits, entriesByDay, allDays, todayK) {
  const n = habits.length
  return allDays.map((k) => {
    const future = k > todayK
    if (future) return { day: k, fraction: null, future: true }
    if (!n) return { day: k, fraction: 0, future: false }
    let done = 0
    for (const h of habits) if (isDone(entriesByDay, k, h.id)) done++
    return { day: k, fraction: done / n, future: false }
  })
}
