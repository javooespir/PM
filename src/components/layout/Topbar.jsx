import { useState, useEffect } from 'react'
import { Search, Bell, LogOut, ChevronDown, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useProject } from '../../contexts/ProjectContext'
import { db, onSyncStatus, getSyncStatus } from '../../lib/db'
import clsx from 'clsx'

function SyncIndicator() {
  const [status, setStatus] = useState(getSyncStatus())

  useEffect(() => onSyncStatus(setStatus), [])

  if (status === 'idle') return null

  return (
    <div className={clsx('flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg', {
      'text-dark-400': status === 'syncing',
      'text-success-400 bg-success-500/10': status === 'ok',
      'text-danger-400 bg-danger-500/10': status === 'error',
    })}>
      {status === 'syncing' && <RefreshCw className="w-3 h-3 animate-spin" />}
      {status === 'ok' && <Cloud className="w-3 h-3" />}
      {status === 'error' && <CloudOff className="w-3 h-3" />}
      <span className="hidden sm:inline">
        {status === 'syncing' ? 'Syncing...' : status === 'ok' ? 'Saved' : 'Sync error'}
      </span>
    </div>
  )
}

export function Topbar() {
  const { profile, signOut } = useAuth()
  const { currentProject } = useProject()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <header className="h-14 bg-dark-950 border-b border-dark-800 flex items-center gap-4 px-5 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, risks, documents..."
            className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-dark-200 placeholder:text-dark-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Sync status */}
        <SyncIndicator />

        {/* Notifications placeholder */}
        <button className="relative p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {profile?.full_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-dark-200 leading-none">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-dark-500 mt-0.5">{profile?.area || 'GitHub'}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-dark-500" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-dark-800">
                <p className="text-sm font-medium text-white">{profile?.full_name}</p>
                <p className="text-xs text-dark-500">{profile?.area}</p>
              </div>
              <button
                onClick={() => { signOut(); setUserMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:bg-dark-800 hover:text-danger-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
