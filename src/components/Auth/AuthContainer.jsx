import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import { useAuth } from '../../contexts/AuthContext';

const AuthContainer = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp } = useAuth();

  const handleLogin = async (user, profile) => {
    // El contexto ya maneja el estado del usuario
    // Solo cerramos el modal
    onClose();
  };

  const handleSignUp = async (userData) => {
    // El contexto ya maneja el estado del usuario
    // Solo cerramos el modal
    onClose();
  };

  const handleSwitchToSignUp = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button 
          className="auth-close-btn"
          onClick={onClose}
          aria-label="Cerrar modal de autenticación"
        >
          ✕
        </button>
        
        {isLogin ? (
          <Login 
            onLogin={handleLogin}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        ) : (
          <SignUp 
            onSignUp={handleSignUp}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </div>
    </div>
  );
};

export default AuthContainer;
