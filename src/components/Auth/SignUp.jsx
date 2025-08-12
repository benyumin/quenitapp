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

  // Función para probar la conexión y estructura de la base de datos
  const testDatabaseConnection = async () => {
    try {
      console.log('Probando conexión a Supabase...');
      
      const { data: testData, error: testError } = await supabase
        .from('clientes')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.error('Error al conectar con la tabla clientes:', testError);
        return false;
      }
      
      console.log('Conexión exitosa. Estructura de la tabla clientes:', testData);
      return true;
    } catch (error) {
      console.error('Error en la prueba de conexión:', error);
      return false;
    }
  };

  // Función para enviar código de verificación
  const sendVerificationCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Crear usuario directamente en Supabase Auth con confirmación de email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
            telefono: formData.telefono,
            direccion: formData.direccion
          },
          emailRedirectTo: `${window.location.origin}/confirm-email`
        }
      });

      if (authError) {
        console.error('Error creando usuario:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se recibió información del usuario creado');
      }

      console.log('Usuario creado en Auth:', authData.user);

      // Crear perfil en la tabla clientes
      const { error: clienteError } = await supabase
        .from('clientes')
        .insert([
          {
            id: authData.user.id,
            nombre: formData.nombre,
            telefono: formData.telefono,
            email: formData.email,
            direccion: formData.direccion
          }
        ]);

      if (clienteError) {
        console.error('Error creating cliente:', clienteError);
        // No lanzamos error aquí porque el usuario ya se creó en Auth
      }

      // Mostrar mensaje de éxito y instrucciones
      setMessage(`¡Cuenta creada exitosamente!

📧 Se ha enviado un email de confirmación a ${formData.email}

✅ Por favor revisa tu bandeja de entrada y haz clic en el enlace de confirmación

🔄 Una vez confirmado, podrás iniciar sesión automáticamente`);

      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        telefono: '',
        direccion: ''
      });

      // Cambiar a modo de éxito
      // setStep('success'); // This line is removed
      
    } catch (error) {
      console.error('Error durante el registro:', error);
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

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

    if (!formData.telefono || formData.telefono.length < 8) {
      setError('Ingresa un número de teléfono válido');
      return;
    }

    // Validar formato de teléfono (debe contener solo números y algunos caracteres especiales)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(formData.telefono)) {
      setError('Formato de teléfono inválido. Usa solo números, espacios, guiones y paréntesis');
      return;
    }

    // Enviar código de verificación
    await sendVerificationCode();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderizar paso de formulario
  return (
    <div className="auth-container">
      {/* Botón de prueba de conexión */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={testDatabaseConnection}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔍 Probar Conexión DB
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Crear Cuenta</h2>
        
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #2196f3'
        }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#1976d2' }}>
            <strong>📧 Proceso de Registro:</strong><br/>
            1. Completa el formulario<br/>
            2. Se crea tu cuenta<br/>
            3. Recibe email de confirmación<br/>
            4. Haz clic en el enlace del email<br/>
            5. ¡Tu cuenta estará verificada y lista!
          </p>
        </div>
        
        {error && (
          <div className="auth-message error">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-message success" style={{ whiteSpace: 'pre-line' }}>
            {message}
          </div>
        )}

        <div className="form-group">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo *"
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
            placeholder="Teléfono *"
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
            placeholder="Dirección *"
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
            placeholder="Email *"
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
            placeholder="Contraseña *"
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
            placeholder="Confirmar contraseña *"
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
