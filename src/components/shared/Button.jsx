import clsx from 'clsx'

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white border border-brand-500/50',
  secondary: 'bg-dark-800 hover:bg-dark-700 text-dark-100 border border-dark-700',
  danger: 'bg-danger-600 hover:bg-danger-500 text-white border border-danger-500/50',
  ghost: 'bg-transparent hover:bg-dark-800 text-dark-300 hover:text-dark-100 border border-transparent',
  outline: 'bg-transparent hover:bg-dark-800 text-dark-200 border border-dark-700',
}

const sizes = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

export function Button({ children, variant = 'secondary', size = 'md', className, icon, loading, disabled, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {icon && !loading && icon}
      {children}
    </button>
  )
}
