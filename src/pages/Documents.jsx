import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, File, X, ExternalLink, Tag, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useProject } from '../contexts/ProjectContext'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/shared/Button'
import { Input, Select, FormRow } from '../components/shared/Input'
import { Modal } from '../components/shared/Modal'
import { PageLoading } from '../components/shared/Loading'
import { Badge } from '../components/shared/Badge'
import { fmtDate } from '../utils/format'
import clsx from 'clsx'

const FILE_ICONS = {
  pdf: <FileText className="w-8 h-8 text-danger-400" />,
  image: <Image className="w-8 h-8 text-brand-400" />,
  excel: <FileText className="w-8 h-8 text-success-400" />,
  default: <File className="w-8 h-8 text-dark-400" />,
}

function getFileIcon(name) {
  if (!name) return FILE_ICONS.default
  const ext = name.split('.').pop()?.toLowerCase()
  if (['pdf'].includes(ext)) return FILE_ICONS.pdf
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return FILE_ICONS.image
  if (['xls','xlsx','csv'].includes(ext)) return FILE_ICONS.excel
  return FILE_ICONS.default
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function Documents() {
  const { currentProject } = useProject()
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [tasks, setTasks] = useState([])
  const [risks, setRisks] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState([])
  const [uploadMeta, setUploadMeta] = useState({ task_id: '', risk_id: '', supplier_id: '', milestone_id: '', description: '' })
  const [filter, setFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  useEffect(() => { if (currentProject) loadData() }, [currentProject?.id])

  async function loadData() {
    setLoading(true)
    const pid = currentProject.id
    const [d, t, r, s, m] = await Promise.all([
      supabase.from('documents').select('*').eq('project_id', pid).order('created_at', { ascending: false }),
      supabase.from('tasks').select('id,title').eq('project_id', pid),
      supabase.from('risks').select('id,title').eq('project_id', pid),
      supabase.from('suppliers').select('id,name').eq('project_id', pid),
      supabase.from('milestones').select('id,name').eq('project_id', pid),
    ])
    setDocuments(d.data || [])
    setTasks(t.data || [])
    setRisks(r.data || [])
    setSuppliers(s.data || [])
    setMilestones(m.data || [])
    setLoading(false)
  }

  const onDrop = useCallback((files) => {
    setPendingFiles(files)
    setUploadModalOpen(true)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'text/*': [],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  async function handleUpload() {
    if (!pendingFiles.length) return
    setUploading(true)

    for (const file of pendingFiles) {
      const path = `${currentProject.id}/${Date.now()}_${file.name}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage.from('documents').upload(path, file)
      if (uploadError) { console.error(uploadError); continue }

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)

      await supabase.from('documents').insert({
        project_id: currentProject.id,
        name: file.name,
        description: uploadMeta.description,
        type: file.type,
        size_bytes: file.size,
        storage_path: path,
        url: publicUrl,
        task_id: uploadMeta.task_id || null,
        risk_id: uploadMeta.risk_id || null,
        supplier_id: uploadMeta.supplier_id || null,
        milestone_id: uploadMeta.milestone_id || null,
        uploaded_by: user?.id,
      })
    }

    await loadData()
    setUploading(false)
    setUploadModalOpen(false)
    setPendingFiles([])
    setUploadMeta({ task_id: '', risk_id: '', supplier_id: '', milestone_id: '', description: '' })
  }

  async function handleDelete(doc) {
    if (!confirm('Delete this document?')) return
    await supabase.storage.from('documents').remove([doc.storage_path])
    await supabase.from('documents').delete().eq('id', doc.id)
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
  }

  const filtered = documents.filter((d) => {
    if (filter && !d.name.toLowerCase().includes(filter.toLowerCase()) && !d.description?.toLowerCase().includes(filter.toLowerCase())) return false
    return true
  })

  if (loading) return <PageLoading />

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Documents"
        subtitle={`${documents.length} files — Drag & drop to upload`}
        actions={
          <Button variant="primary" icon={<Upload className="w-4 h-4" />} onClick={() => setUploadModalOpen(true)}>
            Upload Files
          </Button>
        }
      />

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
          isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-dark-700 hover:border-dark-600 hover:bg-dark-900/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto text-dark-500 mb-2" />
        <p className="text-sm text-dark-400">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-xs text-dark-600 mt-1">PDF, Images, Excel, Word — up to 50MB</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-dark-200 placeholder:text-dark-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
          />
        </div>
      </div>

      {/* Documents grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-dark-500 text-sm">
            No documents uploaded yet
          </div>
        )}
        {filtered.map((doc) => (
          <div key={doc.id} className="bg-dark-900 border border-dark-800 rounded-xl p-4 hover:border-dark-700 transition-all group">
            <div className="flex items-start justify-between gap-2 mb-3">
              {getFileIcon(doc.name)}
              <button
                onClick={() => handleDelete(doc)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-dark-700 text-dark-500 hover:text-danger-400 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-sm font-medium text-dark-100 truncate" title={doc.name}>{doc.name}</p>
            {doc.description && <p className="text-xs text-dark-500 mt-0.5 truncate">{doc.description}</p>}

            <div className="mt-3 pt-3 border-t border-dark-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-dark-600">{formatBytes(doc.size_bytes)}</p>
                <p className="text-xs text-dark-600">{fmtDate(doc.created_at)}</p>
              </div>
              {doc.url && (
                <a href={doc.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Associations */}
            <div className="mt-2 flex flex-wrap gap-1">
              {doc.task_id && <Badge variant="brand" className="text-xs">Task</Badge>}
              {doc.risk_id && <Badge variant="danger" className="text-xs">Risk</Badge>}
              {doc.supplier_id && <Badge variant="warning" className="text-xs">Supplier</Badge>}
              {doc.milestone_id && <Badge variant="success" className="text-xs">Milestone</Badge>}
            </div>
          </div>
        ))}
      </div>

      {/* Upload modal */}
      <Modal open={uploadModalOpen} onClose={() => { setUploadModalOpen(false); setPendingFiles([]) }} title="Upload Documents" size="sm">
        <div className="space-y-4">
          {pendingFiles.length > 0 && (
            <div className="bg-dark-800/50 rounded-lg p-3">
              <p className="text-xs text-dark-400 font-medium mb-2">Files to upload ({pendingFiles.length})</p>
              {pendingFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-dark-300">
                  {getFileIcon(f.name)}
                  <span className="truncate">{f.name}</span>
                  <span className="text-xs text-dark-500 shrink-0">{formatBytes(f.size)}</span>
                </div>
              ))}
            </div>
          )}

          <Input label="Description" value={uploadMeta.description}
            onChange={(e) => setUploadMeta((m) => ({ ...m, description: e.target.value }))}
            placeholder="Optional description..." />

          <FormRow cols={2}>
            <Select label="Link to Task" value={uploadMeta.task_id}
              onChange={(e) => setUploadMeta((m) => ({ ...m, task_id: e.target.value }))}>
              <option value="">None</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.title.slice(0, 30)}</option>)}
            </Select>
            <Select label="Link to Risk" value={uploadMeta.risk_id}
              onChange={(e) => setUploadMeta((m) => ({ ...m, risk_id: e.target.value }))}>
              <option value="">None</option>
              {risks.map((r) => <option key={r.id} value={r.id}>{r.title.slice(0, 30)}</option>)}
            </Select>
          </FormRow>

          <FormRow cols={2}>
            <Select label="Link to Supplier" value={uploadMeta.supplier_id}
              onChange={(e) => setUploadMeta((m) => ({ ...m, supplier_id: e.target.value }))}>
              <option value="">None</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select label="Link to Milestone" value={uploadMeta.milestone_id}
              onChange={(e) => setUploadMeta((m) => ({ ...m, milestone_id: e.target.value }))}>
              <option value="">None</option>
              {milestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </FormRow>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setUploadModalOpen(false); setPendingFiles([]) }}>Cancel</Button>
            <Button variant="primary" loading={uploading} onClick={handleUpload}
              disabled={pendingFiles.length === 0}>
              Upload {pendingFiles.length > 0 ? `(${pendingFiles.length})` : ''}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
