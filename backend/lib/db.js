import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validación
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Función de prueba de conexión
export const checkConnection = async () => {
  const { data, error } = await supabase.from('users').select('id').limit(1);

  if (error) {
    console.error('❌ Supabase connection error:', error);
    throw error;
  }

  return data;
};
