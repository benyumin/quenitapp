import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SignUp = ({ onSignUp, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    telefono: '',
    direccion: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
            telefono: formData.telefono,
            direccion: formData.direccion
          }
        }
      });

      if (authError) throw authError;

              // 2. Crear perfil en la tabla clientes (NO profiles)
        if (authData.user) {
          const { error: clienteError } = await supabase
            .from('clientes')
            .insert([
              {
                id: authData.user.id, // Usar el ID de auth.users
                nombre: formData.nombre,
                telefono: formData.telefono,
                email: formData.email
              }
            ]);

          if (clienteError) {
            console.error('Error creating cliente:', clienteError);
            // No lanzamos error aquí porque el usuario ya se creó en Auth
          }
        }

      setMessage('¡Cuenta creada exitosamente! Revisa tu correo para confirmar tu cuenta.');
      
      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        telefono: '',
        direccion: ''
      });

      // Opcional: cambiar a login después de 3 segundos
      setTimeout(() => {
        onSwitchToLogin();
      }, 3000);

    } catch (error) {
      console.error('Error during signup:', error);
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Crear Cuenta</h2>
        
        {message && (
          <div className="auth-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="auth-message error">
            {error}
          </div>
        )}

        <div className="form-group">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="auth-input"
          />
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="auth-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={handleChange}
            required
            className="auth-input"
          />
        </div>

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

        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
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
          {loading ? '🔄 Creando cuenta...' : '🚀 Crear Cuenta'}
        </button>

        <div className="auth-switch">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="auth-link"
          >
            Iniciar sesión
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
