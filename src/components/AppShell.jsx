import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'
import DailyPortal from '../screens/DailyPortal'
import Dashboard from '../screens/Dashboard'
import Settings from '../screens/Settings'
import AddHabit from '../screens/AddHabit'

const NAV = [
  { key: 'today', label: 'Daily Tracker', icon: 'task_alt' },
  { key: 'add', label: 'Add Habit', icon: 'add_box' },
  { key: 'insights', label: 'Insights', icon: 'bar_chart' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]

const MOBILE_NAV = [
  { key: 'today', label: 'Tracker', icon: 'check_circle' },
  { key: 'add', label: 'Add', icon: 'add_circle' },
  { key: 'insights', label: 'Insights', icon: 'analytics' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]

const COLLAPSE_KEY = 'habitracker-nav-collapsed'

export default function AppShell({ tracker, entriesByDay, onUpdateDay, onAddHabit, onNewGoal }) {
  const { user, logout } = useAuth()
  const [view, setView] = useState('today')
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === '1'
  )

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  const avatar = user?.photoURL
  const initial = (user?.displayName || 'U').charAt(0).toUpperCase()

  return (
    <div className="min-h-full flex bg-background dark:bg-dark-bg">
      {/* Mobile top app bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-md flex justify-between items-center px-margin-mobile h-safe-top card-shadow">
        <span className="font-headline-md text-headline-md font-bold text-primary">HabiTracker</span>
        <Avatar avatar={avatar} initial={initial} onClick={() => setView('settings')} />
      </header>

      {/* Desktop sidebar */}
      <nav
        className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-surface-container-low dark:bg-dark-surface p-lg z-40 transition-[width] duration-200 ${
          collapsed ? 'w-20 items-center' : 'w-64'
        }`}
      >
        {/* Brand + collapse toggle */}
        <div className={`flex items-center mb-lg ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <span className="font-headline-md text-headline-md font-bold text-primary">HabiTracker</span>
          )}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-high transition-colors"
          >
            <Icon name={collapsed ? 'menu' : 'menu_open'} className="text-2xl" />
          </button>
        </div>

        {/* Profile */}
        <div className={`flex items-center gap-md mb-xl ${collapsed ? 'justify-center' : ''}`}>
          <Avatar avatar={avatar} initial={initial} size={collapsed ? 40 : 48} />
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-body-md text-body-md text-on-surface dark:text-dark-on-surface truncate">
                {user?.displayName || 'Welcome back'}
              </div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">Stay consistent!</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-grow flex flex-col gap-sm w-full">
          {NAV.map((item) => {
            const active = view === item.key
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-md rounded-xl transition-colors text-left ${
                  collapsed ? 'justify-center p-3' : 'p-md'
                } ${
                  active
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface dark:text-dark-on-surface font-medium hover:bg-surface-container-high dark:hover:bg-dark-surface-high'
                }`}
              >
                <Icon name={item.icon} filled className="text-2xl" />
                {!collapsed && <span className="font-label-md text-label-md">{item.label}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Main content */}
      <main
        className={`flex-grow pt-[calc(4rem+env(safe-area-inset-top))] md:pt-lg px-margin-mobile md:px-margin-desktop pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-lg max-w-7xl mx-auto w-full transition-[margin] duration-200 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div key={view} className="view-enter">
          {view === 'today' && (
            <DailyPortal tracker={tracker} entriesByDay={entriesByDay} onUpdateDay={onUpdateDay} />
          )}
          {view === 'add' && (
            <AddHabit tracker={tracker} onAddHabit={onAddHabit} onGoToTracker={() => setView('today')} />
          )}
          {view === 'insights' && <Dashboard tracker={tracker} entriesByDay={entriesByDay} />}
          {view === 'settings' && <Settings onResetGoal={onNewGoal} onLogout={logout} />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-stretch px-3 pt-2 pb-safe bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-md rounded-t-3xl shadow-[0_-4px_24px_rgba(30,41,59,0.1)]">
        {MOBILE_NAV.map((item) => {
          const active = view === item.key
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              aria-label={item.label}
              className={`tap flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 ${
                active
                  ? 'bg-primary text-on-primary -translate-y-1 shadow-lg shadow-primary/30'
                  : 'text-on-surface-variant'
              }`}
            >
              <Icon name={item.icon} filled className="text-2xl" />
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
