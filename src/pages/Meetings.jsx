import { useEffect, useState } from 'react'
import { Plus, Users, Clock, CheckSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useProject } from '../contexts/ProjectContext'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '../components/shared/Table'
import { StatusBadge } from '../components/shared/Badge'
import { PageLoading } from '../components/shared/Loading'
import { Input, Select, Textarea, FormRow } from '../components/shared/Input'
import { Card, CardHeader, CardTitle } from '../components/shared/Card'
import { fmtDate } from '../utils/format'
import clsx from 'clsx'

function MeetingForm({ initial = {}, profiles = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    type: initial.type || 'weekly_review',
    scheduled_at: initial.scheduled_at ? initial.scheduled_at.slice(0, 16) : '',
    duration_minutes: initial.duration_minutes || 60,
    location: initial.location || '',
    notes: initial.notes || '',
    decisions: initial.decisions || '',
    status: initial.status || 'scheduled',
    organizer_id: initial.organizer_id || '',
  })

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <Input label="Meeting Title *" value={form.title} onChange={(e) => set('title', e.target.value)} required />
      <FormRow cols={2}>
        <Select label="Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
          <option value="weekly_review">Weekly Review</option>
          <option value="risk_review">Risk Review</option>
          <option value="milestone_review">Milestone Review</option>
          <option value="supplier_meeting">Supplier Meeting</option>
          <option value="kickoff">Kickoff</option>
          <option value="other">Other</option>
        </Select>
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </FormRow>
      <FormRow cols={2}>
        <Input label="Date & Time" type="datetime-local" value={form.scheduled_at} onChange={(e) => set('scheduled_at', e.target.value)} />
        <Input label="Duration (min)" type="number" value={form.duration_minutes} onChange={(e) => set('duration_minutes', e.target.value)} />
      </FormRow>
      <FormRow cols={2}>
        <Input label="Location / Link" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Room A / Teams link" />
        <Select label="Organizer" value={form.organizer_id} onChange={(e) => set('organizer_id', e.target.value)}>
          <option value="">No organizer</option>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </Select>
      </FormRow>
      <Textarea label="Meeting Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Discussion points, context, details..." />
      <Textarea label="Decisions Made" value={form.decisions} onChange={(e) => set('decisions', e.target.value)} rows={2} placeholder="Key decisions and agreements..." />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>{initial.id ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  )
}

function ActionForm({ meetingId, projectId, profiles = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ title: '', description: '', owner_id: '', due_date: '', status: 'open' })
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, meeting_id: meetingId, project_id: projectId }) }} className="space-y-4">
      <Input label="Action Title *" value={form.title} onChange={(e) => set('title', e.target.value)} required />
      <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
      <FormRow cols={2}>
        <Select label="Owner" value={form.owner_id} onChange={(e) => set('owner_id', e.target.value)}>
          <option value="">No owner</option>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </Select>
        <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
      </FormRow>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>Add Action</Button>
      </div>
    </form>
  )
}

export function Meetings() {
  const { currentProject } = useProject()
  const [meetings, setMeetings] = useState([])
  const [actions, setActions] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMeeting, setEditMeeting] = useState(null)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (currentProject) loadData() }, [currentProject?.id])

  async function loadData() {
    setLoading(true)
    const pid = currentProject.id
    const [m, a, p] = await Promise.all([
      supabase.from('meetings').select('*').eq('project_id', pid).order('scheduled_at', { ascending: false }),
      supabase.from('meeting_actions').select('*').eq('project_id', pid).order('due_date'),
      supabase.from('profiles').select('id,full_name'),
    ])
    setMeetings(m.data || [])
    setActions(a.data || [])
    setProfiles(p.data || [])
    setLoading(false)
  }

  async function handleSaveMeeting(formData) {
    setSaving(true)
    const payload = { ...formData, project_id: currentProject.id }
    if (editMeeting) {
      const { data } = await supabase.from('meetings').update(payload).eq('id', editMeeting.id).select().single()
      if (data) setMeetings((prev) => prev.map((m) => m.id === data.id ? data : m))
    } else {
      const { data } = await supabase.from('meetings').insert(payload).select().single()
      if (data) setMeetings((prev) => [data, ...prev])
    }
    setSaving(false)
    setModalOpen(false)
    setEditMeeting(null)
  }

  async function handleSaveAction(formData) {
    setSaving(true)
    const { data } = await supabase.from('meeting_actions').insert(formData).select().single()
    if (data) setActions((prev) => [...prev, data])
    setSaving(false)
    setActionModalOpen(false)
  }

  async function toggleActionStatus(action) {
    const newStatus = action.status === 'completed' ? 'open' : 'completed'
    const { data } = await supabase.from('meeting_actions').update({ status: newStatus }).eq('id', action.id).select().single()
    if (data) setActions((prev) => prev.map((a) => a.id === data.id ? data : a))
  }

  const getMeetingActions = (meetingId) => actions.filter((a) => a.meeting_id === meetingId)
  const openActions = actions.filter((a) => a.status !== 'completed')

  if (loading) return <PageLoading />

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Meetings"
        subtitle={`${meetings.length} meetings — ${openActions.length} open action items`}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setEditMeeting(null); setModalOpen(true) }}>
            New Meeting
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting list */}
        <div className="lg:col-span-2 space-y-3">
          {meetings.length === 0 && (
            <div className="flex items-center justify-center h-32 text-dark-500 text-sm">No meetings recorded</div>
          )}
          {meetings.map((m) => {
            const mActions = getMeetingActions(m.id)
            const openCount = mActions.filter((a) => a.status !== 'completed').length

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMeeting(selectedMeeting?.id === m.id ? null : m)}
                className="bg-dark-900 border border-dark-800 rounded-xl p-4 cursor-pointer hover:border-dark-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-dark-500 capitalize">{m.type?.replace('_', ' ')}</span>
                      <span className="text-dark-700">•</span>
                      <span className="text-xs text-dark-500">{fmtDate(m.scheduled_at)}</span>
                      {m.duration_minutes && <span className="text-xs text-dark-600">{m.duration_minutes}min</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-white mt-0.5">{m.title}</h3>
                    {m.location && <p className="text-xs text-dark-500 mt-0.5">{m.location}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {openCount > 0 && (
                      <span className="text-xs bg-warning-500/10 text-warning-400 border border-warning-500/20 px-2 py-0.5 rounded-full">
                        {openCount} open
                      </span>
                    )}
                    <StatusBadge status={m.status} />
                  </div>
                </div>

                {selectedMeeting?.id === m.id && (
                  <div className="mt-4 pt-4 border-t border-dark-800 space-y-3">
                    {m.notes && (
                      <div>
                        <p className="text-xs font-medium text-dark-400 uppercase mb-1">Notes</p>
                        <p className="text-sm text-dark-300 whitespace-pre-line">{m.notes}</p>
                      </div>
                    )}
                    {m.decisions && (
                      <div>
                        <p className="text-xs font-medium text-dark-400 uppercase mb-1">Decisions</p>
                        <p className="text-sm text-dark-300 whitespace-pre-line">{m.decisions}</p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-dark-400 uppercase">Action Items ({mActions.length})</p>
                        <Button size="xs" variant="ghost" icon={<Plus className="w-3 h-3" />}
                          onClick={(e) => { e.stopPropagation(); setSelectedMeeting(m); setActionModalOpen(true) }}>
                          Add Action
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        {mActions.map((action) => (
                          <div key={action.id} className="flex items-center gap-2 p-2 bg-dark-800/50 rounded-lg">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleActionStatus(action) }}
                              className={clsx('w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors', action.status === 'completed' ? 'bg-success-500 border-success-500' : 'border-dark-600 hover:border-brand-500')}
                            >
                              {action.status === 'completed' && <CheckSquare className="w-3 h-3 text-white" />}
                            </button>
                            <span className={clsx('flex-1 text-sm', action.status === 'completed' ? 'line-through text-dark-600' : 'text-dark-200')}>
                              {action.title}
                            </span>
                            <span className="text-xs text-dark-500">{fmtDate(action.due_date)}</span>
                          </div>
                        ))}
                        {mActions.length === 0 && <p className="text-xs text-dark-600 py-1">No actions yet</p>}
                      </div>
                    </div>

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="xs" variant="outline" onClick={() => { setEditMeeting(m); setModalOpen(true) }}>Edit Meeting</Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Open actions sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Open Actions</CardTitle>
            <span className="text-xs text-warning-400">{openActions.length} pending</span>
          </CardHeader>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {openActions.length === 0 && <p className="text-sm text-dark-500 text-center py-4">All clear!</p>}
            {openActions.map((a) => (
              <div key={a.id} className="p-2.5 bg-dark-800/40 rounded-lg">
                <p className="text-sm text-dark-200 font-medium">{a.title}</p>
                <p className="text-xs text-dark-500 mt-0.5">
                  {profiles.find((p) => p.id === a.owner_id)?.full_name || 'Unassigned'} • Due {fmtDate(a.due_date)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditMeeting(null) }} title={editMeeting ? 'Edit Meeting' : 'New Meeting'} size="md">
        <MeetingForm
          initial={editMeeting || {}}
          profiles={profiles}
          onSubmit={handleSaveMeeting}
          onCancel={() => { setModalOpen(false); setEditMeeting(null) }}
          loading={saving}
        />
      </Modal>

      <Modal open={actionModalOpen} onClose={() => setActionModalOpen(false)} title="Add Action Item" size="sm">
        <ActionForm
          meetingId={selectedMeeting?.id}
          projectId={currentProject?.id}
          profiles={profiles}
          onSubmit={handleSaveAction}
          onCancel={() => setActionModalOpen(false)}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
