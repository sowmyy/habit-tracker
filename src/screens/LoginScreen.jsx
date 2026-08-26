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
    <div className="min-h-full flex items-center justify-center bg-background p-margin-mobile">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-[2rem] card-shadow p-xl sm:p-10 text-center">
        {/* Logo */}
        <div className="mx-auto mb-lg w-20 h-20 rounded-[1.25rem] bg-primary-container flex items-center justify-center shadow-lg shadow-primary-container/40">
          <Icon name="eco" filled className="text-primary text-4xl" />
        </div>

        <h1 className="font-headline-xl text-headline-xl text-on-surface mb-md">HabiTracker</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl leading-7">
          Begin your mindful journey
          <br />
          toward a balanced daily routine.
        </p>

        <button
          onClick={handleSignIn}
          disabled={busy}
          className="w-full flex items-center justify-center gap-sm bg-surface-container-lowest border border-surface-container-highest text-on-surface font-label-md text-label-md rounded-xl py-4 hover:bg-surface-container-low transition-colors disabled:opacity-60"
        >
          <GoogleIcon />
          {busy ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && (
          <p className="mt-md text-error font-label-md text-label-md bg-error-container rounded-xl p-md">
            {error}
          </p>
        )}

        <p className="mt-xl font-label-sm text-label-sm text-on-surface-variant">
          By continuing, you agree to our Terms of Service &amp; Privacy Policy.
        </p>
      </div>
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
