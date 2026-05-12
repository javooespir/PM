import { useEffect, useState } from 'react'
import { Download, BarChart3, FileText, TrendingUp, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import { db } from '../lib/db'
import { useProject } from '../contexts/ProjectContext'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/shared/Button'
import { Card, CardHeader, CardTitle, KPICard } from '../components/shared/Card'
import { PageLoading } from '../components/shared/Loading'
import { fmtDate, isOverdue } from '../utils/format'
import { getRPNSeverity } from '../utils/scoring'
import clsx from 'clsx'

const COLORS = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#22c55e' }
const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function printReport() { window.print() }

export function Reports() {
  const { currentProject } = useProject()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('executive')

  useEffect(() => { if (currentProject) loadData() }, [currentProject?.id])

  function loadData() {
    setLoading(true)
    const pid = currentProject.id

    const tasks = db.tasks.list({ project_id: pid })
    const risks = db.risks.list({ project_id: pid })
    const milestones = db.milestones.list({ project_id: pid }).sort((a, b) => new Date(a.planned_date) - new Date(b.planned_date))
    const suppliers = db.suppliers.list({ project_id: pid })
    const escalations = db.escalations.list({ project_id: pid })

    // Task by status
    const taskByStatus = ['not_started','in_progress','blocked','completed','cancelled'].map((s) => ({
      name: s.replace('_', ' '),
      count: tasks.filter((t) => t.status === s).length,
    }))

    // Task by priority
    const taskByPriority = ['critical','high','medium','low'].map((p) => ({
      name: p,
      count: tasks.filter((t) => t.priority === p).length,
      fill: COLORS[p],
    }))

    // Risk by category
    const categories = [...new Set(risks.map((r) => r.category))]
    const riskByCategory = categories.map((c) => ({
      name: c,
      count: risks.filter((r) => r.category === c).length,
      avgRPN: Math.round(risks.filter((r) => r.category === c).reduce((s, r) => s + r.rpn, 0) / (risks.filter((r) => r.category === c).length || 1)),
    }))

    // Milestone health
    const msHealth = [
      { name: 'On Track', value: milestones.filter((m) => m.health === 'green').length, fill: '#22c55e' },
      { name: 'At Risk', value: milestones.filter((m) => m.health === 'yellow').length, fill: '#f59e0b' },
      { name: 'Delayed', value: milestones.filter((m) => m.health === 'red').length, fill: '#ef4444' },
    ]

    const overdueTasks = tasks.filter((t) => isOverdue(t.due_date) && !['completed','cancelled'].includes(t.status))
    const topRisks = risks.filter((r) => r.status !== 'closed').sort((a, b) => b.rpn - a.rpn).slice(0, 10)
    const openEscalations = escalations.filter((e) => e.status !== 'resolved')

    setData({ tasks, risks, milestones, suppliers, escalations, overdueTasks, topRisks, openEscalations, taskByStatus, taskByPriority, riskByCategory, msHealth })
    setLoading(false)
  }

  if (loading) return <PageLoading />

  const { tasks, risks, milestones, suppliers, overdueTasks, topRisks, openEscalations, taskByStatus, taskByPriority, riskByCategory, msHealth } = data
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const completionPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Reports"
        subtitle={`${currentProject?.name} — Generated ${fmtDate(new Date())}`}
        tabs={[
          { value: 'executive', label: 'Executive Summary' },
          { value: 'tasks', label: 'Task Analysis' },
          { value: 'risks', label: 'Risk Report' },
          { value: 'milestones', label: 'Milestone Status' },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        actions={
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={printReport}>
            Export PDF
          </Button>
        }
      />

      {/* Executive Summary */}
      {tab === 'executive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Completion" value={`${completionPct}%`} icon={<TrendingUp className="w-5 h-5" />} color="brand" />
            <KPICard title="Overdue Tasks" value={overdueTasks.length} icon={<AlertTriangle className="w-5 h-5" />} color={overdueTasks.length > 0 ? 'danger' : 'success'} />
            <KPICard title="High Risks" value={risks.filter((r) => r.rpn >= 100 && r.status !== 'closed').length} icon={<AlertTriangle className="w-5 h-5" />} color="warning" />
            <KPICard title="Open Escalations" value={openEscalations.length} icon={<BarChart3 className="w-5 h-5" />} color={openEscalations.length > 0 ? 'danger' : 'success'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Task Status Overview</CardTitle></CardHeader>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskByStatus} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>Milestone Health</CardTitle></CardHeader>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={msHealth} cx="50%" cy="50%" outerRadius={70} paddingAngle={4} dataKey="value">
                      {msHealth.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }} />
                    <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Open issues summary */}
          <Card>
            <CardHeader>
              <CardTitle>Top Overdue Tasks</CardTitle>
              <span className="text-xs text-danger-400">{overdueTasks.length} items</span>
            </CardHeader>
            <div className="space-y-2">
              {overdueTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2 bg-dark-800/40 rounded-lg text-sm">
                  <span className={clsx('px-2 py-0.5 text-xs rounded font-medium', {
                    'bg-danger-500/15 text-danger-400': t.priority === 'critical',
                    'bg-warning-500/15 text-warning-400': t.priority === 'high',
                  })}>
                    {t.priority}
                  </span>
                  <span className="flex-1 text-dark-200 truncate">{t.title}</span>
                  <span className="text-danger-400 text-xs shrink-0">Due {fmtDate(t.due_date)}</span>
                </div>
              ))}
              {overdueTasks.length === 0 && <p className="text-sm text-dark-500 text-center py-4">No overdue tasks</p>}
            </div>
          </Card>
        </div>
      )}

      {/* Task Analysis */}
      {tab === 'tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Tasks by Priority</CardTitle></CardHeader>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskByPriority}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {taskByPriority.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>SOP & Safety Impact</CardTitle></CardHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between p-3 bg-warning-500/10 border border-warning-500/20 rounded-lg">
                  <span className="text-sm text-warning-300">Tasks affecting SOP</span>
                  <span className="text-xl font-bold text-warning-400">{tasks.filter((t) => t.affects_sop).length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-danger-500/10 border border-danger-500/20 rounded-lg">
                  <span className="text-sm text-danger-300">Safety issues</span>
                  <span className="text-xl font-bold text-danger-400">{tasks.filter((t) => t.is_safety).length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                  <span className="text-sm text-dark-300">Blocked tasks</span>
                  <span className="text-xl font-bold text-dark-200">{tasks.filter((t) => t.status === 'blocked').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                  <span className="text-sm text-dark-300">Supplier-linked</span>
                  <span className="text-xl font-bold text-dark-200">{tasks.filter((t) => t.supplier_id).length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Risk Report */}
      {tab === 'risks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Risk by Category</CardTitle></CardHeader>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Count" />
                    <Bar dataKey="avgRPN" fill="#ef4444" radius={[4, 4, 0, 0]} name="Avg RPN" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>Top 10 Risks by RPN</CardTitle></CardHeader>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {topRisks.map((r, i) => {
                  const info = getRPNSeverity(r.rpn)
                  return (
                    <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg">
                      <span className="text-xs text-dark-500 w-4">{i + 1}.</span>
                      <span className={clsx('text-xs font-mono font-bold px-1.5 py-0.5 rounded shrink-0', {
                        'bg-danger-500/15 text-danger-400': info.color === 'danger',
                        'bg-warning-500/15 text-warning-400': info.color === 'warning',
                        'bg-brand-500/15 text-brand-400': info.color === 'brand',
                      })}>
                        {r.rpn}
                      </span>
                      <span className="text-sm text-dark-200 truncate flex-1">{r.title}</span>
                      <span className="text-xs text-dark-500 capitalize shrink-0">{r.category}</span>
                    </div>
                  )
                })}
                {topRisks.length === 0 && <p className="text-sm text-dark-500 text-center py-4">No risks</p>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Milestone Status */}
      {tab === 'milestones' && (
        <div className="space-y-4">
          {milestones.map((m) => {
            const deviation = m.planned_date && m.forecast_date
              ? Math.round((new Date(m.forecast_date) - new Date(m.planned_date)) / (1000 * 60 * 60 * 24))
              : null

            return (
              <Card key={m.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={clsx('w-3 h-3 rounded-full', {
                      'bg-success-500': m.health === 'green',
                      'bg-warning-500': m.health === 'yellow',
                      'bg-danger-500': m.health === 'red',
                    })} />
                    <div>
                      <p className="font-semibold text-white">{m.name}</p>
                      <p className="text-xs text-dark-500">{m.type} • Planned: {fmtDate(m.planned_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-dark-500">Forecast</p>
                      <p className={clsx('font-medium', deviation > 0 ? 'text-danger-400' : 'text-dark-200')}>
                        {fmtDate(m.forecast_date)}
                        {deviation !== null && deviation !== 0 && ` (${deviation > 0 ? '+' : ''}${deviation}d)`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-dark-500">Complete</p>
                      <p className="font-medium text-dark-200">{m.completion_pct}%</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-dark-800 rounded-full">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${m.completion_pct}%` }} />
                </div>
              </Card>
            )
          })}
          {milestones.length === 0 && <p className="text-center text-dark-500 py-12">No milestones defined</p>}
        </div>
      )}
    </div>
  )
}
