import { createClient } from '@supabase/supabase-js';

// Credenciais do projeto GoDevs (APENAS LEITURA)
const goDevsUrl = import.meta.env.VITE_GODEVS_SUPABASE_URL;
const goDevsAnonKey = import.meta.env.VITE_GODEVS_SUPABASE_ANON_KEY;

if (!goDevsUrl || !goDevsAnonKey) {
  console.warn('⚠️ GoDevs Supabase não configurado. Importação de dados desabilitada.');
}

// Cliente READ-ONLY para GoDevs
export const supabaseGoDevs = goDevsUrl && goDevsAnonKey 
  ? createClient(goDevsUrl, goDevsAnonKey, {
      global: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      },
    })
  : null;

// Verificar se está disponível
export const isGoDevsAvailable = () => supabaseGoDevs !== null;

// Log de status
if (isGoDevsAvailable()) {
  console.log('✅ GoDevs Supabase conectado:', goDevsUrl);
} else {
  console.log('❌ GoDevs Supabase não configurado');
}

