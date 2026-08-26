import { createContext, useContext, useEffect, useState } from 'react'
import { initAuth, signIn, signOut } from '../lib/googleApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize GIS on load. We do NOT auto-request a token here: the OAuth
  // token popup must be opened from a user gesture, so sign-in happens when
  // the user clicks the button.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await initAuth()
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
