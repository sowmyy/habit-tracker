import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import { loadAll, addHabit } from './lib/store'
import LoginScreen from './screens/LoginScreen'
import Onboarding from './screens/Onboarding'
import AppShell from './components/AppShell'

function Spinner({ text, danger }) {
  return (
    <div
      className={`min-h-full flex items-center justify-center font-body-md text-body-md ${
        danger ? 'text-error' : 'text-on-surface-variant'
      }`}
    >
      {text}
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  const [data, setData] = useState(null) // { tracker, entriesByDay }
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState('')
  const [reonboard, setReonboard] = useState(false)

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

  const updateDay = useCallback((dayKey, completed) => {
    setData((d) => ({
      ...d,
      entriesByDay: { ...(d?.entriesByDay || {}), [dayKey]: completed },
    }))
  }, [])

  const handleAddHabit = useCallback(async (habit) => {
    await addHabit(habit)
    setData((d) => ({
      ...d,
      tracker: { ...d.tracker, habits: [...d.tracker.habits, habit] },
    }))
  }, [])

  if (loading) return <Spinner text="Loading…" />
  if (!user) return <LoginScreen />
  if (dataLoading) return <Spinner text="Opening your habit sheet…" />
  if (error) return <Spinner text={error} danger />

  if (!data?.tracker || reonboard) {
    return (
      <Onboarding
        onDone={(tracker) => {
          setData({ tracker, entriesByDay: {} })
          setReonboard(false)
        }}
      />
    )
  }

  return (
    <AppShell
      tracker={data.tracker}
      entriesByDay={data.entriesByDay}
      onUpdateDay={updateDay}
      onAddHabit={handleAddHabit}
      onNewGoal={() => setReonboard(true)}
    />
  )
}
