import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../components/lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  // Función para obtener el perfil completo del usuario
  const fetchUserProfile = async (userId) => {
    try {
      if (!userId) {
        console.log('No hay userId para obtener perfil');
        return null;
      }
      
      console.log('Buscando perfil para usuario:', userId);
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error obteniendo perfil del usuario:', error);
        return null;
      }
      
      console.log('Perfil encontrado en BD:', data);
      return data;
    } catch (error) {
      console.error('Error en fetchUserProfile:', error);
      return null;
    }
  };

  // Función para refrescar el perfil del usuario
  const refreshUserProfile = async () => {
    if (user?.id) {
      console.log('Refrescando perfil del usuario...');
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
      return userProfile;
    }
    return null;
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      // Si hay usuario, obtener su perfil
      if (session?.user) {
        console.log('Usuario encontrado en sesión inicial:', session.user.id);
        const userProfile = await fetchUserProfile(session.user.id);
        console.log('Perfil obtenido:', userProfile);
        setProfile(userProfile);
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Si hay usuario, obtener su perfil
        if (session?.user) {
          console.log('Usuario autenticado, obteniendo perfil...');
          const userProfile = await fetchUserProfile(session.user.id);
          console.log('Perfil actualizado:', userProfile);
          setProfile(userProfile);
        } else {
          console.log('Usuario no autenticado, limpiando perfil');
          setProfile(null);
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return { success: true, data, error: null }
    } catch (error) {
      return { success: false, data: null, error: error.message }
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      if (error) throw error
      return { success: true, data, error: null }
    } catch (error) {
      return { success: false, data: null, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser(updates)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    fetchUserProfile,
    refreshUserProfile,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
