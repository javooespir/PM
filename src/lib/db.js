import { readFile, writeFile } from './github'
import { calculateTaskScore } from '../utils/scoring'

const COLLECTIONS = [
  'projects', 'tasks', 'risks', 'milestones', 'suppliers',
  'meetings', 'meeting_actions', 'escalations', 'documents',
]

// ─── Auth ────────────────────────────────────────────────────────────────────

export function getAuth() {
  try { return JSON.parse(localStorage.getItem('pm_auth') || 'null') } catch { return null }
}
export function setAuth(auth) { localStorage.setItem('pm_auth', JSON.stringify(auth)) }
export function clearAuth() { localStorage.removeItem('pm_auth') }

// ─── Local storage helpers ────────────────────────────────────────────────────

function storageKey(collection) { return `pm_${collection}` }

function getCollection(collection) {
  try { return JSON.parse(localStorage.getItem(storageKey(collection)) || '[]') } catch { return [] }
}

function saveCollection(collection, items) {
  localStorage.setItem(storageKey(collection), JSON.stringify(items))
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

let syncTimer = null
let syncStatus = 'idle' // idle | syncing | error | ok
const syncListeners = new Set()

export function onSyncStatus(fn) {
  syncListeners.add(fn)
  return () => syncListeners.delete(fn)
}

export function getSyncStatus() { return syncStatus }

function setSyncStatus(s) {
  syncStatus = s
  syncListeners.forEach((fn) => fn(s))
}

function scheduleSync() {
  const auth = getAuth()
  if (!auth) return
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => syncAllToGitHub(), 3000)
}

export async function syncAllToGitHub() {
  const auth = getAuth()
  if (!auth) return
  setSyncStatus('syncing')
  try {
    await Promise.all(
      COLLECTIONS.map((col) =>
        writeFile(`data/${col}.json`, getCollection(col), auth)
      )
    )
    setSyncStatus('ok')
  } catch (e) {
    console.error('GitHub sync error:', e)
    setSyncStatus('error')
  }
}

export async function syncAllFromGitHub() {
  const auth = getAuth()
  if (!auth) return
  setSyncStatus('syncing')
  try {
    await Promise.all(
      COLLECTIONS.map(async (col) => {
        const data = await readFile(`data/${col}.json`, auth)
        if (data !== null) saveCollection(col, data)
      })
    )
    setSyncStatus('ok')
  } catch (e) {
    console.error('GitHub pull error:', e)
    setSyncStatus('error')
  }
}

// ─── Auto-escalation ──────────────────────────────────────────────────────────

function checkAndCreateEscalation(task) {
  if (!task.due_date) return
  const agingDays = Math.floor((Date.now() - new Date(task.due_date)) / 86400000)
  if (agingDays <= 5) return
  const isEscalatable = task.priority === 'critical' || task.affects_sop || task.is_safety
  if (!isEscalatable || ['completed', 'cancelled'].includes(task.status)) return

  const existing = getCollection('escalations')
  const alreadyExists = existing.some(
    (e) => e.source_type === 'task' && e.source_id === task.id && e.status !== 'resolved'
  )
  if (alreadyExists) return

  const reason = task.is_safety
    ? 'Safety issue overdue > 5 days'
    : task.affects_sop
    ? 'SOP-impacting task overdue > 5 days'
    : 'Critical task overdue > 5 days'

  const escalation = {
    id: crypto.randomUUID(),
    project_id: task.project_id,
    title: `Auto: ${task.title}`,
    description: reason,
    severity: 'critical',
    status: 'open',
    source_type: 'task',
    source_id: task.id,
    auto_generated: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  saveCollection('escalations', [...existing, escalation])
}

// ─── CRUD factory ─────────────────────────────────────────────────────────────

function createCRUD(collection, transform = null) {
  return {
    list(filters = {}) {
      let items = getCollection(collection)
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '')
          items = items.filter((item) => item[key] === val)
      })
      return items
    },

    get(id) {
      return getCollection(collection).find((item) => item.id === id) || null
    },

    create(data) {
      const now = new Date().toISOString()
      let item = {
        ...data,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now,
      }
      if (transform) item = transform(item)
      const items = getCollection(collection)
      saveCollection(collection, [...items, item])
      if (collection === 'tasks') checkAndCreateEscalation(item)
      scheduleSync()
      return item
    },

    update(id, data) {
      const items = getCollection(collection)
      let updated = null
      const next = items.map((item) => {
        if (item.id !== id) return item
        let merged = { ...item, ...data, id, updated_at: new Date().toISOString() }
        if (transform) merged = transform(merged)
        updated = merged
        return merged
      })
      if (!updated) return null
      saveCollection(collection, next)
      if (collection === 'tasks') checkAndCreateEscalation(updated)
      scheduleSync()
      return updated
    },

    delete(id) {
      const items = getCollection(collection)
      saveCollection(collection, items.filter((item) => item.id !== id))
      scheduleSync()
    },
  }
}

// ─── Transforms ───────────────────────────────────────────────────────────────

function taskTransform(task) {
  task.score = calculateTaskScore(task)
  return task
}

function riskTransform(risk) {
  risk.rpn = (risk.probability || 1) * (risk.severity || 1) * (risk.detectability || 1)
  return risk
}

// ─── Export / import ─────────────────────────────────────────────────────────

export function exportJSON() {
  const snapshot = {}
  COLLECTIONS.forEach((col) => { snapshot[col] = getCollection(col) })
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pm-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importJSON(jsonString) {
  const snapshot = JSON.parse(jsonString)
  COLLECTIONS.forEach((col) => {
    if (Array.isArray(snapshot[col])) saveCollection(col, snapshot[col])
  })
  scheduleSync()
}

export function clearAllData() {
  COLLECTIONS.forEach((col) => localStorage.removeItem(storageKey(col)))
}

// ─── Public db object ─────────────────────────────────────────────────────────

export const db = {
  projects: createCRUD('projects'),
  tasks: createCRUD('tasks', taskTransform),
  risks: createCRUD('risks', riskTransform),
  milestones: createCRUD('milestones'),
  suppliers: createCRUD('suppliers'),
  meetings: createCRUD('meetings'),
  meeting_actions: createCRUD('meeting_actions'),
  escalations: createCRUD('escalations'),
  documents: createCRUD('documents'),
  getAuth,
  setAuth,
  clearAuth,
  syncAllFromGitHub,
  syncAllToGitHub,
  exportJSON,
  importJSON,
  clearAllData,
  onSyncStatus,
  getSyncStatus,
}
