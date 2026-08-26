// Pick a contextual motivational message from computed stats. Pure function.

export function pickMotivation({ overall, perfect, elapsedDays, totalDays, todayRate }) {
  const rate = overall.rate
  const cur = perfect.current

  // Milestone streaks first — these feel the most earned.
  if (cur >= 21) return `🔥 ${cur} perfect days in a row. This is who you are now.`
  if (cur >= 7) return `🔥 A full week of perfect days (${cur}). Incredible momentum!`
  if (cur >= 3) return `💪 ${cur} perfect days straight — the habit is forming.`

  // Today's progress nudges.
  if (todayRate === 1) return `✅ Everything done for today. Rest easy — you earned it.`
  if (todayRate > 0 && todayRate < 1) return `👍 Good start today. A couple more to go!`

  // Overall trajectory.
  if (rate >= 0.9) return `🌟 ${Math.round(rate * 100)}% completion overall — you're crushing it.`
  if (rate >= 0.6) return `📈 ${Math.round(rate * 100)}% overall. Steady and strong — keep stacking days.`
  if (rate >= 0.3) return `🌱 Every check-in counts. Small wins add up — let's build the streak.`

  // Early days / low activity.
  if (elapsedDays <= 2) return `🚀 Day ${elapsedDays} of ${totalDays}. The beginning is the hardest part — show up today.`
  return `☀️ A fresh day is a fresh chance. Tick one habit and get back on track.`
}
