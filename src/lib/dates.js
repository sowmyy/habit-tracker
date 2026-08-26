// Pure date helpers. "Day keys" are local-date strings: "YYYY-MM-DD".

export function toDayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return toDayKey(new Date())
}

// Parse a "YYYY-MM-DD" key into a local Date at midnight.
export function fromDayKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key, n) {
  const d = fromDayKey(key)
  d.setDate(d.getDate() + n)
  return toDayKey(d)
}

// Whole-day difference: dayDiff(a, b) = number of days from a to b.
export function dayDiff(aKey, bKey) {
  const a = fromDayKey(aKey)
  const b = fromDayKey(bKey)
  return Math.round((b - a) / 86400000)
}

// All day keys from startKey for `count` days (inclusive of start).
export function rangeKeys(startKey, count) {
  const out = []
  for (let i = 0; i < count; i++) out.push(addDays(startKey, i))
  return out
}

// Day keys of the tracker that are in the past or today (i.e. actionable so far).
export function elapsedKeys(startKey, durationDays, refKey = todayKey()) {
  const total = rangeKeys(startKey, durationDays)
  return total.filter((k) => dayDiff(k, refKey) >= 0)
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function prettyDate(key) {
  const d = fromDayKey(key)
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function weekdayIndex(key) {
  return fromDayKey(key).getDay()
}
