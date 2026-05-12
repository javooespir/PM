import { useEffect, useState } from 'react'
import { Plus, Zap, AlertTriangle, CheckCircle } from 'lucide-react'
import { db } from '../lib/db'
import { useProject } from '../contexts/ProjectContext'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '../components/shared/Table'
import { StatusBadge, Badge, PriorityBadge } from '../components/shared/Badge'
import { PageLoading } from '../components/shared/Loading'
import { Input, Select, Textarea, FormRow } from '../components/shared/Input'
import { KPICard, Card, CardHeader, CardTitle } from '../components/shared/Card'
import { fmtDate, isOverdue } from '../utils/format'
import clsx from 'clsx'

function EscalationForm({ initial = {}, tasks = [], risks = [], suppliers = [], milestones = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    trigger_reason: initial.trigger_reason || '',
    severity: initial.severity || 'high',
    status: initial.status || 'open',
    owner: initial.owner || '',
    escalated_to: initial.escalated_to || '',
    due_date: initial.due_date || '',
    task_id: initial.task_id || '',
    risk_id: initial.risk_id || '',
    supplier_id: initial.supplier_id || '',
    milestone_id: initial.milestone_id || '',
    resolution_notes: initial.resolution_notes || '',
  })

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <Input label="Escalation Title *" value={form.title} onChange={(e) => set('title', e.target.value)} required />
      <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
      <Input label="Trigger Reason" value={form.trigger_reason} onChange={(e) => set('trigger_reason', e.target.value)} placeholder="What triggered this escalation?" />

      <FormRow cols={2}>
        <Select label="Severity" value={form.severity} onChange={(e) => set('severity', e.target.value)}>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
        </Select>
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </Select>
      </FormRow>

      <FormRow cols={2}>
        <Input label="Owner" value={form.owner} onChange={(e) => set('owner', e.target.value)} placeholder="Owner name" />
        <Input label="Escalated To" value={form.escalated_to} onChange={(e) => set('escalated_to', e.target.value)} placeholder="Person name" />
      </FormRow>

      <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Linked Task" value={form.task_id} onChange={(e) => set('task_id', e.target.value)}>
          <option value="">None</option>
          {tasks.map((t) => <option key={t.id} value={t.id}>{t.title.slice(0,30)}</option>)}
        </Select>
        <Select label="Linked Risk" value={form.risk_id} onChange={(e) => set('risk_id', e.target.value)}>
          <option value="">None</option>
          {risks.map((r) => <option key={r.id} value={r.id}>{r.title.slice(0,30)}</option>)}
        </Select>
        <Select label="Linked Supplier" value={form.supplier_id} onChange={(e) => set('supplier_id', e.target.value)}>
          <option value="">None</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Select label="Linked Milestone" value={form.milestone_id} onChange={(e) => set('milestone_id', e.target.value)}>
          <option value="">None</option>
          {milestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </Select>
      </div>

      {form.status === 'resolved' && (
        <Textarea label="Resolution Notes" value={form.resolution_notes} onChange={(e) => set('resolution_notes', e.target.value)} rows={2} />
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>{initial.id ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  )
}

const SEVERITY_COLORS = {
  critical: 'border-l-danger-500 bg-danger-500/5',
  high: 'border-l-warning-500 bg-warning-500/5',
  medium: 'border-l-brand-500 bg-brand-500/5',
}

export function Escalations() {
  const { currentProject } = useProject()
  const [escalations, setEscalations] = useState([])
  const [tasks, setTasks] = useState([])
  const [risks, setRisks] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editEsc, setEditEsc] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('open')

  useEffect(() => { if (currentProject) loadData() }, [currentProject?.id])

  function loadData() {
    setLoading(true)
    const pid = currentProject.id
    setEscalations(db.escalations.list({ project_id: pid }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    setTasks(db.tasks.list({ project_id: pid }))
    setRisks(db.risks.list({ project_id: pid }))
    setSuppliers(db.suppliers.list({ project_id: pid }))
    setMilestones(db.milestones.list({ project_id: pid }))
    setLoading(false)
  }

  function handleSave(formData) {
    setSaving(true)
    const payload = { ...formData, project_id: currentProject.id }
    if (editEsc) {
      const data = db.escalations.update(editEsc.id, payload)
      if (data) setEscalations((prev) => prev.map((e) => e.id === data.id ? data : e))
    } else {
      const data = db.escalations.create(payload)
      setEscalations((prev) => [data, ...prev])
    }
    setSaving(false)
    setModalOpen(false)
    setEditEsc(null)
  }

  function quickResolve(esc) {
    const data = db.escalations.update(esc.id, { status: 'resolved', resolved_date: new Date().toISOString() })
    if (data) setEscalations((prev) => prev.map((e) => e.id === data.id ? data : e))
  }

  const open = escalations.filter((e) => e.status !== 'resolved')
  const critical = escalations.filter((e) => e.severity === 'critical' && e.status !== 'resolved')
  const autoGenerated = escalations.filter((e) => e.auto_generated && e.status !== 'resolved')

  const filtered = escalations.filter((e) => {
    if (tab === 'open') return e.status !== 'resolved'
    if (tab === 'critical') return e.severity === 'critical'
    if (tab === 'auto') return e.auto_generated
    if (tab === 'resolved') return e.status === 'resolved'
    return true
  })

  if (loading) return <PageLoading />

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Escalation Engine"
        subtitle={`${open.length} active escalations — ${autoGenerated.length} auto-generated`}
        tabs={[
          { value: 'open', label: 'Active', count: open.length },
          { value: 'critical', label: 'Critical', count: critical.length },
          { value: 'auto', label: 'Auto-Generated', count: autoGenerated.length },
          { value: 'resolved', label: 'Resolved', count: escalations.filter((e) => e.status === 'resolved').length },
          { value: 'all', label: 'All', count: escalations.length },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setEditEsc(null); setModalOpen(true) }}>
            New Escalation
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active" value={open.length} icon={<Zap className="w-5 h-5" />} color={open.length > 0 ? 'danger' : 'success'} />
        <KPICard title="Critical" value={critical.length} icon={<AlertTriangle className="w-5 h-5" />} color={critical.length > 0 ? 'danger' : 'success'} />
        <KPICard title="Auto-Generated" value={autoGenerated.length} icon={<Zap className="w-5 h-5" />} color="warning" subtitle="By escalation engine" />
        <KPICard title="Resolved" value={escalations.filter((e) => e.status === 'resolved').length} icon={<CheckCircle className="w-5 h-5" />} color="success" />
      </div>

      {/* Escalation cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-dark-500 text-sm">No escalations found</div>
        )}
        {filtered.map((esc) => (
          <div
            key={esc.id}
            className={clsx('border border-dark-800 rounded-xl p-4 border-l-4 transition-all', SEVERITY_COLORS[esc.severity] || 'border-l-dark-700')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {esc.auto_generated && (
                    <span className="text-xs bg-dark-700 text-dark-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Auto
                    </span>
                  )}
                  <span className={clsx('text-xs font-medium uppercase', {
                    'text-danger-400': esc.severity === 'critical',
                    'text-warning-400': esc.severity === 'high',
                    'text-brand-400': esc.severity === 'medium',
                  })}>
                    {esc.severity}
                  </span>
                  <StatusBadge status={esc.status} />
                </div>
                <h3 className="text-sm font-semibold text-white">{esc.title}</h3>
                {esc.description && <p className="text-xs text-dark-400 mt-0.5">{esc.description}</p>}
                {esc.trigger_reason && (
                  <p className="text-xs text-dark-500 mt-1">
                    <span className="text-dark-400">Trigger:</span> {esc.trigger_reason}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-dark-500">
                  {esc.owner && <span>Owner: {esc.owner}</span>}
                  {esc.escalated_to && <span>To: {esc.escalated_to}</span>}
                  {esc.due_date && <span>Due: {fmtDate(esc.due_date)}</span>}
                  <span>Created: {fmtDate(esc.created_at)}</span>
                </div>

                {/* Linked entities */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {esc.task_id && <Badge variant="brand">Task: {tasks.find((t) => t.id === esc.task_id)?.title.slice(0,20)}</Badge>}
                  {esc.risk_id && <Badge variant="danger">Risk: {risks.find((r) => r.id === esc.risk_id)?.title.slice(0,20)}</Badge>}
                  {esc.supplier_id && <Badge variant="warning">Supplier: {suppliers.find((s) => s.id === esc.supplier_id)?.name}</Badge>}
                  {esc.milestone_id && <Badge variant="success">MS: {milestones.find((m) => m.id === esc.milestone_id)?.name}</Badge>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="xs" variant="outline" onClick={() => { setEditEsc(esc); setModalOpen(true) }}>Edit</Button>
                {esc.status !== 'resolved' && (
                  <Button size="xs" variant="ghost" onClick={() => quickResolve(esc)}>
                    Resolve
                  </Button>
                )}
              </div>
            </div>

            {esc.resolution_notes && esc.status === 'resolved' && (
              <div className="mt-3 pt-3 border-t border-dark-800">
                <p className="text-xs text-dark-400"><span className="font-medium">Resolution:</span> {esc.resolution_notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditEsc(null) }} title={editEsc ? 'Edit Escalation' : 'New Escalation'} size="md">
        <EscalationForm
          initial={editEsc || {}}
          tasks={tasks} risks={risks} suppliers={suppliers} milestones={milestones}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditEsc(null) }}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
