import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './components/Dashboard'
import DocumentsPanel from './components/DocumentsPanel'
import DiagnosisPage from './pages/DiagnosisPage'
import RoadmapPage from './pages/RoadmapPage'
import RisksPage from './pages/RisksPage'
import CompanyPage from './pages/CompanyPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />
        } />

        <Route path="/" element={
          isAuthenticated ? <Layout onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" />
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="documents" element={<DocumentsPanel />} />
          <Route path="diagnosis" element={<DiagnosisPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="risks" element={<RisksPage />} />
          <Route path="company" element={<CompanyPage />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App
