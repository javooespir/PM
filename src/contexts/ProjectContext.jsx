import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../lib/db'
import { useAppStore } from '../lib/store'
import { useAuth } from './AuthContext'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const { currentProject, setCurrentProject, setProjects } = useAppStore()
  const { auth } = useAuth()
  const [localProjects, setLocalProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [auth])

  async function loadProjects() {
    setLoading(true)
    if (auth) {
      try { await db.syncAllFromGitHub() } catch { /* use local cache */ }
    }
    const data = db.projects.list()
    setLocalProjects(data)
    setProjects(data)
    if (!currentProject && data.length > 0) setCurrentProject(data[0])
    setLoading(false)
  }

  function createProject(projectData) {
    const data = db.projects.create(projectData)
    const next = [data, ...localProjects]
    setLocalProjects(next)
    setProjects(next)
    setCurrentProject(data)
    return { data, error: null }
  }

  function updateProject(id, updates) {
    const data = db.projects.update(id, updates)
    if (!data) return { data: null, error: { message: 'Project not found' } }
    const next = localProjects.map((p) => (p.id === id ? data : p))
    setLocalProjects(next)
    setProjects(next)
    if (currentProject?.id === id) setCurrentProject(data)
    return { data, error: null }
  }

  return (
    <ProjectContext.Provider value={{
      projects: localProjects,
      currentProject,
      loading,
      setCurrentProject,
      createProject,
      updateProject,
      refresh: loadProjects,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
