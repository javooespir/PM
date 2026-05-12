import clsx from 'clsx'

const variants = {
  danger: 'bg-danger-500/15 text-danger-400 border border-danger-500/25',
  warning: 'bg-warning-500/15 text-warning-400 border border-warning-500/25',
  success: 'bg-success-500/15 text-success-400 border border-success-500/25',
  brand: 'bg-brand-500/15 text-brand-400 border border-brand-500/25',
  muted: 'bg-dark-700/50 text-dark-400 border border-dark-600/50',
  critical: 'bg-danger-500/15 text-danger-400 border border-danger-500/25',
  high: 'bg-warning-500/15 text-warning-400 border border-warning-500/25',
  medium: 'bg-brand-500/15 text-brand-400 border border-brand-500/25',
  low: 'bg-dark-700/50 text-dark-400 border border-dark-600/50',
}

export function Badge({ children, variant = 'muted', className, dot }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium', variants[variant], className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}

const dotColors = {
  danger: 'bg-danger-400',
  warning: 'bg-warning-400',
  success: 'bg-success-400',
  brand: 'bg-brand-400',
  muted: 'bg-dark-400',
  critical: 'bg-danger-400',
  high: 'bg-warning-400',
  medium: 'bg-brand-400',
  low: 'bg-dark-400',
}

export function StatusBadge({ status }) {
  const map = {
    not_started: { label: 'Not Started', variant: 'muted' },
    in_progress: { label: 'In Progress', variant: 'brand' },
    blocked: { label: 'Blocked', variant: 'danger' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'muted' },
    open: { label: 'Open', variant: 'warning' },
    mitigating: { label: 'Mitigating', variant: 'brand' },
    monitoring: { label: 'Monitoring', variant: 'warning' },
    closed: { label: 'Closed', variant: 'success' },
    at_risk: { label: 'At Risk', variant: 'warning' },
    on_track: { label: 'On Track', variant: 'success' },
    delayed: { label: 'Delayed', variant: 'danger' },
    acknowledged: { label: 'Acknowledged', variant: 'brand' },
    resolved: { label: 'Resolved', variant: 'success' },
    active: { label: 'Active', variant: 'success' },
    critical: { label: 'Critical', variant: 'danger' },
    inactive: { label: 'Inactive', variant: 'muted' },
  }
  const config = map[status] || { label: status, variant: 'muted' }
  return <Badge variant={config.variant} dot>{config.label}</Badge>
}

export function PriorityBadge({ priority }) {
  const map = {
    critical: { label: 'Critical', variant: 'danger' },
    high: { label: 'High', variant: 'warning' },
    medium: { label: 'Medium', variant: 'brand' },
    low: { label: 'Low', variant: 'muted' },
  }
  const config = map[priority] || { label: priority, variant: 'muted' }
  return <Badge variant={config.variant} dot>{config.label}</Badge>
}

export function HealthIndicator({ health, size = 'md' }) {
  const colors = { green: 'bg-success-500', yellow: 'bg-warning-500', red: 'bg-danger-500' }
  const sizes = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' }
  return (
    <span className={clsx('rounded-full inline-block animate-pulse-slow', colors[health] || 'bg-dark-500', sizes[size])} />
  )
}
