// Vibrant task-card palette. A stable color is derived from each habit's id
// (looks random across habits, but never changes for a given habit).

export const CARD_COLORS = [
  { bg: '#FACC48', ink: '#3B2F00' }, // amber
  { bg: '#A3E048', ink: '#1A2E05' }, // lime
  { bg: '#F472B6', ink: '#500724' }, // pink
  { bg: '#93C5FD', ink: '#0C2A4D' }, // sky
  { bg: '#FB923C', ink: '#431407' }, // orange
  { bg: '#C4B5FD', ink: '#2E1065' }, // violet
  { bg: '#5EEAD4', ink: '#042F2A' }, // teal
  { bg: '#A5B4FC', ink: '#1E1B4B' }, // indigo
]

// Neutral greyed style for a completed card.
export const CARD_DONE = { bg: '#EDEFF2', ink: '#9AA1AC' }

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function cardColor(id = '') {
  return CARD_COLORS[hashString(id) % CARD_COLORS.length]
}
