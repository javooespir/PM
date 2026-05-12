import { useEffect, useState } from 'react'
import { Plus, Building2, TrendingDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useProject } from '../contexts/ProjectContext'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '../components/shared/Table'
import { StatusBadge, Badge } from '../components/shared/Badge'
import { PageLoading } from '../components/shared/Loading'
import { Input, Select, Textarea, FormRow } from '../components/shared/Input'
import { KPICard } from '../components/shared/Card'
import clsx from 'clsx'

function SupplierForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    code: initial.code || '',
    contact_name: initial.contact_name || '',
    contact_email: initial.contact_email || '',
    contact_phone: initial.contact_phone || '',
    country: initial.country || '',
    category: initial.category || '',
    status: initial.status || 'active',
    performance_score: initial.performance_score ?? 100,
    lead_time_days: initial.lead_time_days || '',
    notes: initial.notes || '',
  })

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <FormRow cols={2}>
        <Input label="Supplier Name *" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        <Input label="Code" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="SUP-001" />
      </FormRow>
      <FormRow cols={2}>
        <Input label="Contact Name" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
        <Input label="Contact Email" type="email" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
      </FormRow>
      <FormRow cols={2}>
        <Input label="Phone" value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} />
        <Input label="Country" value={form.country} onChange={(e) => set('country', e.target.value)} />
      </FormRow>
      <FormRow cols={2}>
        <Input label="Category" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Tier 1, Electronics, Tooling..." />
        <Input label="Lead Time (days)" type="number" value={form.lead_time_days} onChange={(e) => set('lead_time_days', e.target.value)} />
      </FormRow>
      <FormRow cols={2}>
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="active">Active</option>
          <option value="at_risk">At Risk</option>
          <option value="critical">Critical</option>
          <option value="inactive">Inactive</option>
        </Select>
        <div>
          <label className="text-sm font-medium text-dark-300">Performance: {form.performance_score}%</label>
          <input type="range" min={0} max={100} value={form.performance_score}
            onChange={(e) => set('performance_score', +e.target.value)}
            className="w-full mt-2 accent-brand-500" />
        </div>
      </FormRow>
      <Textarea label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>{initial.id ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  )
}

export function Suppliers() {
  const { currentProject } = useProject()
  const [suppliers, setSuppliers] = useState([])
  const [tasks, setTasks] = useState([])
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (currentProject) loadData() }, [currentProject?.id])

  async function loadData() {
    setLoading(true)
    const pid = currentProject.id
    const [s, t, r] = await Promise.all([
      supabase.from('suppliers').select('*').eq('project_id', pid).order('name'),
      supabase.from('tasks').select('id,supplier_id,status').eq('project_id', pid),
      supabase.from('risks').select('id,supplier_id,status,rpn').eq('project_id', pid),
    ])
    setSuppliers(s.data || [])
    setTasks(t.data || [])
    setRisks(r.data || [])
    setLoading(false)
  }

  async function handleSave(formData) {
    setSaving(true)
    const payload = { ...formData, project_id: currentProject.id }
    if (editSupplier) {
      const { data } = await supabase.from('suppliers').update(payload).eq('id', editSupplier.id).select().single()
      if (data) setSuppliers((prev) => prev.map((s) => s.id === data.id ? data : s))
    } else {
      const { data } = await supabase.from('suppliers').insert(payload).select().single()
      if (data) setSuppliers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    }
    setSaving(false)
    setModalOpen(false)
    setEditSupplier(null)
  }

  const critical = suppliers.filter((s) => s.status === 'critical')
  const atRisk = suppliers.filter((s) => s.status === 'at_risk')

  if (loading) return <PageLoading />

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Supplier Management"
        subtitle={`${suppliers.length} suppliers — ${critical.length} critical, ${atRisk.length} at risk`}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setEditSupplier(null); setModalOpen(true) }}>
            New Supplier
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Suppliers" value={suppliers.length} icon={<Building2 className="w-5 h-5" />} color="brand" />
        <KPICard title="Critical" value={critical.length} icon={<TrendingDown className="w-5 h-5" />} color={critical.length > 0 ? 'danger' : 'success'} />
        <KPICard title="At Risk" value={atRisk.length} icon={<TrendingDown className="w-5 h-5" />} color={atRisk.length > 0 ? 'warning' : 'success'} />
        <KPICard
          title="Avg Performance"
          value={suppliers.length > 0 ? `${Math.round(suppliers.reduce((sum, s) => sum + (s.performance_score || 0), 0) / suppliers.length)}%` : '—'}
          icon={<Building2 className="w-5 h-5" />}
          color="muted"
        />
      </div>

      <Table>
        <Thead>
          <Th>Supplier</Th>
          <Th>Contact</Th>
          <Th>Category</Th>
          <Th>Status</Th>
          <Th>Performance</Th>
          <Th>Lead Time</Th>
          <Th>Open Tasks</Th>
          <Th>Active Risks</Th>
        </Thead>
        <Tbody>
          {suppliers.length === 0 && <EmptyRow colSpan={8} message="No suppliers added" />}
          {suppliers.map((s) => {
            const openTasks = tasks.filter((t) => t.supplier_id === s.id && !['completed','cancelled'].includes(t.status)).length
            const activeRisks = risks.filter((r) => r.supplier_id === s.id && r.status !== 'closed').length
            const maxRpn = risks.filter((r) => r.supplier_id === s.id && r.status !== 'closed').reduce((max, r) => Math.max(max, r.rpn), 0)

            return (
              <Tr key={s.id} onClick={() => { setEditSupplier(s); setModalOpen(true) }}>
                <Td>
                  <div>
                    <p className="font-medium text-dark-100">{s.name}</p>
                    {s.code && <p className="text-xs text-dark-500">{s.code} • {s.country}</p>}
                  </div>
                </Td>
                <Td>
                  <div className="text-sm">
                    <p className="text-dark-200">{s.contact_name || '—'}</p>
                    {s.contact_email && <p className="text-xs text-dark-500">{s.contact_email}</p>}
                  </div>
                </Td>
                <Td><span className="text-xs text-dark-400">{s.category || '—'}</span></Td>
                <Td><StatusBadge status={s.status} /></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-dark-800 rounded-full">
                      <div
                        className={clsx('h-full rounded-full', s.performance_score >= 80 ? 'bg-success-500' : s.performance_score >= 60 ? 'bg-warning-500' : 'bg-danger-500')}
                        style={{ width: `${s.performance_score}%` }}
                      />
                    </div>
                    <span className={clsx('text-xs font-medium', s.performance_score >= 80 ? 'text-success-400' : s.performance_score >= 60 ? 'text-warning-400' : 'text-danger-400')}>
                      {s.performance_score}%
                    </span>
                  </div>
                </Td>
                <Td><span className="text-sm text-dark-300">{s.lead_time_days ? `${s.lead_time_days}d` : '—'}</span></Td>
                <Td>
                  <span className={clsx('text-sm font-medium', openTasks > 0 ? 'text-warning-400' : 'text-dark-500')}>
                    {openTasks}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <span className={clsx('text-sm font-medium', activeRisks > 0 ? 'text-danger-400' : 'text-dark-500')}>
                      {activeRisks}
                    </span>
                    {maxRpn > 0 && <span className="text-xs text-dark-600">RPN {maxRpn}</span>}
                  </div>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditSupplier(null) }} title={editSupplier ? 'Edit Supplier' : 'New Supplier'} size="md">
        <SupplierForm
          initial={editSupplier || {}}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditSupplier(null) }}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
