import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, AlertTriangle, Building2,
  Milestone, Users, FileText, Zap, BarChart3, Settings,
  ChevronLeft, ChevronRight, Radio, FolderOpen,
} from 'lucide-react'
import clsx from 'clsx'
import { useAppStore } from '../../lib/store'
import { useProject } from '../../contexts/ProjectContext'
import { HealthIndicator } from '../shared/Badge'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/risks', label: 'Risks', icon: AlertTriangle },
  { path: '/milestones', label: 'Milestones', icon: Milestone },
  { path: '/suppliers', label: 'Suppliers', icon: Building2 },
  { path: '/meetings', label: 'Meetings', icon: Users },
  { path: '/documents', label: 'Documents', icon: FolderOpen },
  { path: '/escalations', label: 'Escalations', icon: Zap },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const { currentProject, projects, setCurrentProject } = useProject()

  return (
    <aside
      className={clsx(
        'h-screen bg-dark-950 border-r border-dark-800 flex flex-col transition-all duration-300 shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-dark-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
          <Radio className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white whitespace-nowrap">PM Control</p>
            <p className="text-xs text-dark-500 whitespace-nowrap">Tower</p>
          </div>
        )}
      </div>

      {/* Project selector */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-b border-dark-800 shrink-0">
          <p className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-1.5 px-1">Project</p>
          <select
            value={currentProject?.id || ''}
            onChange={(e) => {
              const p = projects.find((x) => x.id === e.target.value)
              if (p) setCurrentProject(p)
            }}
            className="w-full bg-dark-800 border border-dark-700 text-dark-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50 cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            {projects.length === 0 && <option value="">No projects</option>}
          </select>
          {currentProject && (
            <div className="flex items-center gap-1.5 mt-2 px-1">
              <HealthIndicator health={currentProject.health} size="sm" />
              <span className="text-xs text-dark-500">{currentProject.code}</span>
              <span className="text-xs text-dark-600">•</span>
              <span className="text-xs text-dark-500">{currentProject.completion_pct}%</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map(({ path, label, icon: Icon, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg mb-0.5 transition-all duration-150 group',
                isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-dark-800 p-2 shrink-0">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-dark-800 text-dark-500 hover:text-dark-300 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
