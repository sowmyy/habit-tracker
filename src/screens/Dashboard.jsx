import { useMemo, useState } from 'react'
import {
  completionByHabit,
  overallCompletion,
  streaksByHabit,
  perfectDayStreak,
  heatmapData,
} from '../lib/stats'
import { pickMotivation } from '../lib/motivation'
import { rangeKeys, elapsedKeys, todayKey } from '../lib/dates'
import StatBar from '../components/StatBar'
import Heatmap from '../components/Heatmap'

const TABS = [
  { id: 'streaks', label: '🔥 Streaks' },
  { id: 'completion', label: '📊 Completion' },
  { id: 'heatmap', label: '🗓 Heatmap' },
  { id: 'motivation', label: '💬 Motivation' },
]

export default function Dashboard({ tracker, entriesByDay }) {
  const [tab, setTab] = useState('streaks')
  const { habits, startDate, durationDays } = tracker
  const today = todayKey()

  const stats = useMemo(() => {
    const allDays = rangeKeys(startDate, durationDays)
    const elapsed = elapsedKeys(startDate, durationDays, today)
    const byHabit = completionByHabit(habits, entriesByDay, elapsed)
    const overall = overallCompletion(habits, entriesByDay, elapsed)
    const streaks = streaksByHabit(habits, entriesByDay, elapsed)
    const perfect = perfectDayStreak(habits, entriesByDay, elapsed)
    const heat = heatmapData(habits, entriesByDay, allDays, today)

    // Today's completion rate for motivation.
    const todayCompleted = entriesByDay[today] || {}
    const todayDone = habits.filter((h) => todayCompleted[h.id]).length
    const todayRate = habits.length ? todayDone / habits.length : 0

    return { elapsed, byHabit, overall, streaks, perfect, heat, todayRate }
  }, [habits, entriesByDay, startDate, durationDays, today])

  const motivation = useMemo(
    () =>
      pickMotivation({
        overall: stats.overall,
        perfect: stats.perfect,
        elapsedDays: stats.elapsed.length,
        totalDays: durationDays,
        todayRate: stats.todayRate,
      }),
    [stats, durationDays]
  )

  return (
    <div className="page">
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'streaks' && (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="muted">Perfect-day streak (all habits)</div>
            <div className="big-stat">{stats.perfect.current} 🔥</div>
            <div className="muted">Longest: {stats.perfect.longest} days</div>
          </div>
          {stats.streaks.map((s) => (
            <div className="card row spread" key={s.habitId}>
              <span>{s.name}</span>
              <span className="muted">
                current <strong>{s.current}</strong> · best <strong>{s.longest}</strong>
              </span>
            </div>
          ))}
        </>
      )}

      {tab === 'completion' && (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="muted">Overall completion</div>
            <div className="big-stat">{Math.round(stats.overall.rate * 100)}%</div>
            <div className="muted">
              {stats.overall.done} / {stats.overall.total} check-ins ·{' '}
              {stats.elapsed.length} of {durationDays} days elapsed
            </div>
          </div>
          <div className="card">
            <h2>By habit</h2>
            {stats.byHabit.map((h) => (
              <StatBar
                key={h.habitId}
                label={h.name}
                value={h.rate}
                sub={`${h.done}/${h.days} · ${Math.round(h.rate * 100)}%`}
              />
            ))}
          </div>
        </>
      )}

      {tab === 'heatmap' && (
        <div className="card">
          <h2>Daily consistency</h2>
          <p className="muted">Each square is a day. Greener = more habits completed.</p>
          <Heatmap cells={stats.heat} />
        </div>
      )}

      {tab === 'motivation' && (
        <div className="card">
          <p className="motivation">{motivation}</p>
          <hr style={{ borderColor: 'var(--border)', opacity: 0.4 }} />
          <p className="progress-note muted" style={{ textAlign: 'center' }}>
            You've completed {stats.overall.done} check-ins across{' '}
            {stats.elapsed.length} days. Keep showing up — future you is watching. 🙌
          </p>
        </div>
      )}
    </div>
  )
}
