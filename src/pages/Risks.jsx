import { useEffect, useState } from 'react'
import { Plus, AlertTriangle, TrendingUp } from 'lucide-react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '../lib/supabase'
import { useProject } from '../contexts/ProjectContext'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '../components/shared/Table'
import { StatusBadge, Badge } from '../components/shared/Badge'
import { PageLoading } from '../components/shared/Loading'
import { Input, Select, Textarea, FormRow } from '../components/shared/Input'
import { Card, CardHeader, CardTitle } from '../components/shared/Card'
import { fmtDate } from '../utils/format'
import { getRPNSeverity } from '../utils/scoring'
import clsx from 'clsx'

function RiskForm({ initial = {}, milestones = [], suppliers = [], profiles = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    category: initial.category || 'technical',
    probability: initial.probability || 5,
    severity: initial.severity || 5,
    detectability: initial.detectability || 5,
    owner_id: initial.owner_id || '',
    status: initial.status || 'open',
    mitigation_plan: initial.mitigation_plan || '',
    contingency_plan: initial.contingency_plan || '',
    trigger_condition: initial.trigger_condition || '',
    review_date: initial.review_date || '',
    milestone_id: initial.milestone_id || '',
    supplier_id: initial.supplier_id || '',
  })

  const rpn = form.probability * form.severity * form.detectability
  const rpnInfo = getRPNSeverity(rpn)

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <Input label="Risk Title *" value={form.title} onChange={(e) => set('title', e.target.value)} required />
      <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />

      <FormRow cols={2}>
        <Select label="Category" value={form.category} onChange={(e) => set('category', e.target.value)}>
          {['technical','schedule','cost','quality','supplier','regulatory','safety','other'].map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </Select>
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="open">Open</option>
          <option value="mitigating">Mitigating</option>
          <option value="monitoring">Monitoring</option>
          <option value="closed">Closed</option>
        </Select>
      </FormRow>

      {/* RPN Section */}
      <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-dark-200">Risk Priority Number (RPN)</p>
          <div className={clsx('text-lg font-bold px-3 py-1 rounded-lg', {
            'bg-danger-500/15 text-danger-400': rpnInfo.color === 'danger',
            'bg-warning-500/15 text-warning-400': rpnInfo.color === 'warning',
            'bg-brand-500/15 text-brand-400': rpnInfo.color === 'brand',
            'bg-success-500/15 text-success-400': rpnInfo.color === 'success',
          })}>
            {rpn} — {rpnInfo.label}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'probability', label: 'Probability (P)', hint: '1=Rare, 10=Almost Certain' },
            { key: 'severity', label: 'Severity (S)', hint: '1=Negligible, 10=Catastrophic' },
            { key: 'detectability', label: 'Detectability (D)', hint: '1=Easy, 10=Impossible' },
          ].map(({ key, label, hint }) => (
            <div key={key}>
              <label className="text-xs font-medium text-dark-400">{label}</label>
              <input
                type="range" min={1} max={10} value={form[key]}
                onChange={(e) => set(key, +e.target.value)}
                className="w-full mt-1 accent-brand-500"
              />
              <div className="flex justify-between text-xs text-dark-500">
                <span>1</span>
                <span className="font-bold text-brand-400">{form[key]}</span>
                <span>10</span>
              </div>
              <p className="text-xs text-dark-600 mt-0.5">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      <Textarea label="Mitigation Plan" value={form.mitigation_plan} onChange={(e) => set('mitigation_plan', e.target.value)} rows={2} placeholder="Actions to reduce probability or severity..." />
      <Textarea label="Contingency Plan" value={form.contingency_plan} onChange={(e) => set('contingency_plan', e.target.value)} rows={2} placeholder="Actions if risk materializes..." />
      <Input label="Trigger Condition" value={form.trigger_condition} onChange={(e) => set('trigger_condition', e.target.value)} placeholder="What event activates this contingency?" />

      <FormRow cols={2}>
        <Select label="Owner" value={form.owner_id} onChange={(e) => set('owner_id', e.target.value)}>
          <option value="">No owner</option>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </Select>
        <Input label="Review Date" type="date" value={form.review_date} onChange={(e) => set('review_date', e.target.value)} />
      </FormRow>

      <FormRow cols={2}>
        <Select label="Milestone Impact" value={form.milestone_id} onChange={(e) => set('milestone_id', e.target.value)}>
          <option value="">None</option>
          {milestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </Select>
        <Select label="Supplier" value={form.supplier_id} onChange={(e) => set('supplier_id', e.target.value)}>
          <option value="">None</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </FormRow>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>{initial.id ? 'Update Risk' : 'Create Risk'}</Button>
      </div>
    </form>
  )
}

const TABS = [
  { value: 'all', label: 'All Risks' },
  { value: 'open', label: 'Open' },
  { value: 'critical', label: 'Critical (RPN≥200)' },
  { value: 'high', label: 'High (RPN≥100)' },
]

export function Risks() {
  const { currentProject } = useProject()
  const [risks, setRisks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRisk, setEditRisk] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (currentProject) loadData() }, [currentProject?.id])

  async function loadData() {
    setLoading(true)
    const pid = currentProject.id
    const [r, m, s, p] = await Promise.all([
      supabase.from('risks').select('*').eq('project_id', pid).order('rpn', { ascending: false }),
      supabase.from('milestones').select('id,name').eq('project_id', pid),
      supabase.from('suppliers').select('id,name').eq('project_id', pid),
      supabase.from('profiles').select('id,full_name'),
    ])
    setRisks(r.data || [])
    setMilestones(m.data || [])
    setSuppliers(s.data || [])
    setProfiles(p.data || [])
    setLoading(false)
  }

  async function handleSave(formData) {
    setSaving(true)
    const payload = { ...formData, project_id: currentProject.id }
    if (editRisk) {
      const { data } = await supabase.from('risks').update(payload).eq('id', editRisk.id).select().single()
      if (data) setRisks((prev) => prev.map((r) => r.id === data.id ? data : r).sort((a, b) => b.rpn - a.rpn))
    } else {
      const { data } = await supabase.from('risks').insert(payload).select().single()
      if (data) setRisks((prev) => [data, ...prev])
    }
    setSaving(false)
    setModalOpen(false)
    setEditRisk(null)
  }

  const filtered = risks.filter((r) => {
    if (tab === 'open') return r.status !== 'closed'
    if (tab === 'critical') return r.rpn >= 200
    if (tab === 'high') return r.rpn >= 100 && r.rpn < 200
    return true
  })

  // Scatter data for risk matrix
  const scatterData = risks.filter((r) => r.status !== 'closed').map((r) => ({
    x: r.probability,
    y: r.severity,
    rpn: r.rpn,
    name: r.title,
  }))

  const rpnColor = (rpn) => {
    if (rpn >= 200) return '#ef4444'
    if (rpn >= 100) return '#f59e0b'
    if (rpn >= 50) return '#3b82f6'
    return '#22c55e'
  }

  if (loading) return <PageLoading />

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Risk Management"
        subtitle={`FMEA-based risk tracking — ${risks.filter((r) => r.status !== 'closed').length} active risks`}
        tabs={TABS.map((t) => ({
          ...t,
          count: t.value === 'all' ? risks.length
            : t.value === 'open' ? risks.filter((r) => r.status !== 'closed').length
            : t.value === 'critical' ? risks.filter((r) => r.rpn >= 200).length
            : risks.filter((r) => r.rpn >= 100 && r.rpn < 200).length,
        }))}
        activeTab={tab}
        onTabChange={setTab}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setEditRisk(null); setModalOpen(true) }}>
            New Risk
          </Button>
        }
      />

      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Matrix (Probability vs Severity)</CardTitle>
          <div className="flex gap-3 text-xs text-dark-400">
            {[{ color: '#ef4444', label: 'Critical ≥200' }, { color: '#f59e0b', label: 'High ≥100' }, { color: '#3b82f6', label: 'Medium ≥50' }, { color: '#22c55e', label: 'Low' }].map((l) => (
              <div key={l.label} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: l.color }} />{l.label}</div>
            ))}
          </div>
        </CardHeader>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" dataKey="x" domain={[0, 10]} label={{ value: 'Probability', position: 'bottom', fill: '#64748b', fontSize: 11 }} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis type="number" dataKey="y" domain={[0, 10]} label={{ value: 'Severity', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }}
                formatter={(v, n, props) => [props.payload.name, `RPN: ${props.payload.rpn}`]}
              />
              <Scatter data={scatterData} shape="circle">
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={rpnColor(entry.rpn)} opacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Risks Table */}
      <Table>
        <Thead>
          <Th>RPN</Th>
          <Th>Risk</Th>
          <Th>Category</Th>
          <Th>P × S × D</Th>
          <Th>Owner</Th>
          <Th>Status</Th>
          <Th>Review Date</Th>
          <Th>Milestone</Th>
        </Thead>
        <Tbody>
          {filtered.length === 0 && <EmptyRow colSpan={8} message="No risks found" />}
          {filtered.map((risk) => {
            const rpnInfo = getRPNSeverity(risk.rpn)
            return (
              <Tr key={risk.id} onClick={() => { setEditRisk(risk); setModalOpen(true) }}>
                <Td>
                  <span className={clsx('font-mono font-bold text-sm px-2 py-0.5 rounded', {
                    'bg-danger-500/15 text-danger-400': rpnInfo.color === 'danger',
                    'bg-warning-500/15 text-warning-400': rpnInfo.color === 'warning',
                    'bg-brand-500/15 text-brand-400': rpnInfo.color === 'brand',
                    'bg-success-500/15 text-success-400': rpnInfo.color === 'success',
                  })}>
                    {risk.rpn}
                  </span>
                </Td>
                <Td>
                  <p className="text-dark-100 font-medium truncate max-w-xs">{risk.title}</p>
                  {risk.trigger_condition && <p className="text-xs text-dark-500 mt-0.5 truncate">Trigger: {risk.trigger_condition}</p>}
                </Td>
                <Td>
                  <span className="text-xs text-dark-400 capitalize">{risk.category}</span>
                </Td>
                <Td>
                  <span className="font-mono text-xs text-dark-300">{risk.probability} × {risk.severity} × {risk.detectability}</span>
                </Td>
                <Td>
                  <span className="text-sm text-dark-300">{profiles.find((p) => p.id === risk.owner_id)?.full_name || '—'}</span>
                </Td>
                <Td><StatusBadge status={risk.status} /></Td>
                <Td>
                  <span className={clsx('text-sm', risk.review_date && new Date(risk.review_date) < new Date() ? 'text-danger-400' : 'text-dark-300')}>
                    {fmtDate(risk.review_date)}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-dark-500">{milestones.find((m) => m.id === risk.milestone_id)?.name || '—'}</span>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditRisk(null) }} title={editRisk ? 'Edit Risk' : 'New Risk'} size="lg">
        <RiskForm
          initial={editRisk || {}}
          milestones={milestones}
          suppliers={suppliers}
          profiles={profiles}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditRisk(null) }}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
