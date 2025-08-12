import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SimpleAuth from '../Auth/SimpleAuth';
import OrderManager from '../Orders/OrderManager';

const DemoPage = () => {
  const { user, profile, isAuthenticated, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // You can add any additional logic here after successful auth
  };

  const handleLogout = async () => {
    await signOut();
    setActiveTab('orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🍔 Quenitapp Demo
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                                     <div className="text-sm text-gray-700">
                     <span className="font-medium">Hola, {profile?.nombre || user?.email}</span>
                   </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!isAuthenticated ? (
          /* Welcome Screen for Guests */
          <div className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bienvenido a Quenitapp
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Sistema de autenticación y gestión de pedidos con Supabase
              </p>
              
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  🚀 Características
                </h3>
                <ul className="text-left space-y-2 text-gray-600">
                  <li>✅ Registro de usuarios con email y contraseña</li>
                  <li>✅ Inicio de sesión seguro</li>
                  <li>✅ Perfiles de usuario personalizables</li>
                  <li>✅ Sistema de pedidos completo</li>
                  <li>✅ Personalización de productos</li>
                  <li>✅ Historial de pedidos</li>
                  <li>✅ Sin RLS para desarrollo</li>
                </ul>
              </div>

              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                🚀 Comenzar Ahora
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated User Dashboard */
          <div>
            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                👤 Información del Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                                 <div>
                   <p className="text-sm font-medium text-gray-500">Nombre</p>
                   <p className="text-gray-900">{profile?.nombre || 'No especificado'}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-500">Teléfono</p>
                   <p className="text-gray-900">{profile?.telefono || 'No especificado'}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-500">Email</p>
                   <p className="text-gray-900">{profile?.email || 'No especificado'}</p>
                 </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'orders'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📋 Mis Pedidos
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'profile'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    ⚙️ Configuración
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'orders' && <OrderManager />}
                {activeTab === 'profile' && (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Configuración del Perfil
                    </h3>
                    <p className="text-gray-600">
                      Funcionalidad de edición de perfil próximamente...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <SimpleAuth
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default DemoPage;
