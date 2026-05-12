import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'

export function fmtDate(dateStr) {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'MMM dd, yyyy')
}

export function fmtDateShort(dateStr) {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'MM/dd/yy')
}

export function fmtRelative(dateStr) {
  if (!dateStr) return '—'
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export function isOverdue(dateStr) {
  if (!dateStr) return false
  return isBefore(new Date(dateStr), new Date())
}

export function isDueSoon(dateStr, days = 7) {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return isAfter(date, new Date()) && isBefore(date, addDays(new Date(), days))
}

export function statusColor(status) {
  const map = {
    not_started: 'text-dark-400',
    in_progress: 'text-brand-400',
    blocked: 'text-danger-400',
    completed: 'text-success-400',
    cancelled: 'text-dark-500',
    at_risk: 'text-warning-400',
    on_track: 'text-success-400',
    delayed: 'text-danger-400',
    open: 'text-warning-400',
    resolved: 'text-success-400',
    critical: 'text-danger-400',
    active: 'text-success-400',
  }
  return map[status] || 'text-dark-400'
}

export function priorityColor(priority) {
  const map = {
    critical: 'text-danger-400 bg-danger-500/10 border-danger-500/20',
    high: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
    medium: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    low: 'text-dark-400 bg-dark-500/10 border-dark-500/20',
  }
  return map[priority] || map.medium
}

export function healthDot(health) {
  const map = {
    green: 'bg-success-500',
    yellow: 'bg-warning-500',
    red: 'bg-danger-500',
  }
  return map[health] || 'bg-dark-500'
}
