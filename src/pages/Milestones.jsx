import { useEffect, useState } from 'react'
import { Plus, Milestone as MilestoneIcon } from 'lucide-react'
import { db } from '../lib/db'
import { useProject } from '../contexts/ProjectContext'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'
import { Card, CardHeader, CardTitle } from '../components/shared/Card'
import { StatusBadge, HealthIndicator } from '../components/shared/Badge'
import { PageLoading } from '../components/shared/Loading'
import { Input, Select, Textarea, FormRow } from '../components/shared/Input'
import { fmtDate, isOverdue } from '../utils/format'
import clsx from 'clsx'

const MILESTONE_TYPES = ['SOP','EVT','DVT','PVT','LVPT','Tooling','PPAP','Certification','Validation','Custom']

function MilestoneForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    code: initial.code || '',
    description: initial.description || '',
    type: initial.type || 'Custom',
    planned_date: initial.planned_date || '',
    forecast_date: initial.forecast_date || '',
    status: initial.status || 'not_started',
    health: initial.health || 'green',
    completion_pct: initial.completion_pct || 0,
    owner: initial.owner || '',
  })

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <FormRow cols={2}>
        <Input label="Milestone Name *" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        <Input label="Code" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="e.g. M-SOP-001" />
      </FormRow>

      <FormRow cols={2}>
        <Select label="Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
          {MILESTONE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select label="Health" value={form.health} onChange={(e) => set('health', e.target.value)}>
          <option value="green">Green — On Track</option>
          <option value="yellow">Yellow — At Risk</option>
          <option value="red">Red — Delayed</option>
        </Select>
      </FormRow>

      <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />

      <FormRow cols={2}>
        <Input label="Planned Date" type="date" value={form.planned_date} onChange={(e) => set('planned_date', e.target.value)} />
        <Input label="Forecast Date" type="date" value={form.forecast_date} onChange={(e) => set('forecast_date', e.target.value)} />
      </FormRow>

      <FormRow cols={2}>
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="not_started">Not Started</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
          <option value="delayed">Delayed</option>
          <option value="completed">Completed</option>
        </Select>
        <Input label="Owner" value={form.owner} onChange={(e) => set('owner', e.target.value)} placeholder="Milestone owner name" />
      </FormRow>

      <div>
        <label className="text-sm font-medium text-dark-300">Completion: {form.completion_pct}%</label>
        <input type="range" min={0} max={100} value={form.completion_pct}
          onChange={(e) => set('completion_pct', +e.target.value)}
          className="w-full mt-2 accent-brand-500" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>{initial.id ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  )
}

export function Milestones() {
  const { currentProject } = useProject()
  const [milestones, setMilestones] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMs, setEditMs] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (currentProject) loadData() }, [currentProject?.id])

  function loadData() {
    setLoading(true)
    setMilestones(db.milestones.list({ project_id: currentProject.id }).sort((a, b) => new Date(a.planned_date) - new Date(b.planned_date)))
    setTasks(db.tasks.list({ project_id: currentProject.id }))
    setLoading(false)
  }

  function handleSave(formData) {
    setSaving(true)
    const payload = { ...formData, project_id: currentProject.id }
    if (editMs) {
      const data = db.milestones.update(editMs.id, payload)
      if (data) setMilestones((prev) => prev.map((m) => m.id === data.id ? data : m))
    } else {
      const data = db.milestones.create(payload)
      setMilestones((prev) => [...prev, data].sort((a, b) => new Date(a.planned_date) - new Date(b.planned_date)))
    }
    setSaving(false)
    setModalOpen(false)
    setEditMs(null)
  }

  const getMilestoneTasks = (msId) => tasks.filter((t) => t.milestone_id === msId)
  const healthColors = { green: 'border-l-success-500', yellow: 'border-l-warning-500', red: 'border-l-danger-500' }

  if (loading) return <PageLoading />

  // Gantt-like timeline
  const minDate = milestones.length > 0 ? new Date(Math.min(...milestones.map((m) => new Date(m.planned_date || Date.now())))) : new Date()
  const maxDate = milestones.length > 0 ? new Date(Math.max(...milestones.map((m) => new Date(m.planned_date || Date.now())))) : new Date()
  const totalDays = Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24), 30)

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Milestones"
        subtitle={`${milestones.length} milestones — APQP/Automotive gate tracking`}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setEditMs(null); setModalOpen(true) }}>
            New Milestone
          </Button>
        }
      />

      {/* Timeline / Gantt */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline View</CardTitle>
            <div className="flex gap-3 text-xs text-dark-400">
              {[['bg-success-500','On Track'],['bg-warning-500','At Risk'],['bg-danger-500','Delayed']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${c}`} />{l}</div>
              ))}
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Today marker */}
              <div className="relative" style={{ height: `${milestones.length * 48}px` }}>
                {milestones.map((m, i) => {
                  const mDate = m.planned_date ? new Date(m.planned_date) : null
                  const pct = mDate ? Math.max(0, Math.min(100, ((mDate - minDate) / (totalDays * 1000 * 60 * 60 * 24)) * 100)) : 0
                  const colors = { green: 'bg-success-500', yellow: 'bg-warning-500', red: 'bg-danger-500', not_started: 'bg-dark-600' }
                  const color = colors[m.health] || 'bg-dark-600'

                  return (
                    <div key={m.id} className="absolute w-full flex items-center" style={{ top: `${i * 48 + 12}px` }}>
                      <div className="w-32 shrink-0 pr-3">
                        <p className="text-xs text-dark-300 font-medium truncate text-right">{m.name}</p>
                      </div>
                      <div className="flex-1 relative h-6 bg-dark-800 rounded-full">
                        <div className="absolute top-0 bottom-0 rounded-full opacity-30" style={{ left: 0, width: `${m.completion_pct || 0}%`, background: '#3b82f6' }} />
                        <div
                          className={`absolute w-4 h-4 rounded-full border-2 border-dark-950 top-1 -translate-x-2 ${color}`}
                          style={{ left: `${pct}%` }}
                          title={fmtDate(m.planned_date)}
                        />
                      </div>
                      <div className="w-24 shrink-0 pl-3 text-xs text-dark-500">{fmtDate(m.planned_date)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Milestone cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {milestones.map((m) => {
          const msTasks = getMilestoneTasks(m.id)
          const completedTasks = msTasks.filter((t) => t.status === 'completed').length
          const overdueTasks = msTasks.filter((t) => isOverdue(t.due_date) && t.status !== 'completed').length
          const deviation = m.planned_date && m.forecast_date
            ? Math.round((new Date(m.forecast_date) - new Date(m.planned_date)) / (1000 * 60 * 60 * 24))
            : null

          return (
            <div
              key={m.id}
              onClick={() => { setEditMs(m); setModalOpen(true) }}
              className={clsx('bg-dark-900 border border-dark-800 rounded-xl p-4 cursor-pointer hover:border-dark-700 transition-all border-l-4', healthColors[m.health] || 'border-l-dark-700')}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-dark-500">{m.type}</span>
                    {m.code && <span className="text-xs text-dark-600">• {m.code}</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-0.5">{m.name}</h3>
                </div>
                <StatusBadge status={m.status} />
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-dark-400 mb-1">
                  <span>Completion</span>
                  <span>{m.completion_pct || 0}%</span>
                </div>
                <div className="h-1.5 bg-dark-800 rounded-full">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${m.completion_pct || 0}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-dark-500">Planned</p>
                  <p className="text-dark-200 font-medium">{fmtDate(m.planned_date)}</p>
                </div>
                <div>
                  <p className="text-dark-500">Forecast</p>
                  <p className={clsx('font-medium', deviation > 0 ? 'text-danger-400' : 'text-dark-200')}>
                    {fmtDate(m.forecast_date)}
                    {deviation !== null && deviation !== 0 && (
                      <span className="ml-1">({deviation > 0 ? '+' : ''}{deviation}d)</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-dark-500">Tasks</p>
                  <p className="text-dark-200">{completedTasks}/{msTasks.length}</p>
                </div>
                <div>
                  <p className="text-dark-500">Overdue</p>
                  <p className={overdueTasks > 0 ? 'text-danger-400 font-medium' : 'text-dark-200'}>{overdueTasks}</p>
                </div>
              </div>

              {m.owner && (
                <p className="text-xs text-dark-500 mt-2 pt-2 border-t border-dark-800">
                  Owner: {m.owner}
                </p>
              )}
            </div>
          )
        })}

        {milestones.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-40 text-dark-500 text-sm">
            No milestones defined. Create your first milestone.
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditMs(null) }} title={editMs ? 'Edit Milestone' : 'New Milestone'} size="md">
        <MilestoneForm
          initial={editMs || {}}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditMs(null) }}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
