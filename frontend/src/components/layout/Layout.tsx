import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Chatbot from '../Chatbot'

interface LayoutProps {
  onLogout: () => void
}

export default function Layout({ onLogout }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto bg-gray-900">
          <Outlet />
        </main>
      </div>
      <Chatbot />
    </div>
  )
}
