// ================================================
// CONFIGURACIÓN SUPABASE CON S3 STORAGE
// ================================================

import { createClient } from '@supabase/supabase-js';

// Configuración para proyecto con S3 storage habilitado
const supabaseUrl = "https://oqohrltzgvabamkbrtyc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb2hybHR6Z3ZhYmFta2JydHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODUwMTYsImV4cCI6MjA2ODU2MTAxNn0.6MEZbzdxSqmCCm6myVC0hlV-zGHPjVW4Qx4wMO3uP74";

// Crear cliente con configuración específica para S3
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  // Configuración específica para S3 storage
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
      'x-storage-region': 'us-east-2'
    }
  }
});

// Funciones helper específicas para S3
export const s3Storage = {
  // Función para listar buckets con S3
  async listBuckets() {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('Error listando buckets:', error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (err) {
      console.error('Error de conexión S3:', err);
      return { data: null, error: err };
    }
  },

  // Función para subir archivo con configuración S3
  async uploadFile(bucketName, fileName, file, options = {}) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          ...options
        });
      
      if (error) {
        console.error('Error subiendo archivo S3:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Error de subida S3:', err);
      return { data: null, error: err };
    }
  },

  // Función para obtener URL pública con S3
  getPublicUrl(bucketName, fileName) {
    try {
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      return data;
    } catch (err) {
      console.error('Error obteniendo URL S3:', err);
      return null;
    }
  }
};
