interface HeaderProps {
  onLogout: () => void
}

export default function Header({ onLogout }: HeaderProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
  }

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            {user.name || 'Usuario'}
          </h2>
          <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
            {user.role || 'client'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  )
}
