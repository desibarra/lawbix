import { useState, useEffect } from 'react'
import apiService from '../services/apiService'

interface Stats {
  totalDocuments: number
  totalRisks: number
  totalRoadmapItems: number
  complianceScore: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    totalRisks: 0,
    totalRoadmapItems: 0,
    complianceScore: 0
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(userData)

      // Fetch stats from different endpoints
      const [documentsRes, risksRes, roadmapRes, diagnosisRes] = await Promise.allSettled([
        apiService.getDocuments(),
        apiService.getRisks(),
        apiService.getRoadmap(),
        apiService.getDiagnosisResults()
      ])

      setStats({
        totalDocuments: documentsRes.status === 'fulfilled' ? (documentsRes.value.data?.length || 0) : 0,
        totalRisks: risksRes.status === 'fulfilled' ? (risksRes.value.data?.length || 0) : 0,
        totalRoadmapItems: roadmapRes.status === 'fulfilled' ? (roadmapRes.value.data?.length || 0) : 0,
        complianceScore: diagnosisRes.status === 'fulfilled' && diagnosisRes.value.results?.[0]
          ? Math.round(diagnosisRes.value.results[0].compliance_score || 0)
          : 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon, title, value, subtitle, color }: any) => (
    <div className={`bg-gray-800 rounded-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className="text-sm text-gray-400">{subtitle}</div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Bienvenido{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-gray-400 text-lg">
          Panel de Control - LAWBiX Corporate Legal Engine
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📄"
          title="Documentos"
          value={stats.totalDocuments}
          subtitle="Generados"
          color="border-blue-500"
        />
        <StatCard
          icon="⚠️"
          title="Riesgos"
          value={stats.totalRisks}
          subtitle="Identificados"
          color="border-yellow-500"
        />
        <StatCard
          icon="🗺️"
          title="Roadmap"
          value={stats.totalRoadmapItems}
          subtitle="Acciones"
          color="border-green-500"
        />
        <StatCard
          icon="📊"
          title="Cumplimiento"
          value={`${stats.complianceScore}%`}
          subtitle="Score"
          color="border-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/documents"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors text-center"
          >
            <div className="text-4xl mb-3">📄</div>
            <div className="font-semibold text-lg">Generar Documento</div>
            <div className="text-sm opacity-80 mt-2">Crear nuevos documentos legales</div>
          </a>

          <a
            href="/diagnosis"
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg transition-colors text-center"
          >
            <div className="text-4xl mb-3">🩺</div>
            <div className="font-semibold text-lg">Diagnóstico</div>
            <div className="text-sm opacity-80 mt-2">Evaluar estado de la empresa</div>
          </a>

          <a
            href="/roadmap"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors text-center"
          >
            <div className="text-4xl mb-3">🗺️</div>
            <div className="font-semibold text-lg">Ver Roadmap</div>
            <div className="text-sm opacity-80 mt-2">Revisar plan estratégico</div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <div className="text-white font-medium">Sistema de documentos inicializado</div>
              <div className="text-gray-400 text-sm">Listo para generar documentos</div>
            </div>
            <div className="text-gray-500 text-sm">Ahora</div>
          </div>
        </div>
      </div>
    </div>
  )
}
