import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface Risk {
  id: number;
  title: string;
  description: string;
  category: string;
  severity: string;
  probability: string;
  impact: string;
  status: string;
  mitigation?: string;
  created_at?: string;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/risks');
      setRisks(response.risks || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al cargar riesgos');
      console.error('Error loading risks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'alto':
      case 'alta':
        return 'bg-red-900/30 border-red-600 text-red-300';
      case 'medium':
      case 'medio':
      case 'media':
        return 'bg-yellow-900/30 border-yellow-600 text-yellow-300';
      case 'low':
      case 'bajo':
      case 'baja':
        return 'bg-green-900/30 border-green-600 text-green-300';
      default:
        return 'bg-gray-800 border-gray-600 text-gray-300';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'alto':
      case 'alta':
        return 'ALTO';
      case 'medium':
      case 'medio':
      case 'media':
        return 'MEDIO';
      case 'low':
      case 'bajo':
      case 'baja':
        return 'BAJO';
      default:
        return severity?.toUpperCase() || 'N/A';
    }
  };

  const filteredRisks = filter === 'all' ? risks : risks.filter(r => r.severity?.toLowerCase() === filter);

  const riskStats = {
    total: risks.length,
    high: risks.filter(r => ['high', 'alto', 'alta'].includes(r.severity?.toLowerCase())).length,
    medium: risks.filter(r => ['medium', 'medio', 'media'].includes(r.severity?.toLowerCase())).length,
    low: risks.filter(r => ['low', 'bajo', 'baja'].includes(r.severity?.toLowerCase())).length
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando análisis de riesgos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Matriz de Riesgos Legales</h1>
        <p className="text-gray-400">Identificación y evaluación de riesgos corporativos</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-white mb-1">{riskStats.total}</div>
          <div className="text-gray-400 text-sm">Total de Riesgos</div>
        </div>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-red-400 mb-1">{riskStats.high}</div>
          <div className="text-red-300 text-sm">Riesgo Alto</div>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-yellow-400 mb-1">{riskStats.medium}</div>
          <div className="text-yellow-300 text-sm">Riesgo Medio</div>
        </div>
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-400 mb-1">{riskStats.low}</div>
          <div className="text-green-300 text-sm">Riesgo Bajo</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Todos ({riskStats.total})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'high' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Alto ({riskStats.high})
        </button>
        <button
          onClick={() => setFilter('medium')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Medio ({riskStats.medium})
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'low' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Bajo ({riskStats.low})
        </button>
      </div>

      {/* Risk Cards */}
      {filteredRisks.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">No hay riesgos identificados</h2>
          <p className="text-gray-400 mb-6">
            Complete el diagnóstico legal para generar automáticamente la matriz de riesgos.
          </p>
          <button
            onClick={() => window.location.href = '/diagnosis'}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Ir a Diagnóstico
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRisks.map((risk) => (
            <div
              key={risk.id}
              className={`bg-gray-800 rounded-lg p-6 border-l-4 ${getSeverityColor(risk.severity)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{risk.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(risk.severity)}`}>
                      {getSeverityLabel(risk.severity)}
                    </span>
                  </div>
                  <span className="text-sm text-primary-400">{risk.category}</span>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{risk.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-700/50 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Probabilidad</div>
                  <div className="text-sm font-semibold text-white uppercase">
                    {getSeverityLabel(risk.probability)}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Impacto</div>
                  <div className="text-sm font-semibold text-white uppercase">
                    {getSeverityLabel(risk.impact)}
                  </div>
                </div>
              </div>

              {risk.mitigation && (
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-semibold text-blue-300 mb-1">Plan de Mitigación</div>
                      <div className="text-sm text-blue-200">{risk.mitigation}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
