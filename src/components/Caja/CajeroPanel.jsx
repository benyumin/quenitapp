import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, FiUser, FiPhone, FiMapPin, FiShoppingCart, FiDollarSign, 
  FiCheckCircle, FiRefreshCw, FiPlus, FiSearch, FiX, FiSave 
} from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

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
    <div className="admin-layout" style={{backgroundColor: 'var(--chef-bg-main)'}}>
      {/* Cashier Header */}
      <div className="admin-header">
        <div className="header-left">
          <div className="page-info">
            <h1>👥 CAJERO</h1>
            <p>Atención al cliente y nuevos pedidos</p>
          </div>
        </div>
        <div className="header-right">
          <button 
            onClick={() => setShowNuevoPedido(!showNuevoPedido)} 
            className={`chef-action-btn ${showNuevoPedido ? 'danger' : 'success'}`}
          >
            {showNuevoPedido ? <FiX /> : <FiPlus />}
            {showNuevoPedido ? 'CANCELAR' : 'NUEVO PEDIDO'}
          </button>
          <button onClick={fetchPedidos} disabled={loading} className="chef-action-btn">
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
          </button>
          <button onClick={onBack} className="chef-action-btn danger">
            <FiArrowLeft />
            VOLVER
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {showNuevoPedido && (
          <div className="chef-new-order-form">
            <h2 style={{
              fontSize: 'var(--chef-text-xl)', 
              fontWeight: '900', 
              marginBottom: 'var(--chef-space-lg)', 
              color: 'var(--color-text)',
              textAlign: 'center'
            }}>
              📝 NUEVO PEDIDO
            </h2>
            
            <div className="chef-form-grid">
              <div className="chef-form-row">
                <div className="chef-form-field">
                  <label>👤 NOMBRE DEL CLIENTE *</label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Nombre completo"
                    className="chef-form-input"
                  />
                </div>
                <div className="chef-form-field">
                  <label>📞 TELÉFONO *</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="chef-form-input"
                  />
                </div>
              </div>

              <div className="chef-form-row">
                <div className="chef-form-field">
                  <label>🍔 PRODUCTO *</label>
                  <input
                    type="text"
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    placeholder="Nombre del producto"
                    className="chef-form-input"
                  />
                </div>
                <div className="chef-form-field">
                  <label>💰 PRECIO *</label>
                  <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="0"
                    className="chef-form-input"
                  />
                </div>
              </div>

              <div className="chef-form-row">
                <div className="chef-form-field">
                  <label>🚚 TIPO DE ENTREGA</label>
                  <select
                    value={tipoEntrega}
                    onChange={(e) => setTipoEntrega(e.target.value)}
                    className="chef-form-input"
                  >
                    <option value="retiro">🏪 Retiro en Local</option>
                    <option value="domicilio">🚚 Domicilio</option>
                  </select>
                </div>
                {tipoEntrega === 'domicilio' && (
                  <div className="chef-form-field">
                    <label>📍 DIRECCIÓN</label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Dirección completa"
                      className="chef-form-input"
                    />
                  </div>
                )}
              </div>

              <div className="chef-form-field">
                <label>📝 OBSERVACIONES</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas especiales del pedido..."
                  className="chef-form-textarea"
                  rows="3"
                />
              </div>

              <div className="chef-form-actions">
                <button
                  onClick={crearNuevoPedido}
                  className="chef-action-btn success"
                  style={{width: '100%', fontSize: 'var(--chef-text-lg)', padding: 'var(--chef-space-lg)'}}
                >
                  <FiSave />
                  CREAR PEDIDO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="chef-search-section">
          <div className="chef-search-box" style={{maxWidth: '400px', margin: '0 auto'}}>
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="chef-orders-section">
          <h2 style={{
            fontSize: 'var(--chef-text-xl)', 
            fontWeight: '900', 
            marginBottom: 'var(--chef-space-lg)', 
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--chef-space-sm)',
            justifyContent: 'center'
          }}>
            <FiShoppingCart />
            HISTORIAL DE PEDIDOS ({pedidosFiltrados.length})
          </h2>
          
          {loading ? (
            <div className="chef-empty-state">
              <h3>🔄 Cargando...</h3>
              <p>Obteniendo pedidos</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="chef-empty-state">
              <h3>📋 No hay pedidos</h3>
              <p>No se encontraron pedidos</p>
            </div>
          ) : (
            <div className="chef-orders-grid">
              {pedidosFiltrados.map(pedido => {
                const statusColor = getStatusColor(pedido.estado);
                
                return (
                  <div key={pedido.id} className={`chef-order-card ${statusColor}`}>
                    <div className="chef-order-header">
                      <div className="chef-customer-info">
                        <div className="chef-customer-avatar">
                          {pedido.nombre?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="chef-customer-details">
                          <h4>{pedido.nombre || 'Cliente'}</h4>
                          <p>
                            <FiPhone />
                            {pedido.telefono || 'Sin teléfono'}
                          </p>
                        </div>
                      </div>
                      <div className="chef-order-status">
                        <span className={`chef-status-badge ${pedido.estado?.toLowerCase()}`}>
                          {pedido.estado === 'PENDIENTE' && '⏳'}
                          {pedido.estado === 'EN_PREPARACION' && '👨‍🍳'}
                          {pedido.estado === 'LISTO' && '✅'}
                          {pedido.estado === 'PAGADO' && '💰'}
                          {pedido.estado === 'EN_ENTREGA' && '🚚'}
                          {pedido.estado === 'ENTREGADO' && '🎉'}
                          {pedido.estado === 'CANCELADO' && '❌'}
                          {pedido.estado}
                        </span>
                        <span className="chef-time-badge">
                          📅 {formatTime(pedido.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="chef-order-info">
                      <div className="chef-order-items">
                        <div className="chef-order-item">
                          <span className="chef-item-name">{pedido.producto || 'Producto'}</span>
                          <span className="chef-item-quantity">1</span>
                        </div>
                      </div>
                      
                      {pedido.observaciones && (
                        <div className="chef-order-notes">
                          <strong>📝 NOTAS:</strong>
                          <p>{pedido.observaciones}</p>
                        </div>
                      )}
                      
                      <div style={{
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginTop: 'var(--chef-space-md)',
                        padding: 'var(--chef-space-md)',
                        background: 'var(--chef-bg-success)',
                        borderRadius: 'var(--chef-radius-md)',
                        border: '2px solid var(--chef-green)'
                      }}>
                        <span style={{
                          fontSize: 'var(--chef-text-md)', 
                          fontWeight: '700', 
                          color: 'var(--chef-green)'
                        }}>
                          {pedido.direccion && pedido.direccion.toLowerCase() !== 'retiro en local' ? 
                            '🚚 DOMICILIO' : '🏪 RETIRO'
                          }
                        </span>
                        <span style={{
                          fontSize: 'var(--chef-text-xl)', 
                          fontWeight: '900', 
                          color: 'var(--chef-green)'
                        }}>
                          ${(pedido.precio_total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {pedido.direccion && pedido.direccion.toLowerCase() !== 'retiro en local' && (
                      <div className="chef-delivery-address">
                        <FiMapPin />
                        <span>{pedido.direccion}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CajeroPanel;