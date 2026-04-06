import { useState } from 'react'
import type { UserRole } from '../../types/finance'
import { useDashboardStore } from '../../store/useDashboardStore'

type AuthMode = 'register' | 'login'

export function AuthAccessPanel() {
  const currentUser = useDashboardStore((state) => state.currentUser)
  const authToken = useDashboardStore((state) => state.authToken)
  const registerAccount = useDashboardStore((state) => state.registerAccount)
  const loginAccount = useDashboardStore((state) => state.loginAccount)
  const logoutAccount = useDashboardStore((state) => state.logoutAccount)

  const [mode, setMode] = useState<AuthMode>('login')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerRole, setRegisterRole] = useState<UserRole>('viewer')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resetFeedback = () => {
    setMessage(null)
    setErrorMessage(null)
  }

  const submitRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetFeedback()

    try {
      registerAccount({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
      })

      setMessage('Registration saved in local storage. Now login to generate token.')
      setRegisterName('')
      setRegisterEmail('')
      setRegisterPassword('')
      setRegisterRole('viewer')
      setMode('login')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to register user.')
    }
  }

  const submitLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetFeedback()

    try {
      const user = loginAccount({ email: loginEmail, password: loginPassword })
      setMessage(`Welcome ${user.name}. Login token stored successfully.`)
      setLoginEmail('')
      setLoginPassword('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to login.')
    }
  }

  const handleLogout = () => {
    logoutAccount()
    resetFeedback()
    setMessage('Logged out. Login token has been removed from storage.')
  }

  if (currentUser && authToken) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Auth session
        </p>
        <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">
          Signed in as {currentUser.name} ({currentUser.role})
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Token: {authToken.slice(0, 18)}...
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 rounded-lg border border-[var(--negative)] bg-[var(--negative)]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--negative)]"
        >
          Logout
        </button>

        {message ? (
          <p className="mt-2 text-xs text-[var(--text-muted)]">{message}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            resetFeedback()
            setMode('login')
          }}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
            mode === 'login'
              ? 'bg-[var(--accent)] text-white'
              : 'border border-[var(--border)] text-[var(--text-muted)]'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            resetFeedback()
            setMode('register')
          }}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
            mode === 'register'
              ? 'bg-[var(--accent)] text-white'
              : 'border border-[var(--border)] text-[var(--text-muted)]'
          }`}
        >
          Register
        </button>
      </div>

      {mode === 'register' ? (
        <form className="mt-3 grid gap-2" onSubmit={submitRegister}>
          <input
            type="text"
            value={registerName}
            onChange={(event) => setRegisterName(event.target.value)}
            placeholder="Name"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm outline-none"
            required
          />
          <input
            type="email"
            value={registerEmail}
            onChange={(event) => setRegisterEmail(event.target.value)}
            placeholder="Email"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm outline-none"
            required
          />
          <input
            type="password"
            value={registerPassword}
            onChange={(event) => setRegisterPassword(event.target.value)}
            placeholder="Password"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm outline-none"
            required
          />
          <select
            value={registerRole}
            onChange={(event) => setRegisterRole(event.target.value as UserRole)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm outline-none"
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
          >
            Create account
          </button>
        </form>
      ) : (
        <form className="mt-3 grid gap-2" onSubmit={submitLogin}>
          <input
            type="email"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            placeholder="Email"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm outline-none"
            required
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="Password"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm outline-none"
            required
          />
          <button
            type="submit"
            className="rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
          >
            Login and store token
          </button>
        </form>
      )}

      {errorMessage ? (
        <p className="mt-2 text-xs font-medium text-[var(--negative)]">{errorMessage}</p>
      ) : null}
      {message ? <p className="mt-2 text-xs text-[var(--text-muted)]">{message}</p> : null}
    </div>
  )
}
