import { rangeKeys, todayKey, fromDayKey } from '../lib/dates'
import Icon from './Icon'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// One square per day of the whole journey, colored by that day's completion:
//   complete  -> all habits done (green + check)
//   partial   -> some habits done (amber)
//   none      -> a past/today day with nothing done (red)
//   upcoming  -> a future day (faint)
export default function HabitCalendar({ tracker, entriesByDay }) {
  const { habits, startDate, durationDays } = tracker
  const today = todayKey()
  const days = rangeKeys(startDate, durationDays)
  const n = habits.length

  function classify(k, dayIndex) {
    const d = fromDayKey(k)
    const date = `Day ${dayIndex + 1}: ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    if (k > today) return { state: 'upcoming', label: `${date} — upcoming` }
    const c = entriesByDay[k] || {}
    const done = habits.filter((h) => c[h.id]).length
    const label = `${date} — ${done}/${n} completed`
    if (n > 0 && done === n) return { state: 'complete', label }
    if (done > 0) return { state: 'partial', label }
    return { state: 'none', label }
  }

  const CELL = {
    complete: 'bg-primary text-on-primary',
    partial: 'bg-tertiary-container',
    none: 'bg-error-container',
    upcoming: 'bg-surface-container-high dark:bg-dark-surface-high',
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-lg">
        <h2 className="font-headline-md text-headline-md text-on-surface dark:text-dark-on-surface">
          {durationDays}-Day Journey
        </h2>
        <div className="flex flex-wrap gap-4">
          <LegendItem swatch="bg-primary" label="All tasks completed" check />
          <LegendItem swatch="bg-tertiary-container" label="Partial progress" />
          <LegendItem swatch="bg-error-container" label="Not started" />
          <LegendItem swatch="bg-surface-container-high dark:bg-dark-surface-high" label="Upcoming" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-10 gap-1.5 sm:gap-2 w-full max-w-2xl mx-auto">
        {days.map((k, i) => {
          const { state, label } = classify(k, i)
          return (
            <div
              key={k}
              title={label}
              className={`w-full aspect-square rounded-[6px] cursor-help flex items-center justify-center ${CELL[state]}`}
            >
              {state === 'complete' && (
                <Icon name="check" filled className="text-[10px] sm:text-xs leading-none" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LegendItem({ swatch, label, check }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center ${swatch}`}>
        {check && <Icon name="check" filled className="text-[8px] text-on-primary leading-none" />}
      </span>
      <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
    </div>
  )
}
