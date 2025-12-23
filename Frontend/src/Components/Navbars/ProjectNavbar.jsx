import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi'
import { MdDashboard, MdPeople, MdSettings, MdHelp } from 'react-icons/md'
import { SiThreads } from 'react-icons/si'
import { SidebarContext } from '../../Layout'

function ProjectNavbar() {
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext)

  const navItems = [
    { label: 'Threadwork', href: '/threadwork', Icon: SiThreads },
    { label: 'Dashboard', href: '/dashboard', Icon: MdDashboard },
    { label: 'DevAccounts', href: '/account-manager', Icon: MdPeople },
    { label: 'Settings', href: '/settings', Icon: MdSettings },
    { label: 'Help', href: '/help', Icon: MdHelp },
  ]

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-slate-700">
        {!isCollapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Dev Portal
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col space-y-2 p-4">
        {navItems.map((item, index) => {
          const Icon = item.Icon
          const isRoot = item.href === '/'
          return (
            <NavLink
              key={index}
              to={item.href}
              end={isRoot}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ` +
                (isActive
                  ? 'bg-blue-600 hover:bg-blue-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50')
              }
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className={`text-xs text-slate-500 text-center ${isCollapsed ? 'hidden' : ''}`}>
          v1.0.0
        </div>
      </div>
    </aside>
  )
}

export default ProjectNavbar
