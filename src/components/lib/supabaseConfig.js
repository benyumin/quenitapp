// Configuración de Supabase para la aplicación
export const SUPABASE_CONFIG = {
  // URL y clave de Supabase
  url: 'https://ydyvamdzaqtgjuozlxow.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeXZhbWR6YXF0Z2p1b3pseG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjE5NDksImV4cCI6MjA2ODYzNzk0OX0.EWMerWMbvCLGCf6cQDfha0wjNIa5MowfxXL2gfzW3dM',
  
  // Configuración de autenticación
  auth: {
    // URL de redirección para confirmación de email
    emailRedirectTo: `${window.location.origin}/confirm-email`,
    
    // Configuración de cookies
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    },
    
    // Configuración de persistencia
    persistSession: true,
    
    // Configuración de detección de sesión
    detectSessionInUrl: true,
    
    // Configuración de flujo de autenticación
    flowType: 'pkce'
  },
  
  // Configuración de la base de datos
  db: {
    // Configuración de RLS
    enableRLS: true,
    
    // Configuración de políticas por defecto
    defaultPolicies: {
      enableSelect: true,
      enableInsert: true,
      enableUpdate: true,
      enableDelete: false
    }
  },
  
  // Configuración de almacenamiento
  storage: {
    // Configuración de buckets
    buckets: {
      avatars: 'avatars',
      products: 'products',
      documents: 'documents'
    },
    
    // Configuración de políticas de almacenamiento
    policies: {
      enablePublicAccess: false,
      enableAuthenticatedAccess: true
    }
  },
  
  // Configuración de funciones edge
  functions: {
    // Configuración de regiones
    regions: ['us-east-1'],
    
    // Configuración de timeout
    timeout: 30000
  }
};

// Función para obtener la configuración de redirección
export const getRedirectConfig = () => {
  const baseUrl = window.location.origin;
  return {
    signUp: `${baseUrl}/confirm-email`,
    signIn: `${baseUrl}/`,
    resetPassword: `${baseUrl}/reset-password`,
    updatePassword: `${baseUrl}/update-password`
  };
};

// Función para configurar Supabase con opciones personalizadas
export const configureSupabase = (options = {}) => {
  const config = {
    ...SUPABASE_CONFIG,
    ...options
  };
  
  // Configurar redirecciones personalizadas
  if (config.auth) {
    config.auth.emailRedirectTo = getRedirectConfig().signUp;
  }
  
  return config;
};
