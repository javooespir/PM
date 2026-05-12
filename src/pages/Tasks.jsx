import { useEffect, useState } from 'react'
import { Plus, Filter, SortAsc, Clock, AlertTriangle, CheckSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useProject } from '../contexts/ProjectContext'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '../components/shared/Table'
import { StatusBadge, PriorityBadge, Badge } from '../components/shared/Badge'
import { PageLoading } from '../components/shared/Loading'
import { TaskForm } from '../components/tasks/TaskForm'
import { fmtDate, isOverdue, isDueSoon } from '../utils/format'
import { calculateTaskScore, getScoreLabel } from '../utils/scoring'
import clsx from 'clsx'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'critical', label: 'Critical' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
]

export function Tasks() {
  const { currentProject } = useProject()
  const [tasks, setTasks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [saving, setSaving] = useState(false)
  const [detailTask, setDetailTask] = useState(null)

  useEffect(() => { if (currentProject) loadData() }, [currentProject?.id])

  async function loadData() {
    setLoading(true)
    const pid = currentProject.id
    const [t, m, s, p] = await Promise.all([
      supabase.from('tasks').select('*').eq('project_id', pid).order('score', { ascending: false }),
      supabase.from('milestones').select('id,name').eq('project_id', pid),
      supabase.from('suppliers').select('id,name').eq('project_id', pid),
      supabase.from('profiles').select('id,full_name'),
    ])
    setTasks(t.data || [])
    setMilestones(m.data || [])
    setSuppliers(s.data || [])
    setProfiles(p.data || [])
    setLoading(false)
  }

  async function handleSave(formData) {
    setSaving(true)
    const payload = { ...formData, project_id: currentProject.id }
    if (editTask) {
      const { data } = await supabase.from('tasks').update(payload).eq('id', editTask.id).select().single()
      if (data) setTasks((prev) => prev.map((t) => t.id === data.id ? data : t).sort((a, b) => (b.score || 0) - (a.score || 0)))
    } else {
      const { data } = await supabase.from('tasks').insert(payload).select().single()
      if (data) setTasks((prev) => [data, ...prev])
    }
    setSaving(false)
    setModalOpen(false)
    setEditTask(null)
  }

  async function handleStatusChange(taskId, newStatus) {
    const { data } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId).select().single()
    if (data) setTasks((prev) => prev.map((t) => t.id === data.id ? data : t))
  }

  const filtered = tasks.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'open') return !['completed', 'cancelled'].includes(t.status)
    if (filter === 'critical') return t.priority === 'critical'
    if (filter === 'overdue') return isOverdue(t.due_date) && !['completed', 'cancelled'].includes(t.status)
    if (filter === 'blocked') return t.status === 'blocked'
    if (filter === 'completed') return t.status === 'completed'
    return true
  })

  const counts = {
    all: tasks.length,
    open: tasks.filter((t) => !['completed', 'cancelled'].includes(t.status)).length,
    critical: tasks.filter((t) => t.priority === 'critical').length,
    overdue: tasks.filter((t) => isOverdue(t.due_date) && !['completed', 'cancelled'].includes(t.status)).length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  if (loading) return <PageLoading />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tasks"
        subtitle={`${currentProject?.name} — ${tasks.length} total tasks`}
        tabs={STATUS_FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
        activeTab={filter}
        onTabChange={setFilter}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => { setEditTask(null); setModalOpen(true) }}
          >
            New Task
          </Button>
        }
      />

      <Table>
        <Thead>
          <Th>Score</Th>
          <Th>Task</Th>
          <Th>Owner</Th>
          <Th>Priority</Th>
          <Th>Status</Th>
          <Th>Due Date</Th>
          <Th>Milestone</Th>
          <Th>Flags</Th>
        </Thead>
        <Tbody>
          {filtered.length === 0 && <EmptyRow colSpan={8} message="No tasks found" />}
          {filtered.map((task) => {
            const score = task.score || calculateTaskScore(task)
            const scoreInfo = getScoreLabel(score)
            const overdue = isOverdue(task.due_date) && !['completed', 'cancelled'].includes(task.status)
            const soon = isDueSoon(task.due_date) && !overdue

            return (
              <Tr key={task.id} onClick={() => { setEditTask(task); setModalOpen(true) }}>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <div className={clsx('text-xs font-mono font-bold px-1.5 py-0.5 rounded', {
                      'bg-danger-500/15 text-danger-400': scoreInfo.color === 'danger',
                      'bg-warning-500/15 text-warning-400': scoreInfo.color === 'warning',
                      'bg-brand-500/15 text-brand-400': scoreInfo.color === 'brand',
                      'bg-dark-700 text-dark-400': scoreInfo.color === 'success',
                    })}>
                      {score}
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="max-w-xs">
                    <p className="text-dark-100 font-medium truncate">{task.title}</p>
                    {task.area && <p className="text-xs text-dark-500 mt-0.5">{task.area}</p>}
                  </div>
                </Td>
                <Td>
                  <span className="text-sm text-dark-300">
                    {profiles.find((p) => p.id === task.owner_id)?.full_name || '—'}
                  </span>
                </Td>
                <Td><PriorityBadge priority={task.priority} /></Td>
                <Td>
                  <select
                    value={task.status}
                    onChange={(e) => { e.stopPropagation(); handleStatusChange(task.id, e.target.value) }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-dark-800 border border-dark-700 text-dark-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50 cursor-pointer"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </Td>
                <Td>
                  <span className={clsx('text-sm', overdue ? 'text-danger-400 font-medium' : soon ? 'text-warning-400' : 'text-dark-300')}>
                    {fmtDate(task.due_date)}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-dark-500">
                    {milestones.find((m) => m.id === task.milestone_id)?.name || '—'}
                  </span>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    {task.affects_sop && <span className="text-xs bg-warning-500/10 text-warning-400 border border-warning-500/20 px-1.5 py-0.5 rounded">SOP</span>}
                    {task.is_safety && <span className="text-xs bg-danger-500/10 text-danger-400 border border-danger-500/20 px-1.5 py-0.5 rounded">SAFETY</span>}
                    {overdue && <span className="text-xs bg-danger-500/10 text-danger-400 border border-danger-500/20 px-1.5 py-0.5 rounded">OVERDUE</span>}
                  </div>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null) }}
        title={editTask ? 'Edit Task' : 'New Task'}
        size="md"
      >
        <TaskForm
          initial={editTask || {}}
          milestones={milestones}
          suppliers={suppliers}
          profiles={profiles}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditTask(null) }}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
