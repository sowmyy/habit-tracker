import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'
import DailyPortal from '../screens/DailyPortal'
import Dashboard from '../screens/Dashboard'
import Settings from '../screens/Settings'

const NAV = [
  { key: 'today', label: 'Daily Tracker', icon: 'task_alt' },
  { key: 'insights', label: 'Insights', icon: 'bar_chart' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]

const MOBILE_NAV = [
  { key: 'today', label: 'Tracker', icon: 'check_circle' },
  { key: 'insights', label: 'Insights', icon: 'analytics' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]

export default function AppShell({ tracker, entriesByDay, onUpdateDay, onNewGoal }) {
  const { user, logout } = useAuth()
  const [view, setView] = useState('today')

  const avatar = user?.photoURL
  const initial = (user?.displayName || 'U').charAt(0).toUpperCase()

  return (
    <div className="min-h-full flex bg-background dark:bg-dark-bg">
      {/* Mobile top app bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface dark:bg-dark-surface flex justify-between items-center px-margin-mobile h-14 card-shadow">
        <span className="font-headline-md text-headline-md font-bold text-primary">HabiTracker</span>
        <Avatar avatar={avatar} initial={initial} onClick={() => setView('settings')} />
      </header>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-full bg-surface-container-low dark:bg-dark-surface p-lg z-40">
        <div className="font-headline-md text-headline-md font-bold text-primary mb-lg">HabiTracker</div>
        <div className="flex items-center gap-md mb-xl">
          <Avatar avatar={avatar} initial={initial} size={48} />
          <div className="min-w-0">
            <div className="font-body-md text-body-md text-on-surface dark:text-dark-on-surface truncate">
              {user?.displayName || 'Welcome back'}
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">Stay consistent!</div>
          </div>
        </div>

        <div className="flex-grow flex flex-col gap-sm">
          {NAV.map((item) => {
            const active = view === item.key
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`flex items-center gap-md p-md rounded-lg transition-colors text-left ${
                  active
                    ? 'bg-primary-container/25 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-high'
                }`}
              >
                <Icon name={item.icon} filled={active} />
                <span className="font-label-md text-label-md">{item.label}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={onNewGoal}
          className="mt-auto w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-sm"
        >
          <Icon name="add" />
          New Goal
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-grow md:ml-64 pt-20 md:pt-lg px-margin-mobile md:px-margin-desktop pb-28 md:pb-lg max-w-7xl mx-auto w-full">
        {view === 'today' && (
          <DailyPortal tracker={tracker} entriesByDay={entriesByDay} onUpdateDay={onUpdateDay} />
        )}
        {view === 'insights' && <Dashboard tracker={tracker} entriesByDay={entriesByDay} />}
        {view === 'settings' && <Settings onNewGoal={onNewGoal} onLogout={logout} />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-16 bg-surface dark:bg-dark-surface rounded-t-2xl shadow-[0_-4px_20px_rgba(30,41,59,0.08)]">
        {MOBILE_NAV.map((item) => {
          const active = view === item.key
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`flex flex-col items-center justify-center px-4 py-1 rounded-2xl transition-colors ${
                active ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
              }`}
            >
              <Icon name={item.icon} filled={active} />
              <span className="font-label-sm text-label-sm">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function Avatar({ avatar, initial, size = 40, onClick }) {
  const cls = 'rounded-full object-cover flex-none'
  if (avatar) {
    return (
      <img
        src={avatar}
        alt=""
        onClick={onClick}
        style={{ width: size, height: size }}
        className={`${cls} ${onClick ? 'cursor-pointer' : ''}`}
      />
    )
  }
  return (
    <span
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`${cls} bg-primary text-on-primary flex items-center justify-center font-bold ${onClick ? 'cursor-pointer' : ''}`}
    >
      {initial}
    </span>
  )
}
