import { describe, it, expect } from 'vitest'
import {
  completionByHabit,
  overallCompletion,
  streaksByHabit,
  perfectDayStreak,
  heatmapData,
} from './stats'

const habits = [
  { id: 'a', name: 'Water' },
  { id: 'b', name: 'Read' },
]

// 5 elapsed days: d1..d5
const elapsed = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05']

const entries = {
  '2026-01-01': { a: true, b: true }, // perfect
  '2026-01-02': { a: true, b: true }, // perfect
  '2026-01-03': { a: true }, // only a
  '2026-01-04': {}, // none
  '2026-01-05': { a: true, b: true }, // perfect
}

describe('completionByHabit', () => {
  it('counts done days and rate per habit', () => {
    const res = completionByHabit(habits, entries, elapsed)
    const a = res.find((r) => r.habitId === 'a')
    const b = res.find((r) => r.habitId === 'b')
    expect(a.done).toBe(4)
    expect(a.rate).toBeCloseTo(4 / 5)
    expect(b.done).toBe(3)
    expect(b.rate).toBeCloseTo(3 / 5)
  })
})

describe('overallCompletion', () => {
  it('computes overall done / total', () => {
    const res = overallCompletion(habits, entries, elapsed)
    expect(res.total).toBe(10) // 2 habits * 5 days
    expect(res.done).toBe(7) // 4 (a) + 3 (b)
    expect(res.rate).toBeCloseTo(0.7)
  })
  it('handles empty gracefully', () => {
    expect(overallCompletion([], {}, []).rate).toBe(0)
  })
})

describe('streaksByHabit', () => {
  it('computes current and longest streaks', () => {
    const res = streaksByHabit(habits, entries, elapsed)
    const a = res.find((r) => r.habitId === 'a')
    // a done on d1,d2,d3,(skip d4),d5 -> longest 3, current 1
    expect(a.longest).toBe(3)
    expect(a.current).toBe(1)
    const b = res.find((r) => r.habitId === 'b')
    // b done d1,d2,(d3 no),(d4 no),d5 -> longest 2, current 1
    expect(b.longest).toBe(2)
    expect(b.current).toBe(1)
  })
})

describe('perfectDayStreak', () => {
  it('counts days where every habit is done', () => {
    const res = perfectDayStreak(habits, entries, elapsed)
    // perfect on d1,d2,(d3 no),(d4 no),d5 -> longest 2, current 1
    expect(res.longest).toBe(2)
    expect(res.current).toBe(1)
  })
})

describe('heatmapData', () => {
  it('marks future days as null and computes fractions', () => {
    const allDays = [...elapsed, '2026-01-06']
    const res = heatmapData(habits, entries, allDays, '2026-01-05')
    expect(res[0].fraction).toBe(1) // d1 both done
    expect(res[2].fraction).toBe(0.5) // d3 one of two
    expect(res[5].future).toBe(true)
    expect(res[5].fraction).toBe(null)
  })
})
