import { createContext, useContext, useEffect, useState } from 'react'
import { initAuth, signIn, signOut, trySilentSignIn, wasAuthed } from '../lib/googleApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize GIS on load. If this browser has signed in before, restore the
  // session silently (hidden iframe, no prompt). New users see the landing page
  // and sign in with a click (the OAuth popup needs that user gesture).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await initAuth()
        if (wasAuthed()) {
          const restored = await trySilentSignIn()
          if (!cancelled && restored) setUser(restored)
        }
      } catch (e) {
        console.error('auth init failed', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const value = {
    user,
    loading,
    signInWithGoogle: async () => {
      const u = await signIn()
      setUser(u)
      return u
    },
    logout: () => {
      signOut()
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
