import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface CompanyData {
  id?: number;
  name: string;
  industry: string;
  employees: string;
  incorporationDate: string;
  country: string;
  corporateVehicle: string;
}

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyData>({
    name: '',
    industry: '',
    employees: '',
    incorporationDate: '',
    country: '',
    corporateVehicle: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (user.company_id) {
        const response = await apiService.get(`/companies/${user.company_id}`);
        if (response.success && response.company) {
          // Map DB fields to frontend fields
          setCompany({
            id: response.company.id,
            name: response.company.name || '',
            industry: response.company.industry || '',
            employees: response.company.employee_count || '',
            incorporationDate: response.company.incorporation_date || '',
            country: response.company.country || '',
            corporateVehicle: response.company.corporate_vehicle || ''
          });
        }
      }
      setError('');
    } catch (err: any) {
      // If company doesn't exist, just use empty form
      console.log('Company not found or error loading:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.name) {
      setError('Nombre de la empresa es obligatorio');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Use upsert endpoint (handles both create and update)
      const response = await apiService.post('/companies/upsert', company);

      if (response.success && response.data) {
        // Update local state with saved data
        setCompany({
          id: response.data.id,
          name: response.data.name || '',
          industry: response.data.industry || '',
          employees: response.data.employee_count || '',
          incorporationDate: response.data.incorporation_date || '',
          country: response.data.country || '',
          corporateVehicle: response.data.corporate_vehicle || ''
        });
        setSuccess('Información guardada correctamente');
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar información');
      console.error('Save company error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Información de la Empresa</h1>
        <p className="text-gray-400">Datos fiscales y corporativos</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre de la Empresa */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de la Empresa <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={company.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: Innovatech Solutions S.A.S."
            />
          </div>

          {/* Industria */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sector / Industria
            </label>
            <select
              name="industry"
              value={company.industry}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccionar...</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Comercio">Comercio</option>
              <option value="Manufactura">Manufactura</option>
              <option value="Servicios">Servicios</option>
              <option value="Construcción">Construcción</option>
              <option value="Salud">Salud</option>
              <option value="Educación">Educación</option>
              <option value="Financiero">Financiero</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Número de Empleados */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Número de Empleados
            </label>
            <input
              type="number"
              name="employees"
              value={company.employees}
              onChange={handleChange}
              min="0"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: 25"
            />
          </div>

          {/* País */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              País
            </label>
            <select
              name="country"
              value={company.country}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccionar...</option>
              <option value="Colombia">Colombia</option>
              <option value="México">México</option>
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
              <option value="Perú">Perú</option>
              <option value="España">España</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Vehículo Corporativo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Sociedad
            </label>
            <select
              name="corporateVehicle"
              value={company.corporateVehicle}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccionar...</option>
              <option value="S.A.S.">S.A.S. (Sociedad por Acciones Simplificada)</option>
              <option value="S.A.">S.A. (Sociedad Anónima)</option>
              <option value="Ltda.">Ltda. (Sociedad Limitada)</option>
              <option value="E.U.">E.U. (Empresa Unipersonal)</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Fecha de Constitución */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha de Constitución
            </label>
            <input
              type="date"
              name="incorporationDate"
              value={company.incorporationDate}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {saving ? 'Guardando...' : company.id ? 'Actualizar Información' : 'Guardar Información'}
          </button>
          <button
            type="button"
            onClick={loadCompanyData}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <h3 className="font-semibold text-blue-300 mb-2">💡 Importante</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm">
          <li>Mantén actualizada la información corporativa para cumplimiento legal.</li>
          <li>Esta información se utilizará en diagnósticos y reportes del sistema.</li>
          <li>Solo el nombre de la empresa es obligatorio, los demás campos son opcionales.</li>
        </ul>
      </div>
    </div>
  );
}
