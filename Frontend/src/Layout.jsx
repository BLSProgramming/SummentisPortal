import { useState, createContext, useEffect } from 'react'
import ProjectNavbar from './Components/Navbars/ProjectNavbar'

export const SidebarContext = createContext()

function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage if available
    try {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  // Save to localStorage whenever isCollapsed changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed))
    } catch (error) {
      console.error('Failed to save sidebar state:', error)
    }
  }, [isCollapsed])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
        <ProjectNavbar />
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  )
}

export default Layout
