import { useState } from 'react'
import { signIn, signUp } from '../services/authService'
import './Auth.css'

function Auth({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isSignUp) {
        const result = await signUp(email, password)
        if (result.session) onAuthSuccess()
        setMessage({ tone: 'success', text: 'Check your inbox to confirm your email, then return to sign in.' })
      } else {
        await signIn(email, password)
        onAuthSuccess()
      }
    } catch (error) {
      setMessage({ tone: 'error', text: error.message || 'We could not continue. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-labelledby="auth-brand">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span id="auth-brand">Renter</span>
        </div>
        <p className="eyebrow">A calmer way to search</p>
        <h1>Keep the places that feel right.</h1>
        <p>Discover homes at your pace, save the ones worth revisiting, and make the next move with confidence.</p>
      </section>

      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">Your account</p>
        <h2 id="auth-title">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
        <p className="auth-subtitle">{isSignUp ? 'Save decisions across every device.' : 'Pick up your home search where you left off.'}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-group" htmlFor="email">
            <span>Email address</span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="form-group" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength="8"
              required
            />
            {isSignUp && <small>Use at least 8 characters.</small>}
          </label>

          {message && <p className={`auth-message ${message.tone}`} role="status">{message.text}</p>}

          <button className="primary-button auth-button" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignUp ? 'Already have an account?' : 'New to Renter?'}{' '}
          <button
            className="inline-button"
            type="button"
            onClick={() => {
              setIsSignUp((current) => !current)
              setMessage(null)
            }}
          >
            {isSignUp ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </section>
    </main>
  )
}

export default Auth
