// Task priority scoring system
export function calculateTaskScore(task) {
  let score = 0
  if (task.affects_sop) score += 40
  if (task.is_safety) score += 50
  if (task.due_date && new Date(task.due_date) < new Date() && !['completed', 'cancelled'].includes(task.status)) score += 30
  if (task.supplier_id) score += 20
  if (task.blocks_tasks?.length > 0) score += 25
  if (task.priority === 'critical') score += 15
  return score
}

export function getScoreLabel(score) {
  if (score >= 80) return { label: 'Critical', color: 'danger' }
  if (score >= 50) return { label: 'High', color: 'warning' }
  if (score >= 25) return { label: 'Medium', color: 'brand' }
  return { label: 'Low', color: 'success' }
}

export function calculateRPN(probability, severity, detectability) {
  return probability * severity * detectability
}

export function getRPNSeverity(rpn) {
  if (rpn >= 200) return { label: 'Critical', color: 'danger' }
  if (rpn >= 100) return { label: 'High', color: 'warning' }
  if (rpn >= 50) return { label: 'Medium', color: 'brand' }
  return { label: 'Low', color: 'success' }
}

export function getMilestoneHealth(milestone, tasks) {
  const relatedTasks = tasks.filter((t) => t.milestone_id === milestone.id)
  const overdue = relatedTasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && !['completed', 'cancelled'].includes(t.status)
  )
  const blocked = relatedTasks.filter((t) => t.status === 'blocked')

  if (overdue.length > 2 || blocked.length > 1) return 'red'
  if (overdue.length > 0 || blocked.length > 0) return 'yellow'
  return 'green'
}

export function getAgingDays(dateStr) {
  if (!dateStr) return 0
  const diff = new Date() - new Date(dateStr)
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}
