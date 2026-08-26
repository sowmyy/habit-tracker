// Minimal dark-mode preference: toggles the `dark` class on <html> and persists.
const KEY = 'habitracker-theme'

export function initTheme() {
  const saved = localStorage.getItem(KEY)
  if (saved === 'dark') document.documentElement.classList.add('dark')
}

export function isDark() {
  return document.documentElement.classList.contains('dark')
}

export function setDark(on) {
  document.documentElement.classList.toggle('dark', on)
  localStorage.setItem(KEY, on ? 'dark' : 'light')
}
