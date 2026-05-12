import { useEffect, useState } from 'react'
import { Plus, FileText, Image, File, X, ExternalLink, Filter, Link } from 'lucide-react'
import { db } from '../lib/db'
import { useProject } from '../contexts/ProjectContext'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/shared/Button'
import { Input, Select, Textarea, FormRow } from '../components/shared/Input'
import { Modal } from '../components/shared/Modal'
import { PageLoading } from '../components/shared/Loading'
import { Badge } from '../components/shared/Badge'
import { fmtDate } from '../utils/format'
import clsx from 'clsx'

const FILE_ICONS = {
  pdf: <FileText className="w-8 h-8 text-danger-400" />,
  image: <Image className="w-8 h-8 text-brand-400" />,
  excel: <FileText className="w-8 h-8 text-success-400" />,
  link: <Link className="w-8 h-8 text-warning-400" />,
  default: <File className="w-8 h-8 text-dark-400" />,
}

function getFileIcon(doc) {
  if (doc.url && !doc.name?.includes('.')) return FILE_ICONS.link
  const ext = doc.name?.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return FILE_ICONS.pdf
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return FILE_ICONS.image
  if (['xls','xlsx','csv'].includes(ext)) return FILE_ICONS.excel
  return FILE_ICONS.default
}

function DocumentForm({ initial = {}, tasks = [], risks = [], suppliers = [], milestones = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    description: initial.description || '',
    url: initial.url || '',
    doc_type: initial.doc_type || 'other',
    task_id: initial.task_id || '',
    risk_id: initial.risk_id || '',
    supplier_id: initial.supplier_id || '',
    milestone_id: initial.milestone_id || '',
  })

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <Input label="Document Name *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. DFMEA Rev3.xlsx" required />

      <div>
        <label className="text-sm font-medium text-dark-300 block mb-1.5">External URL (Google Drive, OneDrive, SharePoint...)</label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="url"
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full bg-dark-800 border border-dark-700 text-dark-100 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
          />
        </div>
      </div>

      <FormRow cols={2}>
        <Select label="Document Type" value={form.doc_type} onChange={(e) => set('doc_type', e.target.value)}>
          <option value="dfmea">DFMEA</option>
          <option value="pfmea">PFMEA</option>
          <option value="control_plan">Control Plan</option>
          <option value="ppap">PPAP</option>
          <option value="drawing">Drawing</option>
          <option value="specification">Specification</option>
          <option value="report">Report</option>
          <option value="other">Other</option>
        </Select>
        <Input label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description" />
      </FormRow>

      <FormRow cols={2}>
        <Select label="Link to Task" value={form.task_id} onChange={(e) => set('task_id', e.target.value)}>
          <option value="">None</option>
          {tasks.map((t) => <option key={t.id} value={t.id}>{t.title.slice(0, 30)}</option>)}
        </Select>
        <Select label="Link to Risk" value={form.risk_id} onChange={(e) => set('risk_id', e.target.value)}>
          <option value="">None</option>
          {risks.map((r) => <option key={r.id} value={r.id}>{r.title.slice(0, 30)}</option>)}
        </Select>
      </FormRow>

      <FormRow cols={2}>
        <Select label="Link to Supplier" value={form.supplier_id} onChange={(e) => set('supplier_id', e.target.value)}>
          <option value="">None</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Select label="Link to Milestone" value={form.milestone_id} onChange={(e) => set('milestone_id', e.target.value)}>
          <option value="">None</option>
          {milestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </Select>
      </FormRow>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>{initial.id ? 'Update' : 'Add Document'}</Button>
      </div>
    </form>
  )
}

export function Documents() {
  const { currentProject } = useProject()
  const [documents, setDocuments] = useState([])
  const [tasks, setTasks] = useState([])
  const [risks, setRisks] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editDoc, setEditDoc] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => { if (currentProject) loadData() }, [currentProject?.id])

  function loadData() {
    setLoading(true)
    const pid = currentProject.id
    setDocuments(db.documents.list({ project_id: pid }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    setTasks(db.tasks.list({ project_id: pid }))
    setRisks(db.risks.list({ project_id: pid }))
    setSuppliers(db.suppliers.list({ project_id: pid }))
    setMilestones(db.milestones.list({ project_id: pid }))
    setLoading(false)
  }

  function handleSave(formData) {
    setSaving(true)
    const payload = { ...formData, project_id: currentProject.id }
    if (editDoc) {
      const data = db.documents.update(editDoc.id, payload)
      if (data) setDocuments((prev) => prev.map((d) => d.id === data.id ? data : d))
    } else {
      const data = db.documents.create(payload)
      setDocuments((prev) => [data, ...prev])
    }
    setSaving(false)
    setModalOpen(false)
    setEditDoc(null)
  }

  function handleDelete(doc) {
    if (!confirm('Delete this document?')) return
    db.documents.delete(doc.id)
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
  }

  const filtered = documents.filter((d) => {
    if (!filter) return true
    return d.name.toLowerCase().includes(filter.toLowerCase()) || d.description?.toLowerCase().includes(filter.toLowerCase())
  })

  if (loading) return <PageLoading />

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Documents"
        subtitle={`${documents.length} documents — External links (Google Drive, OneDrive, SharePoint)`}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setEditDoc(null); setModalOpen(true) }}>
            Add Document
          </Button>
        }
      />

      {/* Info banner */}
      <div className="bg-brand-600/10 border border-brand-600/20 rounded-xl px-4 py-3 flex items-start gap-3">
        <Link className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
        <p className="text-sm text-brand-300">
          Documents are stored in your own cloud storage (Google Drive, OneDrive, SharePoint). Paste the sharing link here to keep track of them in one place.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search documents..."
          className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-dark-200 placeholder:text-dark-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
        />
      </div>

      {/* Documents grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-dark-500 text-sm">
            No documents yet. Add your first document.
          </div>
        )}
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-dark-900 border border-dark-800 rounded-xl p-4 hover:border-dark-700 transition-all group cursor-pointer"
            onClick={() => { setEditDoc(doc); setModalOpen(true) }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              {getFileIcon(doc)}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(doc) }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-dark-700 text-dark-500 hover:text-danger-400 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-sm font-medium text-dark-100 truncate" title={doc.name}>{doc.name}</p>
            {doc.doc_type && <p className="text-xs text-dark-500 mt-0.5 capitalize">{doc.doc_type.replace('_', ' ')}</p>}
            {doc.description && <p className="text-xs text-dark-600 mt-0.5 truncate">{doc.description}</p>}

            <div className="mt-3 pt-3 border-t border-dark-800 flex items-center justify-between">
              <p className="text-xs text-dark-600">{fmtDate(doc.created_at)}</p>
              {doc.url && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {doc.task_id && tasks.find((t) => t.id === doc.task_id) && <Badge variant="brand" className="text-xs">Task</Badge>}
              {doc.risk_id && risks.find((r) => r.id === doc.risk_id) && <Badge variant="danger" className="text-xs">Risk</Badge>}
              {doc.supplier_id && suppliers.find((s) => s.id === doc.supplier_id) && <Badge variant="warning" className="text-xs">Supplier</Badge>}
              {doc.milestone_id && milestones.find((m) => m.id === doc.milestone_id) && <Badge variant="success" className="text-xs">Milestone</Badge>}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditDoc(null) }}
        title={editDoc ? 'Edit Document' : 'Add Document'}
        size="md"
      >
        <DocumentForm
          initial={editDoc || {}}
          tasks={tasks}
          risks={risks}
          suppliers={suppliers}
          milestones={milestones}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditDoc(null) }}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
