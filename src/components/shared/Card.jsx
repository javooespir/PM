import clsx from 'clsx'

export function Card({ children, className, hover, onClick }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-dark-900 border border-dark-800 rounded-xl p-4',
        hover && 'hover:border-dark-700 hover:bg-dark-850 transition-all duration-150 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return <div className={clsx('flex items-center justify-between mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }) {
  return <h3 className={clsx('text-sm font-semibold text-dark-200 uppercase tracking-wider', className)}>{children}</h3>
}

export function KPICard({ title, value, subtitle, icon, trend, color = 'brand', onClick }) {
  const colors = {
    brand: { icon: 'text-brand-400 bg-brand-500/10', border: 'border-brand-500/20' },
    danger: { icon: 'text-danger-400 bg-danger-500/10', border: 'border-danger-500/20' },
    warning: { icon: 'text-warning-400 bg-warning-500/10', border: 'border-warning-500/20' },
    success: { icon: 'text-success-400 bg-success-500/10', border: 'border-success-500/20' },
    muted: { icon: 'text-dark-400 bg-dark-800', border: 'border-dark-700' },
  }
  const c = colors[color] || colors.brand

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-dark-900 border rounded-xl p-4 flex items-start gap-3',
        'transition-all duration-150',
        c.border,
        onClick && 'cursor-pointer hover:brightness-110'
      )}
    >
      {icon && (
        <div className={clsx('p-2.5 rounded-lg shrink-0', c.icon)}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-dark-400 font-medium uppercase tracking-wider truncate">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-dark-500 mt-0.5">{subtitle}</p>}
        {trend !== undefined && (
          <p className={clsx('text-xs mt-1 font-medium', trend >= 0 ? 'text-danger-400' : 'text-success-400')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)} from last week
          </p>
        )}
      </div>
    </div>
  )
}
