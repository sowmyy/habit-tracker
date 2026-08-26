import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DailyPortal from '../screens/DailyPortal'
import Dashboard from '../screens/Dashboard'

// Switches between the daily portal and the dashboard. Entry data is owned by
// App and passed down; toggles update it optimistically via onUpdateDay.
export default function AppShell({ tracker, entriesByDay, onUpdateDay }) {
  const { user, logout } = useAuth()
  const [view, setView] = useState('today') // 'today' | 'dashboard'

  return (
    <div>
      <header className="appbar">
        <span className="brand">✅ Habit Tracker</span>
        <div className="row">
          <div className="nav">
            <button
              className={`tab ${view === 'today' ? 'active' : ''}`}
              onClick={() => setView('today')}
            >
              Today
            </button>
            <button
              className={`tab ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </button>
          </div>
          {user?.photoURL ? (
            <img className="avatar" src={user.photoURL} alt="" onClick={logout} title="Sign out" />
          ) : (
            <button className="ghost" onClick={logout}>Sign out</button>
          )}
        </div>
      </header>

      {view === 'today' ? (
        <DailyPortal tracker={tracker} entriesByDay={entriesByDay} onUpdateDay={onUpdateDay} />
      ) : (
        <Dashboard tracker={tracker} entriesByDay={entriesByDay} />
      )}
    </div>
  )
}
