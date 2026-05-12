import clsx from 'clsx'

export function PageHeader({ title, subtitle, actions, tabs, activeTab, onTabChange }) {
  return (
    <div className="border-b border-dark-800 pb-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-dark-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {tabs && (
        <div className="flex gap-1 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                activeTab === tab.value
                  ? 'bg-brand-600 text-white'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={clsx('ml-1.5 text-xs', activeTab === tab.value ? 'text-brand-200' : 'text-dark-500')}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
