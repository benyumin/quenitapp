import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Login = ({ onLogin, onSwitchToSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      if (data.user) {
        // Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        // Llamar onLogin con usuario y perfil
        onLogin(data.user, profile);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetMsg('');
    setError('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: window.location.origin
      });
      
      if (error) throw error;
      
      setResetMsg('¡Revisa tu correo para cambiar la contraseña!');
    } catch (error) {
      console.error('Error during password reset:', error);
      setError(error.message || 'Error al enviar correo de recuperación');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2 className="auth-title">Iniciar Sesión</h2>
        
        {resetMsg && (
          <div className="auth-message success">
            {resetMsg}
          </div>
        )}

        {error && (
          <div className="auth-message error">
            {error}
          </div>
        )}

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-input"
          />
        </div>

        {!showReset && (
          <>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              className="auth-button primary"
              disabled={loading}
            >
              {loading ? '🔄 Entrando...' : '🚀 Iniciar Sesión'}
            </button>

            <div className="auth-actions">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="auth-link"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="auth-switch">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="auth-link"
              >
                Crear cuenta
              </button>
            </div>
          </>
        )}

        {showReset && (
          <>
            <button
              type="button"
              onClick={() => setShowReset(false)}
              className="auth-link back-link"
            >
              ← Volver al login
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="auth-button secondary"
              disabled={!formData.email}
            >
              Enviar correo de recuperación
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default Login; 