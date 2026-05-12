import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Radio, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'

export function Login() {
  const { user, signIn, signUp, loading } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    if (mode === 'login') {
      const { error: err } = await signIn(email, password)
      if (err) setError(err.message)
    } else {
      const { error: err } = await signUp(email, password, fullName)
      if (err) setError(err.message)
      else setSuccess('Account created! Check your email to confirm.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">PM Control Tower</h1>
            <p className="text-sm text-dark-400 mt-1">Industrial Program Management</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">
            {mode === 'login' ? 'Sign in to your account' : 'Create account'}
          </h2>

          {success ? (
            <div className="bg-success-500/10 border border-success-500/20 rounded-lg p-3 text-sm text-success-400 mb-4">
              {success}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  required
                />
              )}
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-dark-300">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-dark-800 border border-dark-700 text-dark-100 rounded-lg px-3 py-2 pr-10 text-sm placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-danger-500/10 border border-danger-500/20 rounded-lg p-3 text-sm text-danger-400">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" size="md" className="w-full" loading={submitting}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
              className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-dark-600 mt-6">
          Designed for Automotive & Aerospace Program Management
        </p>
      </div>
    </div>
  )
}
