import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  updateProfile 
} from '../lib/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setError(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch warning:', error);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  const signUp = useCallback(async (email, password, userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await registerUser(email, password, userData);
      
      if (result.success) {
        setUser(result.user);
        
        await fetchProfile(result.user.id);
        return { success: true, error: null };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        setUser(result.user);
        setProfile(result.profile);
        return { success: true, error: null };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await logoutUser();
      
      if (result.success) {
        setUser(null);
        setProfile(null);
        return { success: true, error: null };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (updates) => {
    if (!user?.id) {
      setError('No user logged in');
      return { success: false, error: 'No user logged in' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateProfile(user.id, updates);
      
      if (result.success) {
        setProfile(result.profile);
        return { success: true, error: null };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    
    signUp,
    signIn,
    signOut,
    updateProfile: updateUserProfile,
    clearError,
    
    isAuthenticated: !!user,
    isGuest: !user
  };
};
