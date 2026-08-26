import { useMemo } from 'react'
import {
  overallCompletion,
  perfectDayStreak,
  streaksByHabit,
} from '../lib/stats'
import { pickMotivation } from '../lib/motivation'
import { addDays, dayDiff, todayKey, prettyDate, fromDayKey } from '../lib/dates'
import { habitMeta, TONE_TILE } from '../lib/habitMeta'
import Icon from '../components/Icon'
import ProgressRing from '../components/ProgressRing'
import HabitCalendar from '../components/HabitCalendar'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Dashboard({ tracker, entriesByDay }) {
  const { habits, startDate, durationDays } = tracker
  const today = todayKey()
  const endKey = addDays(startDate, durationDays - 1)

  const data = useMemo(() => {
    const elapsed = []
    for (let k = startDate; k <= today && k <= endKey; k = addDays(k, 1)) elapsed.push(k)

    // Weekly window = last 7 elapsed days
    const weekly = elapsed.slice(-7)
    const weeklyStats = overallCompletion(habits, entriesByDay, weekly)
    const overall = overallCompletion(habits, entriesByDay, elapsed)
    const perfect = perfectDayStreak(habits, entriesByDay, elapsed)
    const streaks = streaksByHabit(habits, entriesByDay, elapsed).sort((a, b) => b.current - a.current)

    // Activity chart — current calendar week (Mon..Sun)
    const dow = fromDayKey(today).getDay() // 0=Sun
    const mondayOffset = (dow + 6) % 7
    const monday = addDays(today, -mondayOffset)
    const week = WEEKDAYS.map((label, i) => {
      const k = addDays(monday, i)
      const inRange = k >= startDate && k <= endKey && k <= today
      const c = entriesByDay[k] || {}
      const done = habits.filter((h) => c[h.id]).length
      return {
        label,
        key: k,
        fraction: inRange && habits.length ? done / habits.length : 0,
        isToday: k === today,
        future: k > today,
      }
    })

    const todayCompleted = entriesByDay[today] || {}
    const todayDone = habits.filter((h) => todayCompleted[h.id]).length
    const todayRate = habits.length ? todayDone / habits.length : 0

    return { elapsed, weeklyStats, overall, perfect, streaks, week, todayRate }
  }, [habits, entriesByDay, startDate, endKey, today, durationDays])

  const quote = pickMotivation({
    overall: data.overall,
    perfect: data.perfect,
    elapsedDays: data.elapsed.length,
    totalDays: durationDays,
    todayRate: data.todayRate,
  })

  const weeklyPct = Math.round(data.weeklyStats.rate * 100)
  const topStreak = data.streaks[0]

  return (
    <div>
      <div className="mb-xl">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface dark:text-dark-on-surface mb-xs">
          Insights
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Your progress over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Quote of the day */}
        <div className="lg:col-span-2 rounded-2xl p-lg card-shadow bg-gradient-to-br from-primary-container/20 to-secondary-fixed/40 flex items-start gap-md">
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center flex-none">
            <Icon name="format_quote" filled className="text-primary text-2xl" />
          </div>
          <div>
            <div className="font-label-sm text-label-sm uppercase tracking-wide text-primary mb-sm">
              Quote of the day
            </div>
            <p className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface italic leading-8">
              {quote}
            </p>
          </div>
        </div>

        {/* Weekly completion */}
        <div className="rounded-2xl p-lg card-shadow bg-surface-container-lowest dark:bg-dark-surface-container flex flex-col items-center text-center">
          <div className="font-label-md text-label-md text-on-surface-variant self-start mb-md">
            Weekly Completion
          </div>
          <ProgressRing percent={weeklyPct} size={140} stroke={4}>
            <span className="font-headline-lg text-headline-lg text-primary">{weeklyPct}%</span>
          </ProgressRing>
          <p className="font-body-md text-body-md text-on-surface-variant mt-md">
            {weeklyPct >= 75
              ? "Great job! You're on track."
              : weeklyPct >= 40
                ? 'Solid progress — keep going.'
                : 'A fresh week to build momentum.'}
          </p>
        </div>

        {/* Activity overview */}
        <div className="lg:col-span-2 rounded-2xl p-lg card-shadow bg-surface-container-lowest dark:bg-dark-surface-container">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface">
              Activity Overview
            </h2>
            <span className="bg-surface-container-high dark:bg-dark-surface-high text-on-surface font-label-sm text-label-sm px-3 py-1 rounded-full">
              Weekly
            </span>
          </div>
          <div className="flex items-end justify-between gap-sm h-40">
            {data.week.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-sm h-full justify-end">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className={`w-6 rounded-full transition-all ${
                      d.future ? 'bg-surface-container-high' : 'bg-primary'
                    }`}
                    style={{ height: `${Math.max(4, d.fraction * 100)}%` }}
                    title={`${prettyDate(d.key)} — ${Math.round(d.fraction * 100)}%`}
                  />
                </div>
                <span
                  className={`font-label-md text-label-md ${
                    d.isToday ? 'text-primary font-bold' : 'text-on-surface-variant'
                  }`}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Streaks + projected goal */}
        <div className="rounded-2xl p-lg card-shadow bg-surface-container-lowest dark:bg-dark-surface-container">
          <h2 className="font-label-md text-label-md text-on-surface-variant mb-md">Current Streaks</h2>
          {topStreak && topStreak.current > 0 ? (
            <div className="flex items-center gap-md bg-tertiary-container/25 rounded-2xl p-md mb-lg">
              <div className="w-12 h-12 rounded-xl bg-tertiary-container flex items-center justify-center flex-none">
                <Icon name="local_fire_department" filled className="text-on-tertiary-container text-2xl" />
              </div>
              <div>
                <div className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface">
                  {topStreak.current} Days
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant">{topStreak.name}</div>
              </div>
            </div>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              Complete a habit today to start a streak.
            </p>
          )}

          <h2 className="font-label-md text-label-md text-on-surface-variant mb-md">Projected Goal</h2>
          <div className="flex items-center gap-md bg-surface-container/60 rounded-2xl p-md">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-none">
              <Icon name="event_available" className="text-secondary text-2xl" />
            </div>
            <div>
              <div className="font-body-lg text-body-lg text-on-surface dark:text-dark-on-surface">
                {durationDays}-Day Journey
              </div>
              <div className="font-label-md text-label-md text-on-surface-variant">
                Ends {prettyDate(endKey)}
              </div>
            </div>
          </div>
        </div>

        {/* Journey heatmap — one square per day of the goal */}
        <div className="lg:col-span-3 rounded-2xl p-lg card-shadow bg-surface-container-lowest dark:bg-dark-surface-container">
          <HabitCalendar tracker={tracker} entriesByDay={entriesByDay} />
        </div>
      </div>
    </div>
  )
}
