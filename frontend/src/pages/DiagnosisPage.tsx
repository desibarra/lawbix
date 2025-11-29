import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  weight: number;
}

interface DiagnosisResult {
  compliance_score: number;
  risk_level: string;
  category_scores: Record<string, { total: number; max: number }>;
  total_questions: number;
}

export default function DiagnosisPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/diagnosis/questions');
      setQuestions(response.questions || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al cargar preguntas');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Por favor responde todas las preguntas. Faltan ${unanswered.length} preguntas.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer
      }));

      const response = await apiService.post('/diagnosis/submit', {
        answers: formattedAnswers
      });

      setResult(response.diagnosis);
    } catch (err: any) {
      setError(err.message || 'Error al enviar diagnóstico');
      console.error('Error submitting diagnosis:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'bajo': return 'text-green-400 bg-green-900/30 border-green-700';
      case 'medio': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
      case 'alto': return 'text-red-400 bg-red-900/30 border-red-700';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const groupedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando diagnóstico...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center text-white">Resultados del Diagnóstico Legal</h1>

          <div className="mb-8 text-center">
            <div className="inline-block">
              <div className="text-6xl font-bold text-primary-500 mb-2">
                {result.compliance_score}%
              </div>
              <div className="text-gray-400 mb-4">
                Índice de Cumplimiento Legal
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getRiskColor(result.risk_level)}`}>
                Riesgo {result.risk_level?.toUpperCase()}
              </span>
            </div>
          </div>

          {result.category_scores && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Puntaje por Categoría</h2>
              <div className="space-y-4">
                {Object.entries(result.category_scores).map(([category, scores]) => {
                  const percentage = Math.round((scores.total / scores.max) * 100);
                  return (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-300">{category}</span>
                        <span className="text-gray-400">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            percentage >= 75 ? 'bg-green-500' :
                            percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-300 mb-2">💡 Recomendaciones</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-400 text-sm">
              {result.compliance_score < 50 && (
                <>
                  <li>Tu empresa tiene riesgos legales significativos que requieren atención inmediata.</li>
                  <li>Considera contratar asesoría legal especializada.</li>
                  <li>Prioriza las categorías con menor puntaje.</li>
                </>
              )}
              {result.compliance_score >= 50 && result.compliance_score < 75 && (
                <>
                  <li>Tu empresa tiene cumplimiento parcial. Revisa las áreas críticas.</li>
                  <li>Implementa un plan de mejora continua.</li>
                  <li>Documenta todos los procesos legales.</li>
                </>
              )}
              {result.compliance_score >= 75 && (
                <>
                  <li>¡Excelente! Tu empresa tiene buen cumplimiento legal.</li>
                  <li>Mantén actualizada tu documentación.</li>
                  <li>Revisa periódicamente cambios normativos.</li>
                </>
              )}
            </ul>
          </div>

          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Realizar Nuevo Diagnóstico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold mb-2 text-white">Diagnóstico Legal Corporativo</h1>
        <p className="text-gray-400 mb-6">
          Responde las siguientes preguntas para obtener un análisis de cumplimiento legal de tu empresa.
        </p>

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-primary-400 border-b-2 border-primary-600 pb-2">
                {category}
              </h2>
              <div className="space-y-6">
                {categoryQuestions.map((question) => (
                  <div key={question.id} className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="font-medium mb-3 text-gray-200">{question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded transition"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {submitting ? 'Procesando...' : 'Enviar Diagnóstico'}
          </button>
        </form>
      </div>
    </div>
  );
}
