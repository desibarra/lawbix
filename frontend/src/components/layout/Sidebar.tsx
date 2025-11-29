import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/documents', icon: '📄', label: 'Documentos' },
    { path: '/diagnosis', icon: '🩺', label: 'Diagnóstico' },
    { path: '/roadmap', icon: '🗺️', label: 'Roadmap' },
    { path: '/risks', icon: '⚠️', label: 'Riesgos' },
    { path: '/company', icon: '🏢', label: 'Empresa' },
  ]

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-2">LAWBiX</h1>
        <p className="text-gray-400 text-sm">Corporate Legal Engine</p>
      </div>
      <nav className="px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
