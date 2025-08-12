import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, FiUser, FiPhone, FiMapPin, FiShoppingCart, FiDollarSign, 
  FiCheckCircle, FiRefreshCw, FiPlus, FiSearch, FiX, FiSave 
} from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import './CajeroPanel.css';

const CajeroPanel = ({ onBack, setRoute }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNuevoPedido, setShowNuevoPedido] = useState(false);

  // Form states
  const [clienteNombre, setClienteNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [producto, setProducto] = useState('');
  const [precio, setPrecio] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('retiro');
  const [direccion, setDireccion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const crearNuevoPedido = async () => {
    if (!clienteNombre.trim() || !telefono.trim() || !producto.trim() || !precio.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const nuevoPedido = {
        nombre: clienteNombre.trim(),
        telefono: telefono.trim(),
        producto: producto.trim(),
        precio_total: parseFloat(precio),
        direccion: tipoEntrega === 'domicilio' ? direccion.trim() : 'Retiro en local',
        observaciones: observaciones.trim(),
        estado: 'PENDIENTE',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('pedidos')
        .insert([nuevoPedido])
        .select();

      if (error) throw error;

      setPedidos(prev => [data[0], ...prev]);
      limpiarFormulario();
      setShowNuevoPedido(false);
      alert('Pedido creado exitosamente');
    } catch (error) {
      console.error('Error creating pedido:', error);
      alert('Error al crear el pedido');
    }
  };

  const limpiarFormulario = () => {
    setClienteNombre('');
    setTelefono('');
    setProducto('');
    setPrecio('');
    setTipoEntrega('retiro');
    setDireccion('');
    setObservaciones('');
  };

  const filtrarPedidos = () => {
    let pedidosFiltrados = pedidos;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      pedidosFiltrados = pedidosFiltrados.filter(p => 
        p.nombre?.toLowerCase().includes(term) ||
        p.producto?.toLowerCase().includes(term) ||
        p.telefono?.includes(term)
      );
    }

    return pedidosFiltrados.slice(0, 20); // Mostrar solo los últimos 20
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (estado) => {
    const colors = {
      'PENDIENTE': 'pending',
      'EN_PREPARACION': 'urgent',
      'LISTO': 'ready',
      'PAGADO': 'info',
      'EN_ENTREGA': 'pending',
      'ENTREGADO': 'ready',
      'CANCELADO': 'urgent'
    };
    return colors[estado] || 'info';
  };

  const pedidosFiltrados = filtrarPedidos();

  return (
    <div className="cajero-container">
      {/* Cashier Header */}
      <div className="cajero-header">
        <div className="cajero-title">
          <h1>👥 Cajero</h1>
        </div>
        <div className="cajero-actions">
          <button 
            onClick={() => setShowNuevoPedido(!showNuevoPedido)} 
            className={`cajero-btn cajero-btn-lg ${showNuevoPedido ? 'cajero-btn-danger' : 'cajero-btn-success'}`}
          >
            {showNuevoPedido ? <FiX /> : <FiPlus />}
            {showNuevoPedido ? 'Cancelar' : '+ Nuevo Pedido'}
          </button>
          <button onClick={fetchPedidos} disabled={loading} className="cajero-btn cajero-btn-secondary">
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button onClick={onBack} className="cajero-btn cajero-btn-ghost">
            <FiArrowLeft />
            Volver
          </button>
        </div>
      </div>

      {showNuevoPedido && (
        <div className="cajero-new-order">
          <h2>📝 Nuevo Pedido</h2>
          <p>Crear un nuevo pedido</p>
          
          <div className="cajero-form-grid">
            <div className="cajero-form-card">
              <div className="cajero-form-info">
                <div className="cajero-form-item">
                  <span className="cajero-form-label">👤 Nombre del Cliente *</span>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Nombre completo"
                    className="cajero-form-input"
                  />
                </div>
                
                <div className="cajero-form-item">
                  <span className="cajero-form-label">📞 Teléfono *</span>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="cajero-form-input"
                  />
                </div>
                
                <div className="cajero-form-item">
                  <span className="cajero-form-label">🍔 Producto *</span>
                  <input
                    type="text"
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    placeholder="Nombre del producto"
                    className="cajero-form-input"
                  />
                </div>
                
                <div className="cajero-form-item">
                  <span className="cajero-form-label">💰 Precio *</span>
                  <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="0"
                    className="cajero-form-input"
                  />
                </div>
                
                <div className="cajero-form-item">
                  <span className="cajero-form-label">🚚 Tipo de Entrega</span>
                  <select
                    value={tipoEntrega}
                    onChange={(e) => setTipoEntrega(e.target.value)}
                    className="cajero-form-select"
                  >
                    <option value="retiro">🏪 Retiro en Local</option>
                    <option value="domicilio">🚚 Domicilio</option>
                  </select>
                </div>
                
                {tipoEntrega === 'domicilio' && (
                  <div className="cajero-form-item">
                    <span className="cajero-form-label">📍 Dirección</span>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Dirección completa"
                      className="cajero-form-input"
                    />
                  </div>
                )}
                
                <div className="cajero-form-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="cajero-form-label">📝 Observaciones</span>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Notas especiales del pedido..."
                    rows="3"
                    className="cajero-form-textarea"
                  />
                </div>
              </div>
              
              <div className="cajero-form-actions">
                <button
                  onClick={crearNuevoPedido}
                  className="cajero-form-btn complete"
                  style={{ width: '100%' }}
                >
                  <FiSave />
                  Crear Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cashier Search */}
      <div className="cajero-search">
        <div className="cajero-search-box">
          <FiSearch className="cajero-search-icon" />
          <input
            type="text"
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Cashier Orders */}
      <div className="cajero-orders">
        {loading ? (
          <div className="cajero-loading">
            <FiRefreshCw className="cajero-loading-icon" />
            <div>Cargando pedidos...</div>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="cajero-empty">
            <FiShoppingCart className="cajero-empty-icon" />
            <h3>No hay pedidos</h3>
            <p>No se encontraron pedidos</p>
          </div>
        ) : (
          <div className="cajero-orders-grid">
            {pedidosFiltrados.map(pedido => {
              const statusColor = getStatusColor(pedido.estado);
              
              return (
                <div key={pedido.id} className={`cajero-order-card ${statusColor}`}>
                  <div className="cajero-order-header">
                    <div className="cajero-customer-info">
                      <div className="cajero-customer-avatar">
                        {pedido.nombre?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="cajero-customer-details">
                        <h4>{pedido.nombre || 'Cliente'}</h4>
                        <p>
                          <FiPhone />
                          {pedido.telefono || 'Sin teléfono'}
                        </p>
                      </div>
                    </div>
                    <div className="cajero-order-status">
                      <span className="cajero-status-badge">
                        {pedido.estado === 'PENDIENTE' && '⏳'}
                        {pedido.estado === 'EN_PREPARACION' && '👨‍🍳'}
                        {pedido.estado === 'LISTO' && '✅'}
                        {pedido.estado === 'PAGADO' && '💰'}
                        {pedido.estado === 'EN_ENTREGA' && '🚚'}
                        {pedido.estado === 'ENTREGADO' && '🎉'}
                        {pedido.estado === 'CANCELADO' && '❌'}
                        {pedido.estado}
                      </span>
                      <span className="cajero-time-badge">
                        📅 {formatTime(pedido.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="cajero-order-content">
                    <div className="cajero-order-info">
                      <div className="cajero-order-item">
                        <span className="cajero-order-label">Producto</span>
                        <span className="cajero-order-value">{pedido.producto || 'Producto'}</span>
                      </div>
                      
                      {pedido.observaciones && (
                        <div className="cajero-order-item">
                          <span className="cajero-order-label">Notas</span>
                          <span className="cajero-order-value">{pedido.observaciones}</span>
                        </div>
                      )}
                      
                      <div className="cajero-order-item">
                        <span className="cajero-order-label">Tipo</span>
                        <span className="cajero-order-value">
                          {pedido.direccion && pedido.direccion.toLowerCase() !== 'retiro en local' ? 
                            '🚚 Domicilio' : '🏪 Retiro'
                          }
                        </span>
                      </div>
                      
                      <div className="cajero-order-item">
                        <span className="cajero-order-label">Precio</span>
                        <span className="cajero-order-price">${(pedido.precio_total || 0).toLocaleString()}</span>
                      </div>
                      
                      {pedido.direccion && pedido.direccion.toLowerCase() !== 'retiro en local' && (
                        <div className="cajero-order-item">
                          <span className="cajero-order-label">Dirección</span>
                          <span className="cajero-order-value">{pedido.direccion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CajeroPanel;