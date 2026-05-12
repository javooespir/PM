import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../lib/db'
import { validateAuth } from '../lib/github'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuthState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = db.getAuth()
    if (stored) setAuthState(stored)
    setLoading(false)
  }, [])

  async function signIn({ token, owner, repo, branch = 'main', displayName }) {
    const authObj = { token, owner, repo, branch, displayName }
    const ok = await validateAuth(authObj)
    if (!ok) return { error: { message: 'Invalid token or repository not found. Check your GitHub PAT and repo name.' } }
    db.setAuth(authObj)
    setAuthState(authObj)
    return { error: null }
  }

  function signOut() {
    db.clearAuth()
    setAuthState(null)
  }

  const profile = auth
    ? { full_name: auth.displayName || auth.owner, email: auth.owner, role: 'pm', area: auth.repo }
    : null

  return (
    <AuthContext.Provider value={{ auth, user: auth, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
