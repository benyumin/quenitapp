import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { getConfirmationParams, ROUTES } from '../../routes';

const EmailConfirmation = () => {
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('');
  const { signIn, refreshUserProfile } = useAuth();

  useEffect(() => {
    const processEmailConfirmation = async () => {
      try {
        // Obtener el token de la URL usando la función configurada
        const { token, type } = getConfirmationParams();

        if (!token) {
          setStatus('error');
          setMessage('Token de confirmación no encontrado');
          return;
        }

        if (type === 'signup') {
          // Procesar confirmación de registro
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            console.error('Error verificando email:', error);
            setStatus('error');
            setMessage('Error al verificar el email: ' + error.message);
            return;
          }

          if (data.user) {
            // Usuario confirmado exitosamente
            setStatus('success');
            setMessage('¡Email confirmado exitosamente! Iniciando sesión...');
            
            // Iniciar sesión automáticamente
            setTimeout(async () => {
              try {
                // Obtener la sesión actual
                const { data: sessionData } = await supabase.auth.getSession();
                if (sessionData.session) {
                  console.log('Usuario confirmado y logueado, refrescando perfil...');
                  
                  // Refrescar el perfil del usuario
                  if (refreshUserProfile) {
                    await refreshUserProfile();
                  }
                  
                  // Usuario ya está logueado, redirigir a la app principal
                  window.location.href = ROUTES.HOME;
                } else {
                  // Si no hay sesión, mostrar mensaje de éxito
                  setMessage('¡Email confirmado! Ahora puedes iniciar sesión.');
                }
              } catch (error) {
                console.error('Error obteniendo sesión:', error);
              }
            }, 2000);
          }
        } else if (type === 'recovery') {
          // Procesar recuperación de contraseña
          setStatus('success');
          setMessage('¡Enlace de recuperación válido! Puedes cambiar tu contraseña.');
        } else {
          setStatus('error');
          setMessage('Tipo de confirmación no válido');
        }

      } catch (error) {
        console.error('Error procesando confirmación:', error);
        setStatus('error');
        setMessage('Error inesperado: ' + error.message);
      }
    };

    processEmailConfirmation();
  }, [refreshUserProfile]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return '🔄';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return '#2196f3';
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      default:
        return '#666';
    }
  };

  if (status === 'processing') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
        <h1 style={{ color: '#2196f3', marginBottom: '20px' }}>
          Procesando Confirmación...
        </h1>
        <p style={{ color: '#666', textAlign: 'center', maxWidth: '400px' }}>
          Estamos verificando tu email. Por favor espera un momento.
        </p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #2196f3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginTop: '20px'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>
        {getStatusIcon()}
      </div>
      
      <h1 style={{ 
        color: getStatusColor(), 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        {status === 'success' ? '¡Confirmación Exitosa!' : 'Error en la Confirmación'}
      </h1>
      
      <p style={{ 
        color: '#666', 
        textAlign: 'center', 
        maxWidth: '400px',
        marginBottom: '30px'
      }}>
        {message}
      </p>

      {status === 'success' && (
        <button
          onClick={() => window.location.href = ROUTES.HOME}
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🚀 Ir a la Aplicación
        </button>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => window.location.href = ROUTES.SIGNUP}
            style={{
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            📝 Intentar de Nuevo
          </button>
          
          <button
            onClick={() => window.location.href = ROUTES.HOME}
            style={{
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🏠 Ir al Inicio
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailConfirmation;
