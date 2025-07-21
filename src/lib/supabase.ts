import { createClient } from '@supabase/supabase-js';

// Usar variables de entorno del .env actualizado
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://oqohrltzgvabamkbrtyc.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb2hybHR6Z3ZhYmFta2JydHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODUwMTYsImV4cCI6MjA2ODU2MTAxNn0.6MEZbzdxSqmCCm6myVC0hlV-zGHPjVW4Qx4wMO3uP74";

// Log de configuración (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔧 Configuración Supabase:', {
    url: supabaseUrl,
    keyPreview: supabaseAnonKey.substring(0, 30) + '...',
    region: 'us-east-2'
  });
}

// Crear cliente con configuración optimizada para S3 storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
      'x-storage-region': 'us-east-2',
      // Headers adicionales para mejorar conectividad
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
  // Configuración específica para storage
  db: {
    schema: 'public'
  },
  // Configuración de timeout y reintentos
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Función de diagnóstico para probar la conexión
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Probando conexión con Supabase...');
    
    // Probar auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Estado de autenticación:', { 
      isAuthenticated: !!user, 
      email: user?.email,
      error: authError?.message 
    });
    
    // Probar storage
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    console.log('📦 Estado de storage:', { 
      bucketsCount: buckets?.length || 0, 
      buckets: buckets?.map(b => b.id),
      error: storageError?.message 
    });
    
    return {
      auth: { success: !authError, user: !!user },
      storage: { success: !storageError, buckets: buckets?.length || 0 }
    };
    
  } catch (error) {
    console.error('❌ Error al probar conexión:', error);
    return { error };
  }
};

// En desarrollo, probar conexión automáticamente
if (import.meta.env.DEV) {
  testSupabaseConnection();
}
