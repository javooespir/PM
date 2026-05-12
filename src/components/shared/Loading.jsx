export function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizes[size]} border-2 border-dark-700 border-t-brand-500 rounded-full animate-spin`} />
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-dark-700 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-sm text-dark-500">Loading...</p>
      </div>
    </div>
  )
}
