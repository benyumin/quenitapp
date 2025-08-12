import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createOrder, getUserOrders } from '../../lib/authService';

const TestPage = () => {
  const { user, profile, isAuthenticated, signOut } = useAuth();

  const testCreateOrder = async () => {
    if (!user?.id) {
      alert('Debes estar logueado para crear un pedido de prueba');
      return;
    }

    try {
      const testOrder = {
        user_id: user.id,
        product: 'Completo Italiano de Prueba',
        quantity: 1,
        total_price: 2500,
        personalization: {
          salsa: 'mayo',
          extra: 'palta',
          nota: 'Pedido de prueba'
        }
      };

      const result = await createOrder(testOrder);
      if (result.success) {
        alert('✅ Pedido de prueba creado exitosamente!');
        console.log('Pedido creado:', result.order);
      } else {
        alert('❌ Error al crear pedido: ' + result.error);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const testGetOrders = async () => {
    if (!user?.id) {
      alert('Debes estar logueado para obtener pedidos');
      return;
    }

    try {
      const result = await getUserOrders(user.id);
      if (result.success) {
        alert(`✅ Pedidos obtenidos: ${result.orders.length}`);
        console.log('Pedidos:', result.orders);
      } else {
        alert('❌ Error al obtener pedidos: ' + result.error);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🧪 Página de Pruebas
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Estado de Autenticación
        </h2>
        
        <div className="space-y-2">
          <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sí' : '❌ No'}</p>
          {user && (
            <>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </>
          )}
                     {profile && (
             <>
               <p><strong>Nombre:</strong> {profile.nombre}</p>
               <p><strong>Teléfono:</strong> {profile.telefono || 'No especificado'}</p>
               <p><strong>Email:</strong> {profile.email || 'No especificado'}</p>
             </>
           )}
        </div>
      </div>

      {isAuthenticated ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Pruebas de Funcionalidad
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={testCreateOrder}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              🧪 Crear Pedido de Prueba
            </button>
            
            <button
              onClick={testGetOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ml-4"
            >
              📋 Obtener Mis Pedidos
            </button>
            
            <button
              onClick={signOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors ml-4"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            ⚠️ No Autenticado
          </h2>
          <p className="text-yellow-700">
            Para probar las funcionalidades, primero debes iniciar sesión.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Información de la Base de Datos
        </h2>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Tabla <code>profiles</code>: Almacena información de usuarios</p>
          <p>• Tabla <code>orders</code>: Almacena pedidos de usuarios</p>
          <p>• Sin RLS habilitado para facilitar el desarrollo</p>
          <p>• Los perfiles se crean automáticamente al registrarse</p>
          <p>• Los pedidos se vinculan a usuarios a través de <code>user_id</code></p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
