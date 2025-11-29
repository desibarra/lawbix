import { useState, useEffect } from 'react'
import apiService from '../services/apiService'

interface Document {
  id: number
  name: string
  type: string
  url: string
  created_at: string
}

interface DiagnosisResult {
  id: number
  lifecycle_stage: string
  overall_risk_level: string
  compliance_score: number
  completed_at: string
}

export default function DocumentsPanel() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [generating, setGenerating] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchDocuments()
    fetchTemplates()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await apiService.getDocuments()
      console.log('📄 Documents fetched:', response)
      setDocuments(response.documents || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar documentos')
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await apiService.getDocumentTemplates()
      setTemplates(response.data || [])
    } catch (err) {
      console.error('Error fetching templates:', err)
    }
  }

  const generateDiagnosisReport = async () => {
    try {
      setGenerating(true)
      setError('')

      console.log('🔍 Fetching latest diagnosis...')
      const diagnosisResponse = await apiService.getDiagnosisResults()
      console.log('📊 Diagnosis response:', diagnosisResponse)

      if (!diagnosisResponse.success || !diagnosisResponse.results || diagnosisResponse.results.length === 0) {
        setError('No hay resultados de diagnóstico disponibles. Por favor, completa un diagnóstico primero.')
        return
      }

      const latestDiagnosis = diagnosisResponse.results[0]
      console.log('✅ Latest diagnosis:', latestDiagnosis)

      console.log('📄 Generating document...')
      const response = await apiService.generateDocument('diagnosis_report', {
        diagnosis_id: latestDiagnosis.id
      })

      console.log('✅ Document generated:', response)

      if (response.success) {
        alert('✅ Documento generado exitosamente')
        await fetchDocuments() // Refrescar lista inmediatamente
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al generar el documento'
      setError(errorMsg)
      console.error('❌ Error generating document:', err)
    } finally {
      setGenerating(false)
    }
  }

  const downloadDocument = async (id: number, name: string) => {
    try {
      const blob = await apiService.downloadDocument(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      alert('Error al descargar el documento')
      console.error('Error downloading document:', err)
    }
  }

  const getDocumentType = (type: string): string => {
    const types: { [key: string]: string } = {
      'PDF': 'Reporte PDF',
      'diagnosis_report': 'Reporte de Diagnóstico',
      'contract': 'Contrato',
      'policy': 'Política',
      'terms': 'Términos'
    }
    return types[type] || type
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = () => {
    return (
      <span className="px-2 py-1 text-xs font-medium border rounded-full bg-green-500/20 text-green-400 border-green-500/30">
        Completado
      </span>
    )
  }

  const getDocumentIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'diagnosis_report': '📊',
      'contract': '📝',
      'policy': '📋',
      'terms': '📄'
    }
    return icons[type] || '📄'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Documentos</h1>
          <p className="text-gray-400 mt-2">Genera y administra documentos legales</p>
        </div>
        <button
          onClick={generateDiagnosisReport}
          disabled={generating}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {generating ? (
            <>
              <span className="inline-block animate-spin">⚙️</span>
              Generando...
            </>
          ) : (
            <>
              <span>➕</span>
              Generar Reporte de Diagnóstico
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          <strong className="font-semibold">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* Templates Section */}
      {templates.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">📚 Plantillas Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors">
                <h3 className="text-white font-medium mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                <span className="text-xs text-gray-500">{template.document_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📄 Documentos Generados</h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin text-4xl">⚙️</div>
            <p className="text-gray-400 mt-2">Cargando documentos...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg">No hay documentos generados todavía</p>
            <p className="text-sm mt-2">Haz clic en "Generar Reporte de Diagnóstico" para crear tu primer documento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl">{getDocumentIcon(doc.type)}</span>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{doc.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span>📅 {formatDate(doc.created_at)}</span>
                      <span>📄 {getDocumentType(doc.type)}</span>
                      <span>{getStatusBadge()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => downloadDocument(doc.id, doc.name)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>⬇️</span>
                  Descargar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
