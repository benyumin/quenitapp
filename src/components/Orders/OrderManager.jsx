import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createOrder, getUserOrders, getAllOrders } from '../../lib/authService';

const OrderManager = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    product: '',
    quantity: 1,
    total_price: 0,
    personalization: {}
  });

  // Fetch orders on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const result = await getUserOrders(user.id);
      if (result.success) {
        setOrders(result.orders);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Debes estar logueado para crear un pedido');
      return;
    }

    if (!newOrder.product || newOrder.quantity <= 0 || newOrder.total_price <= 0) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        user_id: user.id,
        product: newOrder.product,
        quantity: newOrder.quantity,
        total_price: newOrder.total_price,
        personalization: newOrder.personalization
      };

      const result = await createOrder(orderData);
      
      if (result.success) {
        setOrders([result.order, ...orders]);
        setNewOrder({
          product: '',
          quantity: 1,
          total_price: 0,
          personalization: {}
        });
        setShowCreateForm(false);
        setError('');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'total_price' ? parseInt(value) || 0 : value
    }));
  };

  const addPersonalization = () => {
    setNewOrder(prev => ({
      ...prev,
      personalization: {
        ...prev.personalization,
        [`extra_${Object.keys(prev.personalization).length + 1}`]: ''
      }
    }));
  };

  const updatePersonalization = (key, value) => {
    setNewOrder(prev => ({
      ...prev,
      personalization: {
        ...prev.personalization,
        [key]: value
      }
    }));
  };

  const removePersonalization = (key) => {
    setNewOrder(prev => {
      const newPersonalization = { ...prev.personalization };
      delete newPersonalization[key];
      return {
        ...prev,
        personalization: newPersonalization
      };
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Debes iniciar sesión para ver tus pedidos</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Mis Pedidos
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? '❌ Cancelar' : '➕ Nuevo Pedido'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Create Order Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Crear Nuevo Pedido</h3>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <input
                  type="text"
                  name="product"
                  value={newOrder.product}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Completo Italiano"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={newOrder.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Total (CLP) *
                </label>
                <input
                  type="number"
                  name="total_price"
                  value={newOrder.total_price}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="4000"
                />
              </div>
            </div>

            {/* Personalization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personalización
              </label>
              <div className="space-y-2">
                {Object.entries(newOrder.personalization).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const newPersonalization = { ...newOrder.personalization };
                        delete newPersonalization[key];
                        newPersonalization[newKey] = value;
                        setNewOrder(prev => ({
                          ...prev,
                          personalization: newPersonalization
                        }));
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Clave"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updatePersonalization(key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Valor"
                    />
                    <button
                      type="button"
                      onClick={() => removePersonalization(key)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      ❌
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPersonalization}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                >
                  ➕ Agregar Personalización
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '🔄 Creando...' : '✅ Crear Pedido'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Historial de Pedidos ({orders.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">🔄 Cargando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No tienes pedidos aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {order.product}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Cantidad: {order.quantity} | Precio: ${order.total_price.toLocaleString('es-CL')} CLP
                    </p>
                    <p className="text-sm text-gray-500">
                      Fecha: {new Date(order.date).toLocaleDateString('es-CL')}
                    </p>
                    {order.personalization && Object.keys(order.personalization).length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Personalización:</p>
                        <div className="mt-1 space-y-1">
                          {Object.entries(order.personalization).map(([key, value]) => (
                            <span key={key} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Pedido #{order.id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManager;
