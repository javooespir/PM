import { useState } from 'react'
import { Plus, Settings as SettingsIcon, Radio, Users, Layers } from 'lucide-react'
import { db, exportJSON, importJSON } from '../lib/db'
import { useProject } from '../contexts/ProjectContext'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'
import { Input, Select, Textarea, FormRow } from '../components/shared/Input'
import { Card, CardHeader, CardTitle } from '../components/shared/Card'
import { StatusBadge, Badge } from '../components/shared/Badge'
import { fmtDate } from '../utils/format'
import clsx from 'clsx'

function ProjectForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    code: initial.code || '',
    description: initial.description || '',
    customer: initial.customer || '',
    program: initial.program || '',
    type: initial.type || 'automotive',
    status: initial.status || 'active',
    start_date: initial.start_date || '',
    sop_date: initial.sop_date || '',
    end_date: initial.end_date || '',
  })

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <FormRow cols={2}>
        <Input label="Project Name *" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        <Input label="Project Code *" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="PROJ-001" required />
      </FormRow>
      <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
      <FormRow cols={2}>
        <Input label="Customer" value={form.customer} onChange={(e) => set('customer', e.target.value)} placeholder="OEM / Customer name" />
        <Input label="Program" value={form.program} onChange={(e) => set('program', e.target.value)} placeholder="Program / Platform" />
      </FormRow>
      <FormRow cols={2}>
        <Select label="Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
          <option value="automotive">Automotive</option>
          <option value="aerospace">Aerospace</option>
          <option value="industrial">Industrial</option>
          <option value="other">Other</option>
        </Select>
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </FormRow>
      <FormRow cols={3}>
        <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
        <Input label="SOP Date" type="date" value={form.sop_date} onChange={(e) => set('sop_date', e.target.value)} />
        <Input label="End Date" type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} />
      </FormRow>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>{initial.id ? 'Update Project' : 'Create Project'}</Button>
      </div>
    </form>
  )
}

export function Settings() {
  const { projects, currentProject, createProject, updateProject, setCurrentProject } = useProject()
  const { profile, signOut } = useAuth()
  const [tab, setTab] = useState('projects')
  const [projectModal, setProjectModal] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSaveProject(formData) {
    setSaving(true)
    if (editProject) {
      await updateProject(editProject.id, formData)
    } else {
      await createProject(formData)
    }
    setSaving(false)
    setProjectModal(false)
    setEditProject(null)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage projects, users and system configuration"
        tabs={[
          { value: 'projects', label: 'Projects' },
          { value: 'profile', label: 'My Profile' },
          { value: 'system', label: 'System' },
        ]}
        activeTab={tab}
        onTabChange={setTab}
      />

      {/* Projects */}
      {tab === 'projects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-white">All Projects</h2>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setEditProject(null); setProjectModal(true) }}>
              New Project
            </Button>
          </div>

          <div className="grid gap-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className={clsx(
                  'bg-dark-900 border rounded-xl p-4 cursor-pointer hover:border-dark-600 transition-all',
                  currentProject?.id === p.id ? 'border-brand-500/50' : 'border-dark-800'
                )}
                onClick={() => setCurrentProject(p)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4 text-brand-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{p.name}</h3>
                        {currentProject?.id === p.id && (
                          <span className="text-xs bg-brand-600/20 text-brand-400 px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </div>
                      <p className="text-xs text-dark-500 mt-0.5">
                        {p.code} • {p.type} • {p.customer || 'No customer'}
                      </p>
                      {p.description && <p className="text-xs text-dark-600 mt-0.5">{p.description}</p>}
                      <div className="flex gap-3 mt-2 text-xs text-dark-500">
                        <span>Start: {fmtDate(p.start_date)}</span>
                        <span>SOP: {fmtDate(p.sop_date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    <Button size="xs" variant="outline" onClick={(e) => { e.stopPropagation(); setEditProject(p); setProjectModal(true) }}>
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-12 text-dark-500 text-sm">
                No projects yet. Create your first project to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile */}
      {tab === 'profile' && (
        <Card>
          <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{profile?.full_name}</p>
                <p className="text-sm text-dark-400">{profile?.email}</p>
                <Badge variant="brand" className="mt-1">{profile?.role}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-dark-500 mb-1">Role</p>
                <p className="text-sm text-dark-200 capitalize">{profile?.role}</p>
              </div>
              <div>
                <p className="text-xs text-dark-500 mb-1">Area</p>
                <p className="text-sm text-dark-200">{profile?.area || '—'}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-dark-800">
              <Button variant="danger" size="sm" onClick={signOut}>Sign Out</Button>
            </div>
          </div>
        </Card>
      )}

      {/* System */}
      {tab === 'system' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Scoring System</CardTitle></CardHeader>
            <div className="space-y-2">
              {[
                { label: 'Affects SOP', points: '+40 pts', color: 'text-warning-400' },
                { label: 'Safety Issue', points: '+50 pts', color: 'text-danger-400' },
                { label: 'Task Overdue', points: '+30 pts', color: 'text-danger-400' },
                { label: 'Supplier Linked', points: '+20 pts', color: 'text-brand-400' },
                { label: 'Blocks Other Tasks', points: '+25 pts', color: 'text-warning-400' },
                { label: 'Critical Priority', points: '+15 pts', color: 'text-danger-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2.5 bg-dark-800/50 rounded-lg">
                  <span className="text-sm text-dark-300">{item.label}</span>
                  <span className={clsx('text-sm font-mono font-bold', item.color)}>{item.points}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Auto-Escalation Rules</CardTitle></CardHeader>
            <div className="space-y-2 text-sm">
              {[
                'Critical task overdue > 5 days → Auto escalation created',
                'SOP-impacting task overdue > 5 days → Auto escalation created',
                'Safety issue overdue > 5 days → Auto escalation created',
              ].map((rule) => (
                <div key={rule} className="flex items-start gap-2 p-2.5 bg-dark-800/50 rounded-lg">
                  <span className="text-warning-400 shrink-0 mt-0.5">→</span>
                  <span className="text-dark-300">{rule}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Data Management</CardTitle></CardHeader>
            <div className="space-y-3">
              <p className="text-xs text-dark-500">All data is stored in your browser (localStorage) and synced to your GitHub repo automatically.</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportJSON}>Export Backup (JSON)</Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.json'
                  input.onchange = (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => { importJSON(ev.target.result); window.location.reload() }
                    reader.readAsText(file)
                  }
                  input.click()
                }}>Import Backup</Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <div className="space-y-1 text-sm text-dark-400">
              <p><span className="text-dark-300">Version:</span> 2.0.0</p>
              <p><span className="text-dark-300">Stack:</span> React + Vite + TailwindCSS + GitHub JSON</p>
              <p><span className="text-dark-300">Storage:</span> localStorage + GitHub repo sync</p>
              <p><span className="text-dark-300">Designed for:</span> Automotive & Aerospace Program Management</p>
            </div>
          </Card>
        </div>
      )}

      <Modal open={projectModal} onClose={() => { setProjectModal(false); setEditProject(null) }} title={editProject ? 'Edit Project' : 'New Project'} size="md">
        <ProjectForm
          initial={editProject || {}}
          onSubmit={handleSaveProject}
          onCancel={() => { setProjectModal(false); setEditProject(null) }}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
