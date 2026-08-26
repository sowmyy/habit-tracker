import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import { loadAll } from './lib/store'
import LoginScreen from './screens/LoginScreen'
import Onboarding from './screens/Onboarding'
import AppShell from './components/AppShell'

export default function App() {
  const { user, loading } = useAuth()
  const [data, setData] = useState(null) // { tracker, entriesByDay }
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState('')

  // Load the user's Google Sheet (or discover there isn't one yet).
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!user) {
        setData(null)
        return
      }
      setDataLoading(true)
      setError('')
      try {
        const result = await loadAll()
        if (!cancelled) setData(result)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('Could not open your habit sheet. Please try again.')
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [user])

  // Merge an updated day's completed map into shared state (optimistic UI).
  const updateDay = useCallback((dayKey, completed) => {
    setData((d) => ({
      ...d,
      entriesByDay: { ...(d?.entriesByDay || {}), [dayKey]: completed },
    }))
  }, [])

  if (loading) return <div className="spinner">Loading…</div>
  if (!user) return <LoginScreen />
  if (dataLoading) return <div className="spinner">Opening your habit sheet…</div>
  if (error) return <div className="spinner" style={{ color: 'var(--danger)' }}>{error}</div>

  // No confirmed tracker yet → onboarding.
  if (!data?.tracker) {
    return (
      <Onboarding
        onDone={(tracker) => setData({ tracker, entriesByDay: {} })}
      />
    )
  }

  return (
    <AppShell
      tracker={data.tracker}
      entriesByDay={data.entriesByDay}
      onUpdateDay={updateDay}
    />
  )
}
