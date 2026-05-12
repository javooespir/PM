import { useState } from 'react'
import { Input, Select, Textarea, FormRow } from '../shared/Input'
import { Button } from '../shared/Button'

export function TaskForm({ initial = {}, milestones = [], suppliers = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    area: initial.area || '',
    owner: initial.owner || '',
    priority: initial.priority || 'medium',
    status: initial.status || 'not_started',
    due_date: initial.due_date || '',
    milestone_id: initial.milestone_id || '',
    supplier_id: initial.supplier_id || '',
    affects_sop: initial.affects_sop || false,
    is_safety: initial.is_safety || false,
  })

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })) }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Task Title *" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Describe the task clearly" required />

      <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Additional details, context, acceptance criteria..." rows={3} />

      <FormRow cols={2}>
        <Select label="Priority" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </FormRow>

      <FormRow cols={2}>
        <Input label="Owner" value={form.owner} onChange={(e) => set('owner', e.target.value)} placeholder="Name of task owner" />
        <Input label="Area / Department" value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="Engineering, Quality, Tooling..." />
      </FormRow>

      <FormRow cols={2}>
        <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
        <Select label="Milestone" value={form.milestone_id} onChange={(e) => set('milestone_id', e.target.value)}>
          <option value="">No milestone</option>
          {milestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </Select>
      </FormRow>

      <Select label="Supplier (if applicable)" value={form.supplier_id} onChange={(e) => set('supplier_id', e.target.value)}>
        <option value="">No supplier</option>
        {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </Select>

      <div className="flex gap-6">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.affects_sop}
            onChange={(e) => set('affects_sop', e.target.checked)}
            className="w-4 h-4 accent-brand-500 rounded"
          />
          <span className="text-sm text-dark-300">Affects SOP</span>
          <span className="text-xs text-warning-500 bg-warning-500/10 px-1.5 py-0.5 rounded">+40pts</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_safety}
            onChange={(e) => set('is_safety', e.target.checked)}
            className="w-4 h-4 accent-danger-500 rounded"
          />
          <span className="text-sm text-dark-300">Safety Issue</span>
          <span className="text-xs text-danger-500 bg-danger-500/10 px-1.5 py-0.5 rounded">+50pts</span>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>
          {initial.id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
