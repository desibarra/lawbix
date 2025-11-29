import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface RoadmapItem {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date?: string;
  category?: string;
  completed_at?: string;
  created_at: string;
}

export default function RoadmapPage() {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/roadmap');
      setRoadmapItems(response.roadmap || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al cargar roadmap');
      console.error('Error loading roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'alta':
        return 'border-red-500 bg-red-900/20';
      case 'medium':
      case 'media':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'low':
      case 'baja':
        return 'border-green-500 bg-green-900/20';
      default:
        return 'border-gray-500 bg-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'completado':
        return 'bg-green-600 text-white';
      case 'in_progress':
      case 'en_progreso':
        return 'bg-blue-600 text-white';
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Roadmap Estratégico</h1>
        <p className="text-gray-400">Plan de acción y cumplimiento legal</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {roadmapItems.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-xl font-semibold text-white mb-2">No hay pasos definidos aún</h2>
          <p className="text-gray-400 mb-6">
            El roadmap estratégico se generará automáticamente después de completar el diagnóstico legal.
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
          {/* Timeline view */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700"></div>

            {roadmapItems.map((item, index) => (
              <div key={item.id} className="relative pl-20 pb-8">
                {/* Timeline dot */}
                <div className={`absolute left-6 w-5 h-5 rounded-full border-4 ${
                  item.status?.toLowerCase() === 'completed' || item.status?.toLowerCase() === 'completado'
                    ? 'bg-green-500 border-green-700'
                    : 'bg-gray-800 border-gray-600'
                }`}></div>

                {/* Card */}
                <div className={`bg-gray-800 rounded-lg p-6 border-l-4 ${getPriorityColor(item.priority)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {item.title || (item as any).name || 'Tarea sin título'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
                          {item.status || 'Pendiente'}
                        </span>
                      </div>
                      {item.category && (
                        <span className="text-sm text-primary-400">{item.category}</span>
                      )}
                    </div>
                    {item.priority && (
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        Prioridad: {item.priority || 'Media'}
                      </span>
                    )}
                  </div>

                  {(item.description || (item as any).details) && (
                    <p className="text-gray-300 mb-4">
                      {item.description || (item as any).details || 'Sin descripción disponible'}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    {item.due_date && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Fecha límite: {formatDate(item.due_date)}</span>
                      </div>
                    )}
                    {item.completed_at && (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Completado: {formatDate(item.completed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
