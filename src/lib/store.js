import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      currentProject: null,
      projects: [],
      sidebarCollapsed: false,

      setCurrentProject: (project) => set({ currentProject: project }),
      setProjects: (projects) => set({ projects }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'pm-control-tower',
      partialize: (state) => ({
        currentProject: state.currentProject,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
