import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, FiDollarSign, FiCheckCircle, FiTruck, FiClock, FiUser, 
  FiPhone, FiMapPin, FiRefreshCw, FiSearch, FiCreditCard, FiShoppingBag
} from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import './CajaPanel.css';

const CajaPanel = ({ onBack, setRoute }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('activos');
  const [searchTerm, setSearchTerm] = useState('');

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

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', pedidoId);
      
      if (error) throw error;
      
      // Actualizar el estado local
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
      ));
    } catch (error) {
      console.error('Error updating estado:', error);
      alert('Error al cambiar el estado del pedido');
    }
  };

  const filtrarPedidos = () => {
    let pedidosFiltrados = pedidos;

    // Filtrar por estado
    if (filter === 'activos') {
      pedidosFiltrados = pedidosFiltrados.filter(p => 
        ['LISTO', 'PAGADO', 'EN_ENTREGA'].includes(p.estado)
      );
    } else if (filter !== 'todos') {
      pedidosFiltrados = pedidosFiltrados.filter(p => p.estado === filter.toUpperCase());
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      pedidosFiltrados = pedidosFiltrados.filter(p => 
        p.nombre?.toLowerCase().includes(term) ||
        p.producto?.toLowerCase().includes(term) ||
        p.telefono?.includes(term)
      );
    }

    return pedidosFiltrados.sort((a, b) => {
      // Priorizar por estado: LISTO -> PAGADO -> EN_ENTREGA
      const priority = { 'LISTO': 3, 'PAGADO': 2, 'EN_ENTREGA': 1 };
      return (priority[b.estado] || 0) - (priority[a.estado] || 0);
    });
  };

  const getPedidosListos = () => pedidos.filter(p => p.estado === 'LISTO').length;
  const getPedidosPagados = () => pedidos.filter(p => p.estado === 'PAGADO').length;
  const getPedidosEnEntrega = () => pedidos.filter(p => p.estado === 'EN_ENTREGA').length;
  const getTotalVentasHoy = () => {
    const hoy = new Date().toISOString().split('T')[0];
    return pedidos
      .filter(p => {
        const fechaPedido = new Date(p.created_at).toISOString().split('T')[0];
        return fechaPedido === hoy && ['PAGADO', 'ENTREGADO'].includes(p.estado);
      })
      .reduce((total, p) => total + (p.precio_total || 0), 0);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Recién';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const pedidosFiltrados = filtrarPedidos();

  return (
    <div className="caja-container">
      {/* Cash Register Header */}
      <div className="caja-header">
        <div className="caja-title">
          <h1>💰 Caja</h1>
        </div>
        <div className="caja-actions">
          <button onClick={fetchPedidos} disabled={loading} className="caja-btn caja-btn-secondary">
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button onClick={onBack} className="caja-btn caja-btn-ghost">
            <FiArrowLeft />
            Volver
          </button>
        </div>
      </div>

      {/* Cash Register Stats */}
      <div className="caja-stats">
        <div className={`caja-stat ${getPedidosListos() > 0 ? 'ready' : ''}`}>
          <div className="caja-stat-value">{getPedidosListos()}</div>
          <div className="caja-stat-label">Listos para Cobrar</div>
        </div>
        
        <div className={`caja-stat ${getPedidosPagados() > 0 ? 'paid' : ''}`}>
          <div className="caja-stat-value">{getPedidosPagados()}</div>
          <div className="caja-stat-label">Pagados</div>
        </div>
        
        <div className={`caja-stat ${getPedidosEnEntrega() > 0 ? 'delivering' : ''}`}>
          <div className="caja-stat-value">{getPedidosEnEntrega()}</div>
          <div className="caja-stat-label">En Entrega</div>
        </div>
        
        <div className="caja-stat sales">
          <div className="caja-stat-value">${getTotalVentasHoy().toLocaleString()}</div>
          <div className="caja-stat-label">Ventas Hoy</div>
        </div>
      </div>

      {/* Cash Register Filters */}
      <div className="caja-filters">
        <div className="caja-search">
          <FiSearch className="caja-search-icon" />
          <input
            type="text"
            placeholder="Buscar pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="caja-filter-buttons">
          <button
            className={`caja-filter-btn ${filter === 'activos' ? 'active' : ''}`}
            onClick={() => setFilter('activos')}
          >
            🔥 Activos
          </button>
          <button
            className={`caja-filter-btn ${filter === 'LISTO' ? 'active' : ''}`}
            onClick={() => setFilter('LISTO')}
          >
            💰 Listos para Cobrar
          </button>
          <button
            className={`caja-filter-btn ${filter === 'PAGADO' ? 'active' : ''}`}
            onClick={() => setFilter('PAGADO')}
          >
            💳 Pagados
          </button>
          <button
            className={`caja-filter-btn ${filter === 'EN_ENTREGA' ? 'active' : ''}`}
            onClick={() => setFilter('EN_ENTREGA')}
          >
            🚚 En Entrega
          </button>
        </div>
      </div>

      {/* Cash Register Orders */}
      <div className="caja-orders">
        {loading ? (
          <div className="caja-loading">
            <FiRefreshCw className="caja-loading-icon" />
            <div>Cargando pedidos...</div>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="caja-empty">
            <FiShoppingBag className="caja-empty-icon" />
            <h3>No hay pedidos</h3>
            <p>No se encontraron pedidos para caja</p>
          </div>
        ) : (
          <div className="caja-orders-grid">
            {pedidosFiltrados.map(pedido => {
              return (
                <div key={pedido.id} className={`caja-order-card ${pedido.estado === 'LISTO' ? 'ready' : ''} ${pedido.estado === 'PAGADO' ? 'paid' : ''} ${pedido.estado === 'EN_ENTREGA' ? 'delivering' : ''}`}>
                  <div className="caja-order-header">
                    <div className="caja-customer-info">
                      <div className="caja-customer-avatar">
                        {pedido.nombre?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="caja-customer-details">
                        <h4>{pedido.nombre || 'Cliente'}</h4>
                        <p>
                          <FiPhone />
                          {pedido.telefono || 'Sin teléfono'}
                        </p>
                      </div>
                    </div>
                    <div className="caja-order-status">
                      <span className="caja-status-badge">
                        {pedido.estado === 'LISTO' && '💰'}
                        {pedido.estado === 'PAGADO' && '💳'}
                        {pedido.estado === 'EN_ENTREGA' && '🚚'}
                        {pedido.estado}
                      </span>
                      <span className="caja-time-badge">
                        <FiClock />
                        {formatTime(pedido.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="caja-order-content">
                    <div className="caja-order-info">
                      <div className="caja-order-item">
                        <span className="caja-order-label">Producto</span>
                        <span className="caja-order-value">{pedido.producto || 'Producto'}</span>
                      </div>
                      
                      <div className="caja-order-item">
                        <span className="caja-order-label">Tipo</span>
                        <span className="caja-order-value">
                          {pedido.direccion && pedido.direccion.toLowerCase() !== 'retiro en local' ? 
                            '🚚 Domicilio' : '🏪 Retiro'
                          }
                        </span>
                      </div>
                      
                      <div className="caja-order-item">
                        <span className="caja-order-label">Precio</span>
                        <span className="caja-order-price">${(pedido.precio_total || 0).toLocaleString()}</span>
                      </div>
                      
                      <div className="caja-order-item">
                        <span className="caja-order-label">Estado</span>
                        <span className="caja-order-value">
                          {pedido.estado === 'LISTO' && '💰 Listo para Cobrar'}
                          {pedido.estado === 'PAGADO' && '💳 Pagado'}
                          {pedido.estado === 'EN_ENTREGA' && '🚚 En Entrega'}
                        </span>
                      </div>
                      
                      {pedido.direccion && pedido.direccion.toLowerCase() !== 'retiro en local' && (
                        <div className="caja-order-item">
                          <span className="caja-order-label">Dirección</span>
                          <span className="caja-order-value">{pedido.direccion}</span>
                        </div>
                      )}
                    </div>

                    <div className="caja-order-actions">
                      {pedido.estado === 'LISTO' && (
                        <div style={{display: 'flex', gap: '0.75rem'}}>
                          <button
                            className="caja-action-btn prepare"
                            onClick={() => cambiarEstado(pedido.id, 'PAGADO')}
                            style={{flex: 1}}
                          >
                            <FiDollarSign />
                            Cobrar
                          </button>
                          <button
                            className="caja-action-btn deliver"
                            onClick={() => cambiarEstado(pedido.id, 'EN_ENTREGA')}
                            style={{flex: 1}}
                          >
                            <FiTruck />
                            Entregar
                          </button>
                        </div>
                      )}
                      {pedido.estado === 'PAGADO' && (
                        <button
                          className="caja-action-btn deliver"
                          onClick={() => cambiarEstado(pedido.id, 'EN_ENTREGA')}
                        >
                          <FiTruck />
                          Enviar a Entrega
                        </button>
                      )}
                      {pedido.estado === 'EN_ENTREGA' && (
                        <button
                          className="caja-action-btn complete"
                          onClick={() => cambiarEstado(pedido.id, 'ENTREGADO')}
                        >
                          <FiCheckCircle />
                          Marcar Entregado
                        </button>
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

export default CajaPanel;