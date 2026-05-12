import { useEffect, useState } from 'react'
import {
  CheckSquare, AlertTriangle, Clock, Zap, Milestone, Building2,
  TrendingUp, AlertCircle, Target, Shield,
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'
import { db } from '../lib/db'
import { useProject } from '../contexts/ProjectContext'
import { KPICard, Card, CardHeader, CardTitle } from '../components/shared/Card'
import { StatusBadge, PriorityBadge, HealthIndicator } from '../components/shared/Badge'
import { PageLoading } from '../components/shared/Loading'
import { fmtDate, isOverdue, isDueSoon } from '../utils/format'
import { getAgingDays } from '../utils/scoring'
import clsx from 'clsx'

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e']

export function Dashboard() {
  const { currentProject } = useProject()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentProject) fetchDashboardData()
  }, [currentProject?.id])

  function fetchDashboardData() {
    setLoading(true)
    const pid = currentProject.id

    const tasks = db.tasks.list({ project_id: pid })
    const risks = db.risks.list({ project_id: pid })
    const milestones = db.milestones.list({ project_id: pid }).sort((a, b) => new Date(a.planned_date) - new Date(b.planned_date))
    const suppliers = db.suppliers.list({ project_id: pid })
    const escalations = db.escalations.list({ project_id: pid }).filter((e) => e.status !== 'resolved')

    const openTasks = tasks.filter((t) => !['completed', 'cancelled'].includes(t.status))
    const overdueTasks = openTasks.filter((t) => isOverdue(t.due_date))
    const criticalTasks = tasks.filter((t) => t.priority === 'critical' && !['completed', 'cancelled'].includes(t.status))
    const dueSoonTasks = openTasks.filter((t) => isDueSoon(t.due_date, 7) && !isOverdue(t.due_date))
    const highRisks = risks.filter((r) => r.rpn >= 100 && r.status !== 'closed')
    const criticalSuppliers = suppliers.filter((s) => s.status === 'critical')
    const atRiskMilestones = milestones.filter((m) => ['at_risk', 'delayed'].includes(m.status))

    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const completionPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

    // Task status distribution
    const taskDistribution = [
      { name: 'Critical', value: tasks.filter((t) => t.priority === 'critical').length },
      { name: 'High', value: tasks.filter((t) => t.priority === 'high').length },
      { name: 'Medium', value: tasks.filter((t) => t.priority === 'medium').length },
      { name: 'Low', value: tasks.filter((t) => t.priority === 'low').length },
    ]

    // Risk heatmap data
    const riskMatrix = risks.map((r) => ({
      name: r.title.slice(0, 20),
      rpn: r.rpn,
      probability: r.probability,
      severity: r.severity,
    }))

    setData({
      tasks, risks, milestones, suppliers, escalations,
      openTasks, overdueTasks, criticalTasks, dueSoonTasks,
      highRisks, criticalSuppliers, atRiskMilestones,
      completionPct, taskDistribution, riskMatrix,
    })
    setLoading(false)
  }

  useEffect(() => {
    if (currentProject) fetchDashboardData()
  }, [currentProject?.id])

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-dark-400 mb-2">No project selected</p>
          <p className="text-sm text-dark-600">Go to Settings to create a project</p>
        </div>
      </div>
    )
  }

  if (loading) return <PageLoading />

  const { openTasks, overdueTasks, criticalTasks, dueSoonTasks, highRisks, criticalSuppliers, atRiskMilestones, completionPct, taskDistribution, milestones, escalations } = data

  // Overall health
  const health = overdueTasks.length > 5 || highRisks.length > 3 ? 'red'
    : overdueTasks.length > 2 || highRisks.length > 1 ? 'yellow'
    : 'green'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <HealthIndicator health={health} size="lg" />
            <h1 className="text-2xl font-bold text-white">{currentProject.name}</h1>
          </div>
          <p className="text-sm text-dark-400 mt-0.5">
            {currentProject.code} • {currentProject.type} • SOP: {fmtDate(currentProject.sop_date)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{completionPct}%</p>
          <p className="text-xs text-dark-500">Completion</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700"
          style={{ width: `${completionPct}%` }}
        />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Open Tasks"
          value={openTasks.length}
          subtitle={`${dueSoonTasks.length} due this week`}
          icon={<CheckSquare className="w-5 h-5" />}
          color="brand"
        />
        <KPICard
          title="Overdue Tasks"
          value={overdueTasks.length}
          subtitle={`${criticalTasks.length} critical`}
          icon={<Clock className="w-5 h-5" />}
          color={overdueTasks.length > 0 ? 'danger' : 'success'}
        />
        <KPICard
          title="High Risks"
          value={highRisks.length}
          subtitle={`RPN ≥ 100`}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={highRisks.length > 0 ? 'danger' : 'success'}
        />
        <KPICard
          title="Active Escalations"
          value={escalations.length}
          subtitle="Requiring attention"
          icon={<Zap className="w-5 h-5" />}
          color={escalations.length > 0 ? 'warning' : 'success'}
        />
        <KPICard
          title="Milestones at Risk"
          value={atRiskMilestones.length}
          subtitle={`of ${milestones.length} total`}
          icon={<Milestone className="w-5 h-5" />}
          color={atRiskMilestones.length > 0 ? 'warning' : 'success'}
        />
        <KPICard
          title="Critical Suppliers"
          value={criticalSuppliers.length}
          subtitle="Need attention"
          icon={<Building2 className="w-5 h-5" />}
          color={criticalSuppliers.length > 0 ? 'danger' : 'success'}
        />
        <KPICard
          title="Total Tasks"
          value={data.tasks.length}
          subtitle={`${data.tasks.filter((t) => t.status === 'completed').length} completed`}
          icon={<Target className="w-5 h-5" />}
          color="muted"
        />
        <KPICard
          title="Total Risks"
          value={data.risks.length}
          subtitle={`${data.risks.filter((r) => r.status === 'closed').length} closed`}
          icon={<Shield className="w-5 h-5" />}
          color="muted"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task distribution pie */}
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
          </CardHeader>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {taskDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {taskDistribution.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-dark-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </Card>

        {/* Milestone timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Milestone Timeline</CardTitle>
          </CardHeader>
          <div className="space-y-2.5 max-h-52 overflow-y-auto">
            {milestones.length === 0 && (
              <p className="text-sm text-dark-500 text-center py-6">No milestones defined</p>
            )}
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className={clsx('w-2 h-2 rounded-full shrink-0', {
                  'bg-success-500': m.health === 'green',
                  'bg-warning-500': m.health === 'yellow',
                  'bg-danger-500': m.health === 'red',
                  'bg-dark-600': !m.health,
                })} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-dark-200 font-medium truncate">{m.name}</span>
                    <span className="text-xs text-dark-500 shrink-0">{fmtDate(m.planned_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-dark-800 rounded-full">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${m.completion_pct || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-dark-600 w-8 text-right">{m.completion_pct || 0}%</span>
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Overdue Tasks</CardTitle>
            <span className="text-xs text-danger-400 font-medium">{overdueTasks.length} items</span>
          </CardHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {overdueTasks.length === 0 && (
              <p className="text-sm text-dark-500 text-center py-6">No overdue tasks</p>
            )}
            {overdueTasks.slice(0, 8).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2.5 bg-dark-800/40 rounded-lg">
                <PriorityBadge priority={task.priority} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-200 truncate">{task.title}</p>
                  <p className="text-xs text-danger-400 mt-0.5">
                    {getAgingDays(task.due_date)}d overdue — due {fmtDate(task.due_date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active escalations */}
        <Card>
          <CardHeader>
            <CardTitle>Active Escalations</CardTitle>
            <span className={clsx('text-xs font-medium', escalations.length > 0 ? 'text-warning-400' : 'text-success-400')}>
              {escalations.length} open
            </span>
          </CardHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {escalations.length === 0 && (
              <p className="text-sm text-dark-500 text-center py-6">No active escalations</p>
            )}
            {escalations.map((esc) => (
              <div key={esc.id} className="flex items-center gap-3 p-2.5 bg-dark-800/40 rounded-lg">
                <div className={clsx('w-2 h-2 rounded-full shrink-0', {
                  'bg-danger-500': esc.severity === 'critical',
                  'bg-warning-500': esc.severity === 'high',
                  'bg-brand-500': esc.severity === 'medium',
                })} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-200 truncate">{esc.title}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{esc.trigger_reason}</p>
                </div>
                <StatusBadge status={esc.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
