import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../lib/store'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const { currentProject, setCurrentProject, setProjects } = useAppStore()
  const [localProjects, setLocalProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (data) {
      setLocalProjects(data)
      setProjects(data)
      if (!currentProject && data.length > 0) setCurrentProject(data[0])
    }
    setLoading(false)
  }

  async function createProject(projectData) {
    const { data, error } = await supabase.from('projects').insert(projectData).select().single()
    if (!error) {
      setLocalProjects((prev) => [data, ...prev])
      setCurrentProject(data)
    }
    return { data, error }
  }

  async function updateProject(id, updates) {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single()
    if (!error) {
      setLocalProjects((prev) => prev.map((p) => (p.id === id ? data : p)))
      if (currentProject?.id === id) setCurrentProject(data)
    }
    return { data, error }
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
