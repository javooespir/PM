import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Radio, Github, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'

export function Login() {
  const { user, signIn, loading } = useAuth()
  const [token, setToken] = useState('')
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [branch, setBranch] = useState('main')
  const [showToken, setShowToken] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await signIn({ token, owner, repo, branch, displayName })
    if (err) setError(err.message)
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
          <div className="flex items-center gap-2 mb-5">
            <Github className="w-5 h-5 text-dark-400" />
            <h2 className="text-lg font-semibold text-white">Connect your GitHub repo</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Smith"
              required
            />
            <Input
              label="GitHub Username"
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="your-username"
              required
            />
            <Input
              label="Repository Name"
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="pm-data"
              required
            />
            <Input
              label="Branch"
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-dark-300">Personal Access Token</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_••••••••••••••••••••"
                  required
                  className="w-full bg-dark-800 border border-dark-700 text-dark-100 rounded-lg px-3 py-2 pr-10 text-sm placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-danger-500/10 border border-danger-500/20 rounded-lg p-3 text-sm text-danger-400">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="md" className="w-full" loading={submitting}>
              Connect & Sign In
            </Button>
          </form>

          <button
            onClick={() => setShowHelp((v) => !v)}
            className="mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            How to get a GitHub PAT?
          </button>

          {showHelp && (
            <div className="mt-3 p-3 bg-dark-800 rounded-lg text-xs text-dark-400 space-y-1.5">
              <p className="text-dark-300 font-medium">Steps to create a Personal Access Token:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to github.com → Settings → Developer settings</li>
                <li>Personal access tokens → Tokens (classic) → Generate new token</li>
                <li>Select scopes: <span className="text-dark-200 font-mono">repo</span> (full control)</li>
                <li>Copy the token and paste it above</li>
              </ol>
              <p className="text-dark-500">The repo will be auto-created on first sync if it doesn't exist.</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-dark-600 mt-6">
          Your data is stored entirely in your GitHub repository
        </p>
      </div>
    </div>
  )
}
