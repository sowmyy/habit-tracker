import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSignIn() {
    setError('')
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (e) {
      console.error(e)
      if (String(e?.message).startsWith('DRIVE_SCOPE_NOT_GRANTED')) {
        setError(
          'This app needs permission to save your habits to a sheet in your Drive. ' +
            'Please try again and allow Drive access on the consent screen.'
        )
      } else {
        setError('Sign-in failed. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-full bg-primary text-on-primary flex flex-col overflow-hidden">
      {/* Animated background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-inverse-primary/40 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-28 w-96 h-96 bg-[#F472B6]/25 blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-[#93C5FD]/30 blur-3xl animate-blob" style={{ animationDelay: '6s' }} />
      </div>

      <header className="relative px-6 py-5 pt-safe">
        <span className="text-headline-md font-headline-md font-bold">HabiTracker</span>
      </header>

      <main className="relative flex-1 flex flex-col justify-center items-center text-center px-6 pb-8">
        <div className="w-full max-w-md">
          {/* Playful habit-card cluster */}
          <div className="flex justify-center gap-3 mb-xl animate-float" aria-hidden="true">
            {[
              { c: '#FACC48', i: 'book' },
              { c: '#A3E048', i: 'self_improvement' },
              { c: '#F472B6', i: 'water_drop' },
              { c: '#93C5FD', i: 'directions_run' },
            ].map((t, idx) => (
              <div
                key={t.i}
                className="w-16 h-20 rounded-2xl flex items-end p-2 shadow-lg"
                style={{
                  backgroundColor: t.c,
                  transform: `rotate(${(idx - 1.5) * 6}deg) translateY(${idx % 2 ? 8 : 0}px)`,
                }}
              >
                <Icon name={t.i} filled className="text-2xl" style={{ color: '#111827' }} />
              </div>
            ))}
          </div>

          <h1 className="font-headline-xl text-headline-xl leading-tight mb-md">
            Build healthy habits with us
          </h1>
          <p className="font-body-lg text-body-lg text-on-primary/80 mb-xl">
            Track your day, build streaks, and stay motivated — one habit at a time.
          </p>

          <button
            onClick={handleSignIn}
            disabled={busy}
            className="tap w-full flex items-center justify-center gap-sm bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-2xl py-4 shadow-xl hover:bg-surface-container-low transition-colors disabled:opacity-70"
          >
            <GoogleIcon />
            {busy ? 'Signing in…' : 'Continue with Google'}
          </button>
          <p className="mt-md font-label-md text-label-md text-on-primary/80">
            Sign in with Google to start your journey
          </p>

          {error && (
            <p className="mt-lg font-label-md text-label-md bg-on-primary/10 rounded-xl p-md text-on-primary">
              {error}
            </p>
          )}
        </div>
      </main>

      <footer className="px-6 pb-8 text-center">
        <p className="font-label-sm text-label-sm text-on-primary/70">
          By continuing, you agree to our Terms of Service &amp; Privacy Policy.
        </p>
      </footer>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}
