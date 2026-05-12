import clsx from 'clsx'

const baseInput = 'w-full bg-dark-800 border border-dark-700 text-dark-100 rounded-lg px-3 py-2 text-sm placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-colors'

export function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-dark-300">{label}</label>}
      <input className={clsx(baseInput, error && 'border-danger-500/50', className)} {...props} />
      {error && <p className="text-xs text-danger-400">{error}</p>}
    </div>
  )
}

export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-dark-300">{label}</label>}
      <select className={clsx(baseInput, 'cursor-pointer', error && 'border-danger-500/50', className)} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-danger-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-dark-300">{label}</label>}
      <textarea className={clsx(baseInput, 'resize-none', error && 'border-danger-500/50', className)} {...props} />
      {error && <p className="text-xs text-danger-400">{error}</p>}
    </div>
  )
}

export function FormRow({ children, cols = 2 }) {
  return (
    <div className={clsx('grid gap-4', cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-1')}>
      {children}
    </div>
  )
}
