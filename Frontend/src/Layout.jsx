import { useState, createContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ProjectNavbar from './Components/Navbars/ProjectNavbar'

export const SidebarContext = createContext()

function Layout({ children }) {
  const location = useLocation()
  const isLoginPage = location.pathname === '/' || location.pathname === '/login'
  
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
        {!isLoginPage && <ProjectNavbar />}
        <main className={`flex-1 transition-all duration-300 ${!isLoginPage && (isCollapsed ? 'ml-20' : 'ml-64')}`}>
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  )
}

export default Layout
