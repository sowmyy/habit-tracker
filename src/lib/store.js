// Storage layer backed by a single Google Sheet in the user's Drive.
//
// Spreadsheet layout (three tabs):
//   Config: A=key, B=value  -> durationDays, startDate, confirmed
//   Habits: A=id,  B=name
//   Log:    row 1 = ["date", habitId1, habitId2, ...]
//           each row = [dateKey, "1"|"" per habit]
//
// Streaks are NOT stored — they're derived from the Log by lib/stats.js.

import { apiFetch } from './googleApi'
import { todayKey } from './dates'

const SPREADSHEET_NAME = 'Habit Tracker Data'
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const DRIVE_FILES = 'https://www.googleapis.com/drive/v3/files'

// In-memory context for the current session (single user SPA).
let ctx = { spreadsheetId: null, logHeader: [], dateRows: {} }

function makeId() {
  return 'h_' + Math.random().toString(36).slice(2, 10)
}
export function newHabit(name) {
  return { id: makeId(), name: name.trim() }
}

// Column letter for a 1-based column index (1=A, 2=B, ... 27=AA).
function colLetter(n) {
  let s = ''
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

// ---- Drive: find or create the spreadsheet -------------------------------

export async function findSpreadsheetId() {
  const q = encodeURIComponent(
    `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
  )
  const r = await apiFetch(`${DRIVE_FILES}?q=${q}&fields=files(id,name)`)
  return r.files?.[0]?.id || null
}

async function createSpreadsheet() {
  const r = await apiFetch(SHEETS_BASE, {
    method: 'POST',
    body: {
      properties: { title: SPREADSHEET_NAME },
      sheets: [
        { properties: { title: 'Config' } },
        { properties: { title: 'Habits' } },
        { properties: { title: 'Log' } },
      ],
    },
  })
  const id = r.spreadsheetId
  await valuesUpdate(id, 'Config!A1:B1', [['key', 'value']])
  await valuesUpdate(id, 'Habits!A1:B1', [['id', 'name']])
  await valuesUpdate(id, 'Log!A1', [['date']])
  return id
}

// ---- Sheets value helpers -------------------------------------------------

function valuesUpdate(id, range, values) {
  const url = `${SHEETS_BASE}/${id}/values/${encodeURIComponent(range)}?valueInputOption=RAW`
  return apiFetch(url, { method: 'PUT', body: { values } })
}

function valuesAppend(id, range, values) {
  const url = `${SHEETS_BASE}/${id}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`
  return apiFetch(url, { method: 'POST', body: { values } })
}

function valuesClear(id, range) {
  const url = `${SHEETS_BASE}/${id}/values/${encodeURIComponent(range)}:clear`
  return apiFetch(url, { method: 'POST', body: {} })
}

async function batchGet(id, ranges) {
  const qs = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&')
  const r = await apiFetch(`${SHEETS_BASE}/${id}/values:batchGet?${qs}`)
  return r.valueRanges || []
}

// ---- High-level load ------------------------------------------------------

// Returns { tracker, entriesByDay } or { tracker: null } if not set up yet.
export async function loadAll() {
  let id = await findSpreadsheetId()
  if (!id) {
    ctx = { spreadsheetId: null, logHeader: [], dateRows: {} }
    return { tracker: null, entriesByDay: {} }
  }

  const [cfg, hab, log] = await batchGet(id, ['Config!A:B', 'Habits!A:B', 'Log!A:ZZ'])

  // Config -> key/value map (skip header row)
  const config = {}
  ;(cfg.values || []).slice(1).forEach(([k, v]) => {
    if (k) config[k] = v
  })

  // Habits (skip header row)
  const habits = (hab.values || [])
    .slice(1)
    .filter((row) => row[0])
    .map(([hid, name]) => ({ id: hid, name: name || '' }))

  // Log -> entriesByDay + row bookkeeping
  const rows = log.values || []
  const header = rows[0] || ['date']
  const logHeader = header.slice(1) // habit ids in column order
  const entriesByDay = {}
  const dateRows = {}
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const date = row[0]
    if (!date) continue
    dateRows[date] = i + 1 // 1-based sheet row number
    const completed = {}
    for (let c = 0; c < logHeader.length; c++) {
      if (row[c + 1]) completed[logHeader[c]] = true
    }
    entriesByDay[date] = completed
  }

  ctx = { spreadsheetId: id, logHeader, dateRows }

  const confirmed = config.confirmed === 'true' || config.confirmed === 'TRUE'
  const tracker = confirmed
    ? {
        durationDays: Number(config.durationDays) || 0,
        startDate: config.startDate,
        habits,
        confirmed: true,
      }
    : null

  return { tracker, entriesByDay }
}

// ---- Confirm & lock tracker ----------------------------------------------

export async function confirmTracker({ durationDays, habits }) {
  let id = ctx.spreadsheetId || (await findSpreadsheetId())
  if (!id) id = await createSpreadsheet()

  const startDate = todayKey()
  const habitIds = habits.map((h) => h.id)

  // Clear any previous habits/log so a reset starts from a clean slate.
  await valuesClear(id, 'Habits!A1:Z')
  await valuesClear(id, 'Log!A1:ZZ')

  await valuesUpdate(id, 'Config!A1:B4', [
    ['key', 'value'],
    ['durationDays', String(durationDays)],
    ['startDate', startDate],
    ['confirmed', 'true'],
  ])
  await valuesUpdate(id, 'Habits!A1', [
    ['id', 'name'],
    ...habits.map((h) => [h.id, h.name]),
  ])
  await valuesUpdate(id, 'Log!A1', [['date', ...habitIds]])

  ctx = { spreadsheetId: id, logHeader: habitIds, dateRows: {} }

  return { durationDays, startDate, habits, confirmed: true }
}

// ---- Add a habit to an existing tracker ----------------------------------
// Appends a row to the Habits tab and a new column to the Log header. Existing
// daily entries stay valid (the new column is simply blank until checked).
export async function addHabit(habit) {
  const id = ctx.spreadsheetId
  if (!id) throw new Error('No spreadsheet loaded')

  // New Log column: date is column A, habits start at B.
  const col = colLetter(ctx.logHeader.length + 2)

  await valuesAppend(id, 'Habits!A1', [[habit.id, habit.name]])
  await valuesUpdate(id, `Log!${col}1`, [[habit.id]])

  ctx.logHeader.push(habit.id)
  return habit
}

// ---- Toggle one habit for one day ----------------------------------------

export async function toggleHabit(dayKey, habitId, done) {
  const id = ctx.spreadsheetId
  if (!id) throw new Error('No spreadsheet loaded')

  const idx = ctx.logHeader.indexOf(habitId)
  if (idx === -1) throw new Error('Unknown habit')
  const col = colLetter(idx + 2) // date is column A; habits start at B
  const value = done ? '1' : ''

  const existingRow = ctx.dateRows[dayKey]
  if (existingRow) {
    await valuesUpdate(id, `Log!${col}${existingRow}`, [[value]])
    return
  }

  // New day: append a full-width row with just this habit set.
  const row = [dayKey, ...ctx.logHeader.map((h) => (h === habitId ? value : ''))]
  const resp = await valuesAppend(id, 'Log!A1', [row])
  // updatedRange looks like "Log!A5:D5" -> capture the row number
  const m = /![A-Z]+(\d+):/.exec(resp?.updates?.updatedRange || '')
  if (m) ctx.dateRows[dayKey] = Number(m[1])
}
