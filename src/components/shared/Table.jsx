import clsx from 'clsx'

export function Table({ children, className }) {
  return (
    <div className={clsx('overflow-x-auto rounded-xl border border-dark-800', className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead className="bg-dark-900/80 border-b border-dark-800">
      <tr>{children}</tr>
    </thead>
  )
}

export function Th({ children, className }) {
  return (
    <th className={clsx('px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider whitespace-nowrap', className)}>
      {children}
    </th>
  )
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-dark-800/50 bg-dark-950/30">{children}</tbody>
}

export function Tr({ children, onClick, className }) {
  return (
    <tr
      onClick={onClick}
      className={clsx('transition-colors', onClick && 'cursor-pointer hover:bg-dark-800/40', className)}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className }) {
  return <td className={clsx('px-4 py-3 text-dark-200', className)}>{children}</td>
}

export function EmptyRow({ colSpan, message = 'No data found' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-dark-500 text-sm">{message}</td>
    </tr>
  )
}
